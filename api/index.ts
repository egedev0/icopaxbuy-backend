import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { Client } from 'pg';
import { Wallet } from 'ethers';

let cachedExpressApp: ReturnType<typeof express> | undefined;

// Allow-list can be overridden via env (comma separated). Fallback covers prod, localhost and vercel previews
const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.buy.icopax.com',
  'https://buy.icopax.com',
  'https://icopax.com',
  'https://www.icopax.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173'
];
const ENV_ALLOWED = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = (ENV_ALLOWED.length ? ENV_ALLOWED : DEFAULT_ALLOWED_ORIGINS);

// Additionally allow common preview host patterns
const ALLOWED_SUFFIXES = [
  '.vercel.app', // any vercel preview or production
  '.icopax.com'
];

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true; // non-browser or server-to-server
  try {
    const url = new URL(origin);
    const normalized = `${url.protocol}//${url.host}`;
    if (ALLOWED_ORIGINS.includes(normalized)) return true;
    return ALLOWED_SUFFIXES.some(suf => normalized.endsWith(suf));
  } catch {
    return false;
  }
};

async function bootstrapServer() {
  if (cachedExpressApp) return cachedExpressApp;
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  nestApp.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      cb(null, isAllowedOrigin(origin));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  await nestApp.init();
  cachedExpressApp = expressApp;
  return cachedExpressApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = (req.url || '').split('?')[0];
  const reqOrigin = (req.headers['origin'] as string) || '';
  const allow = isAllowedOrigin(reqOrigin);
  if (allow && reqOrigin) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  // Lightweight health/root endpoints without bootstrapping Nest
  if (url === '/' || url === '/health' || url === '/api' || url === '/api/health') {
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    return res.status(200).send('ICOPAX API OK');
  }
  if (url === '/debug/signer') {
    try {
      const pk = process.env.PRIVATE_KEY;
      if (!pk) return res.status(500).json({ error: 'PRIVATE_KEY not set' });
      const w = new Wallet(pk);
      return res.status(200).json({ address: w.address });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message ?? 'unknown' });
    }
  }
  // DB health that does not require Nest bootstrap
  if (url === '/db/health' || url === '/api/db/health') {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ ok: false, error: 'DATABASE_URL is not set' });
    }
    const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      try { await client.end(); } catch {}
      return res.status(500).json({ ok: false, error: e?.message ?? 'unknown' });
    }
  }
  if (url === '/favicon.ico' || url === '/favicon.png') {
    return res.status(204).end();
  }
  const app = await bootstrapServer();
  return app(req as unknown as Request, res as unknown as Response);
}


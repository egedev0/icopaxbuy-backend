import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import serverlessExpress from '@vendia/serverless-express';

let server: ReturnType<typeof serverlessExpress> | undefined;

const ALLOWED_ORIGINS = [
  'https://www.buy.icopax.com',
  'https://buy.icopax.com',
  'https://icopax.com',
  'https://www.icopax.com'
];

async function bootstrapServer() {
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  nestApp.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      cb(null, ALLOWED_ORIGINS.includes(origin));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  await nestApp.init();
  return serverlessExpress({ app: expressApp });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = (req.url || '').split('?')[0];
  const reqOrigin = (req.headers['origin'] as string) || '';
  const allow = !reqOrigin || ALLOWED_ORIGINS.includes(reqOrigin);
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
  if (url === '/favicon.ico' || url === '/favicon.png') {
    return res.status(204).end();
  }
  if (!server) {
    server = await bootstrapServer();
  }
  return server(req as unknown as Request, res as unknown as Response);
}


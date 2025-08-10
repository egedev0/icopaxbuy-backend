import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import serverlessExpress from '@vendia/serverless-express';

let server: ReturnType<typeof serverlessExpress> | undefined;

async function bootstrapServer() {
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  nestApp.enableCors();
  await nestApp.init();
  return serverlessExpress({ app: expressApp });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!server) {
    server = await bootstrapServer();
  }
  return server(req as unknown as Request, res as unknown as Response);
}


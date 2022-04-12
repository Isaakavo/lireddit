import { Request, Response } from 'express';
import {Redis} from 'ioredis'
import session from 'express-session';

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

export type MyContext = {
  req: Request & { session: session.Session };
  res: Response;
  redis: Redis
};

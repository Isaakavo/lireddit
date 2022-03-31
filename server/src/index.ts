import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

import cors from 'cors';

import { createClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = createClient({
    legacyMode: true,
  });

  redisClient.connect().catch(console.error);

  app.set('trust proxy', !__prod__);
  // app.use(
  //   cors({
  //     origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
  //     credentials: true,
  //   })
  // );
  

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient as any,
        disableTouch: true,
      }),
      saveUninitialized: false,
      secret: 'skdfhalkhflkabdsfkl',
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: 'none',
        secure: !__prod__, //cookie only works in https
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  await apolloServer.start();

  //when the cookie is not register in the graphql server use this option:
  // cors: {
  //   origin: 'https://studio.apollographql.com',
  //   credentials: true,
  // },

  apolloServer.applyMiddleware({
    app,
    cors: {
    origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
    credentials: true,
  },
  });

  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
};

main().catch((err) => {
  console.error(err);
});

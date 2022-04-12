import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { COOKIE_NAME, __prod__ } from './constants';
import { conn } from './data-source';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
  conn
    .initialize()
    .then(() => {
      console.log('Data sources has been initialized!');
    })
    .catch((err) => {
      console.log('Error during data source initialization!', err);
    });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  // redis.connect().catch(console.error);

  app.set('trust proxy', !__prod__);
  // app.set('x-forwarded-proto', 'https');
  // app.use(
  //   cors({
  //     origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
  //     credentials: true,
  //   })
  // );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      saveUninitialized: false,
      secret: 'skdfhalkhflkabdsfkl',
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: false,
        sameSite: 'lax',
        secure: __prod__, //cookie only works in https
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
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

import "reflect-metadata"
import { DataSource } from "typeorm";
import { Post } from "./entities/Posts";
import { User } from "./entities/User";
import path from "path";

export const conn = new DataSource({
  type: 'postgres',
  database: 'lireddit2',
  username: 'postgres',
  password: 'Weisses2',
  logging: true,
  synchronize: true,
  entities: [Post, User],
  migrations: [path.join(__dirname, "./migrations/*.{js,ts}")],
  
})
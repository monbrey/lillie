import { Db, MongoClient } from "mongodb";

export const connectDb = async (): Promise<Db> => {
  if (!process.env.DB_URI) throw new Error("[Database] Database URL not defined");

  const client = new MongoClient(process.env.DB_URI);
  await client.connect();
  return client.db("lilybot");
};

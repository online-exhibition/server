import {MongoClient} from 'mongodb';

let client;

/**
 * Connect to mongodb and select the database
 * @param  {object} config The database configuration
 */
export async function connectDatabase(config) {
  if (!client || !client.isConnected()) {
    const options = {...config.options};
    options.auth = {...options.auth, password: process.env.DATABASE_PASSWORD};
    client = await MongoClient.connect(config.url, options);
  }
  return client.db(config.name);
}

import app, { connectToMongo } from '../server';

export default async function handler(req: any, res: any) {
  try {
    await connectToMongo();
  } catch (err) {
    // Continue even if database connection has temporary latency
  }
  return app(req, res);
}

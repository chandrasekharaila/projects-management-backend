import { createClient } from "redis";
import ApiError from "../utils/ApiError.js";

let client;

const connectRedis = async () => {
  try {
    client = await createClient({ url: process.env.REDIS_URL });
    if (!client) {
      console.log("failed to connect to redis");
      process.exit(1);
    }
  } catch (error) {
    console.log("failed to connect to redis cloud ", error);
    process.exit(1);
  }
  return client;
};

const getRedisClient = () => {
  if (!client) {
    throw new ApiError(400, "redis connection failed");
  }
  return client;
};

export { connectRedis, getRedisClient };

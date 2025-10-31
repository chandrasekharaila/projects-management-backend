import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import { connectRedis } from "./db/redisClient.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("connected to mongoDB database");

    await connectRedis();
    console.log("conncetd to redis");

    app.listen(port, () => {
      console.log("server is live at port ", port);
    });
  } catch (error) {
    console.log("server start failed", error);
    process.exit(1);
  }
};

startServer();

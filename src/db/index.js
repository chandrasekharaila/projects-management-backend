import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("database is live");
  } catch (error) {
    console.log("mongodb connection failed", error);
    process.exit(1);
  }
};

export default connectDB;

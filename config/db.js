import mongoose from "mongoose";

export const connectDb = async () => {
  const db = await mongoose.connect(`${process.env.MONGO_URL}`);
  console.log(`mongo db connected successfully at ${db.port}`.bgGreen.white);
  try {
  } catch (e) {
    console.log(`db error ${e}`.bgRed.white);
  }
};

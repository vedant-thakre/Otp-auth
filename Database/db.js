import mongoose from "mongoose";
import colors from "colors";


export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected".cyan.bold))
    .catch((err) => console.log(err));
};

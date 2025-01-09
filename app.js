import express from "express";
import mongoose from "mongoose";
import astrologerRoutes from "./routes/astrologerRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected successfully")).catch((e) => {console.error(e)});

app.use("/astrologers", astrologerRoutes);

app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});

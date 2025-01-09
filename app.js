import express from "express";
import mongoose from "mongoose";
import astrologerRoutes from "./routes/astrologerRoutes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

app.use("/astrologers", astrologerRoutes);

if (process.env.NODE_ENV !== "test") {
    mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected successfully")).catch((e) => console.error(e));

    app.listen(5000, () => {
        console.log(`Server running on port 5000`);
    });
}

export default app;
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://razorpay-e-commerce-app.vercel.app/",
    ],
    credentials: true,
  }),
);
app.use(express.json());

const mongoUri = process.env.MONGO_URI || "";
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const rzKeyId = process.env.RAZORPAY_KEY_ID;
const rzKeySecret = process.env.RAZORPAY_KEY_SECRET;

async function start() {
  if (!mongoUri) {
    console.error("MONGO_URI is required");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      paymentsConfigured: Boolean(rzKeyId && rzKeySecret),
    });
  });
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/payments", paymentRoutes);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentId: { type: String },
    orderStatus: { type: String, enum: ["pending", "paid", "failed", "shipped", "delivered"], default: "pending" },
    razorpayOrderId: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model("Order", orderSchema)

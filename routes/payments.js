import { Router } from "express"
import Razorpay from "razorpay"
import crypto from "crypto"
import { auth } from "../middleware/auth.js"
import Order from "../models/Order.js"

const router = Router()

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return null
  return { keyId, keySecret }
}

router.post("/create-order", auth, async (req, res) => {
  const { amount, currency, receipt, orderId } = req.body
  if (!amount) return res.status(400).json({ message: "Amount required" })
  const cfg = getRazorpayConfig()
  if (!cfg) return res.status(500).json({ message: "Razorpay keys not configured" })
  const client = new Razorpay({ key_id: cfg.keyId, key_secret: cfg.keySecret })
  const opts = {
    amount: Number(amount) * 100,
    currency: currency || "INR",
    receipt: receipt || `rcpt_${Date.now()}`
  }
  const order = await client.orders.create(opts)
  if (orderId) {
    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: order.id })
  }
  res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: cfg.keyId })
})

router.post("/verify", auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Invalid payload" })
  }
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const cfg = getRazorpayConfig()
  if (!cfg) return res.status(500).json({ message: "Razorpay keys not configured" })
  const expected = crypto.createHmac("sha256", cfg.keySecret).update(body).digest("hex")
  const valid = expected === razorpay_signature
  if (!valid) {
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { orderStatus: "failed" })
    }
    return res.status(400).json({ message: "Signature verification failed" })
  }
  if (orderId) {
    await Order.findByIdAndUpdate(orderId, { orderStatus: "paid", paymentId: razorpay_payment_id })
  }
  res.json({ ok: true })
})

export default router

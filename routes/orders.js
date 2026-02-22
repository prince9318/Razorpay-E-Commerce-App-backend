import { Router } from "express"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import { auth, admin } from "../middleware/auth.js"

const router = Router()

router.get("/", auth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
  res.json(orders)
})

router.get("/all", auth, admin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 })
  res.json(orders)
})

router.post("/", auth, async (req, res) => {
  const { products, totalAmount } = req.body
  if (!Array.isArray(products) || !totalAmount) {
    return res.status(400).json({ message: "Invalid payload" })
  }

  // Check stock availability and reduce stock
  for (const item of products) {
    const product = await Product.findById(item.productId)
    if (!product) {
      return res.status(404).json({ message: `Product ${item.productId} not found` })
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}` })
    }
    // Reduce stock
    product.stock -= item.quantity
    await product.save()
  }

  const order = await Order.create({ userId: req.user.id, products, totalAmount, orderStatus: "pending" })
  res.status(201).json(order)
})

router.put("/:id/status", auth, admin, async (req, res) => {
  const { status } = req.body
  const valid = ["pending", "paid", "failed", "shipped", "delivered"]
  if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status" })
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true })
  if (!order) return res.status(404).json({ message: "Not found" })
  res.json(order)
})

export default router

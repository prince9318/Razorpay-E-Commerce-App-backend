import { Router } from "express"
import Product from "../models/Product.js"
import { auth, admin } from "../middleware/auth.js"

const router = Router()

router.get("/", async (req, res) => {
  const { q, min, max } = req.query
  const filter = {}
  if (q) {
    filter.title = { $regex: String(q), $options: "i" }
  }
  if (min || max) {
    filter.price = {}
    if (min) filter.price.$gte = Number(min)
    if (max) filter.price.$lte = Number(max)
  }
  const items = await Product.find(filter).sort({ createdAt: -1 })
  res.json(items)
})

router.get("/:id", async (req, res) => {
  const item = await Product.findById(req.params.id)
  if (!item) return res.status(404).json({ message: "Not found" })
  res.json(item)
})

router.post("/", auth, admin, async (req, res) => {
  const { title, price, description, image, stock } = req.body
  const product = await Product.create({ title, price, description, image, stock })
  res.status(201).json(product)
})

router.put("/:id", auth, admin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!product) return res.status(404).json({ message: "Not found" })
  res.json(product)
})

router.delete("/:id", auth, admin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ message: "Not found" })
  res.json({ ok: true })
})

export default router

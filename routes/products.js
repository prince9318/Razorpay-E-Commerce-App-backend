import { Router } from "express"
import Product from "../models/Product.js"
import { auth, admin } from "../middleware/auth.js"

const router = Router()

router.get("/", async (req, res) => {
  const { q, min, max, page, limit } = req.query
  const filter = {}
  if (q) {
    filter.title = { $regex: String(q), $options: "i" }
  }
  if (min || max) {
    filter.price = {}
    if (min) filter.price.$gte = Number(min)
    if (max) filter.price.$lte = Number(max)
  }

  const requestedPage = Math.max(Number(page) || 1, 1)
  const requestedLimit = Math.max(Number(limit) || 12, 1)
  const total = await Product.countDocuments(filter)
  const totalPages = Math.max(Math.ceil(total / requestedLimit), 1)
  const currentPage = Math.min(requestedPage, totalPages)
  const skip = (currentPage - 1) * requestedLimit

  const items = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(requestedLimit)

  res.json({
    items,
    total,
    page: currentPage,
    limit: requestedLimit,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  })
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

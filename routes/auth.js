import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = Router()

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing fields" })
  }
  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(409).json({ message: "Email already registered" })
  }
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  const role = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === email ? "admin" : "user"
  const user = await User.create({ name, email, password: hash, role })
  return res.json({ id: user._id })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" })
  }
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" })
  }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" })
  }
  const secret = process.env.JWT_SECRET || ""
  const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, secret, { expiresIn: "7d" })
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
})

export default router

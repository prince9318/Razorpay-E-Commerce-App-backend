import jwt from "jsonwebtoken"

export function auth(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  try {
    const secret = process.env.JWT_SECRET || ""
    const payload = jwt.verify(token, secret)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export function admin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" })
  }
  next()
}

const jwt = require("jsonwebtoken")

module.exports = async (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(403).json({ err: "Token not found" })
    }
    
    const authHeader = req.headers.authorization.split(" ")
    if (authHeader.length !== 2) {
      return res.status(403).json({ err: "Invalid token" })
    }
    
    try {
        const token = authHeader[1];
        const decoded = jwt.verify(token, req.app.get("jwtkey"))

        if (decoded.role !== 'helper')
            return res.status(401).json({ err: 'Unauthorized access' })

        next()
    } catch (e) {
      return res.status(403).json({ err: "Invalid token" })
    }
}

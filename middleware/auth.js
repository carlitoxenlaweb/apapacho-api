const db = require("../connection/database")
const jwt = require("jsonwebtoken")

module.exports = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ err: "Token not found" })
  }
  
  const authHeader = req.headers.authorization.split(" ")
  if (authHeader.length !== 2) {
    return res.status(401).json({ err: "Invalid token" })
  }
  
  try {
    const token = authHeader[1];
    const decoded = jwt.verify(token, req.app.get("jwtkey"))

    let rUser, fUser

    switch (decoded.role) {
      case 'user':
        [rUser, fUser] = await db.query('SELECT * FROM users WHERE email = ? AND enabled = 1 LIMIT 1', [ decoded.email ])    
        break;
          
      case 'helper':
        [rUser, fUser] = await db.query('SELECT * FROM helpers WHERE email = ? AND enabled = 1 LIMIT 1', [ decoded.email ])    
        break;

      default:
        return res.status(401).json({ err: 'Invalid token' })
    }

    if (rUser.length !== 1) return res.status(401).json({ err: 'Email not registered' })

    req.user = rUser[0]
    req.user.role = decoded.role

    next()
  } catch (e) {
    return res.status(401).json({ err: "Invalid token" })
  }
}

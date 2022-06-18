const crypto = require("crypto")

const generateSalt = (rounds) => {
  if (rounds >= 15) {
    throw new Error(`${rounds} is greater than 15,Must be less that 15`)
  }
  if (typeof rounds !== "number") {
    throw new Error("rounds param must be a number")
  }
  if (rounds == null) {
    rounds = 12
  }
  return crypto
    .randomBytes(Math.ceil(rounds / 2))
    .toString("hex")
    .slice(0, rounds)
}

const hasher = (password, salt) => {
  let hash = crypto.createHmac("sha512", salt)
  hash.update(password)
  const value = hash.digest("hex")
  return {
    salt: salt,
    hashedpassword: value,
  }
}

let hash = (password, salt) => {
  if (password == null || salt == null) {
    throw new Error("Must Provide Password and salt values")
  }
  if (typeof password !== "string" || typeof salt !== "string") {
    throw new Error(
      "password must be a string and salt must either be a salt string or a number of rounds"
    )
  }
  return hasher(password, salt)
}

const compare = (password, hash) => {
  if (password == null || hash == null) {
    throw new Error("password and hash is required to compare")
  }
  if (typeof password !== "string" || typeof hash !== "object") {
    throw new Error("password must be a String and hash must be an Object")
  }
  let passwordData = hasher(password, hash.salt)
  return passwordData.hashedpassword === hash.hashedpassword
}

module.exports = {
  hashPassword: (password) => hash(password, generateSalt(12)),
  randomToken: () => Math.floor(100000 + Math.random() * 900000),
  validateHash: (password, salt, hashedpassword) => compare(password, { salt, hashedpassword })
}

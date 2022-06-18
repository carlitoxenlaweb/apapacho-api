const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const db = require('../connection/database')
const mailer = require('../services/mailer')
const hasher = require('../services/hasher')

const getRandomToken = () => Math.floor(100000 + Math.random() * 900000)

router.post('/signin/:role', async (req, res) => {
  //LATER USE helper AND admin ROLES
})

router.post('/signin', async (req, res) => {
  const [rUser, fUser] = await db.query('SELECT id, alias, firstname, lastname, phone, email, address, birthday, birthday_hour, enabled, remaining_credits, salt, password FROM users WHERE email = ? LIMIT 1', [
    req.body.email
  ])

  if (rUser.length !== 1) return res.status(401).json({ err: 'Email not registered' })      
  if (rUser[0].enabled !== 1) return res.status(401).json({ err: 'User disabled' })
  if (!hasher.validateHash(req.body.password, rUser[0].salt, rUser[0].password)) return res.status(401).json({ err: 'Wrong email/password combination' })

  const accessToken = jwt.sign({ email: rUser[0].email, role: 'user' }, req.app.get('jwtkey'), { expiresIn: 1440 })
  const refreshToken = jwt.sign({ email: rUser[0].email, role: 'user' }, req.app.get('jwtkey'), { expiresIn: 64800 })

  await db.query('UPDATE users SET access_token = ?, refresh_token = ? WHERE id = ?', [
    accessToken, refreshToken, rUser[0].id
  ])

  return res.status(200).json({
    firstname: rUser[0].firstname,
    lastname: rUser[0].lastname,
    phone: rUser[0].phone,
    email: rUser[0].email,
    address: rUser[0].address,
    birthday: rUser[0].birthday,
    birthday_hour: rUser[0].birthday_hour,
    token: accessToken
  })
})

router.post('/signup', async (req, res) => {
  const [rCheck, fCheck] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [ req.body.email ])  
  if (rCheck.length == 1) return res.status(403).json({ err: 'Email already registered' })

  const password = hasher.hashPassword(req.body.password)

  const [rNew, fNew] = await db.query('INSERT INTO users(alias, firstname, lastname, phone, email, address, birthday, birthday_hour, salt, password, enabled) VALUES (?,?,?,?,?,?,?,?,?,?,1)', [
    req.body.alias,
    req.body.firstname,
    req.body.lastname,
    req.body.phone,
    req.body.email,
    req.body.address,
    req.body.birthday,
    req.body.birthday_hour,
    password.salt,
    password.hashedpassword
  ])
  
  const token = getRandomToken()
  await db.query('INSERT INTO users_tokens(user_id, token, type) VALUES (?,?,\'account_activation\')', [
    rNew.insertId,
    token
  ])

  await mailer.sendWelcomeEmail(req.body.email, { token })
  return res.status(200).json({ msg: 'Activation token sended' })
})

router.post('/activate', async (req, res) => {
  const [rToken, fToken] = await db.query('SELECT id, user_id FROM users_tokens WHERE token = ? AND type = \'account_activation\' LIMIT 1', [
    req.body.token
  ])

  if (rToken.length !== 1) return res.status(401).json({ err: 'Invalid token' })
  
  await db.query('UPDATE users SET enabled = 1 WHERE id = ?', [ rToken[0].user_id ])
  await db.query('DELETE FROM users_tokens WHERE id = ?', [ rToken[0].id ])

  return res.status(200).json({ msg: 'Account enabled' })
})

router.post('/forgot', async (req, res) => {
  const [rUser, fUser] = await db.query('SELECT id, enabled FROM users WHERE email = ? LIMIT 1', [
    req.body.email
  ])

  if (rUser.length !== 1) return res.status(401).json({ err: 'Email not registered' })
  if (rUser[0].enabled !== 1) return res.status(401).json({ err: 'User disabled' })

  const token = getRandomToken()
  await db.query('INSERT INTO users_tokens(user_id, token, type) VALUES (?,?,\'password_recover\')', [
    rUser[0].id,
    token
  ])

  mailer.sendRecoverEmail(req.body.email, { token })
  return res.status(200).json({ msg: 'Recover token sended' })
})

router.post('/forgot/confirm', async (req, res) => {
  const [rToken, fToken] = await db.query('SELECT id, user_id FROM users_tokens WHERE token = ? AND type = \'password_recover\' LIMIT 1', [
    req.body.token
  ])

  if (rToken.length !== 1) return res.status(401).json({ err: 'Invalid token' })

  const password = hasher.hashPassword(req.body.password)
  
  await db.query('UPDATE users SET salt = ?, password = ? WHERE user_id = ?', [ password.salt, password.hashedpassword, rToken[0].user_id ])
  await db.query('DELETE FROM users_tokens WHERE id = ?', [ rToken[0].id ])

  return res.status(200).json({ msg: 'Password updated' })
})

router.get('/token/refresh', async (req, res) => {
  const [rUser, fUser] = await db.query('SELECT id FROM users WHERE access_token = ? LIMIT 1', [
    req.query.token
  ])

  if (rUser.length !== 1) return res.status(401).json({ err: 'Invalid token' })

  const decoded = jwt.decode(req.query.token, req.app.get("jwtkey"))
  if (decoded.role !== 'user') return res.status(401).json({ err: 'Invalid token' })

  try {
    const [rNewToken, fNewToken] = await db.query('SELECT refresh_token FROM users WHERE id = ? LIMIT 1', [
      rUser[0].id
    ])

    const validation = jwt.verify(rNewToken[0].refresh_token, req.app.get("jwtkey"))
    if (validation.role !== 'user') return res.status(401).json({ err: 'Invalid token' })

    const accessToken = jwt.sign({ email: validation.email, role: 'user' }, req.app.get('jwtkey'), { expiresIn: 1440 })
    const refreshToken = jwt.sign({ email: validation.email, role: 'user' }, req.app.get('jwtkey'), { expiresIn: 86400 })

    await db.query('UPDATE users SET access_token = ?, refresh_token = ? WHERE id = ?', [
      accessToken, refreshToken, rUser[0].id
    ])
    
    return res.status(200).json({ message: accessToken })
  } catch (e) {
    return res.status(200).json({ message: "token expired" })
  }
})

module.exports = router
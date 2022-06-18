const express = require('express')
const router = express.Router()
const db = require('../connection/database')

router.post('/state', async (req, res) => {
    const [rState, fState] = await db.query('INSERT INTO users_states (user_id, state) VALUES (?,?)', [ req.user.id, req.body.state ])
    return res.status(200).json({ message: 'ok' })
})

router.get('/', async (req, res) => {
    const [rUser, fUser] = await db.query('SELECT alias, firstname, lastname, phone, email, address, birthday, birthday_hour FROM users WHERE id = ? LIMIT 1', [ req.user.id ])
    return res.status(200).json(rUser[0])
})

router.get('/credits', async (req, res) => {
    const [rUser, fUser] = await db.query('SELECT remaining_credits FROM users WHERE id = ? LIMIT 1', [ req.user.id ])
    return res.status(200).json(rUser[0])
})

router.patch('/', async (req, res) => {
    if (!!req.body.alias) {
        await db.query('UPDATE users SET alias = ? WHERE id = ?', [ req.body.alias, req.user.id ])
    }

    if (!!req.body.firstname) {
        await db.query('UPDATE users SET firstname = ? WHERE id = ?', [ req.body.firstname, req.user.id ])
    }
    
    if (!!req.body.lastname) {
        await db.query('UPDATE users SET lastname = ? WHERE id = ?', [ req.body.lastname, req.user.id ])
    }
    
    if (!!req.body.phone) {
        await db.query('UPDATE users SET phone = ? WHERE id = ?', [ req.body.phone, req.user.id ])
    }
    
    if (!!req.body.email) {
        await db.query('UPDATE users SET email = ? WHERE id = ?', [ req.body.email, req.user.id ])
    }
    
    if (!!req.body.address) {
        await db.query('UPDATE users SET address = ? WHERE id = ?', [ req.body.address, req.user.id ])
    }
    
    if (!!req.body.birthday) {
        await db.query('UPDATE users SET birthday = ? WHERE id = ?', [ req.body.birthday, req.user.id ])
    }
    
    if (!!req.body.birthday_hour) {
        await db.query('UPDATE users SET birthday_hour = ? WHERE id = ?', [ req.body.birthday_hour, req.user.id ])
    }
    
    return res.status(200).json({ message: 'Updated' })
})

module.exports = router
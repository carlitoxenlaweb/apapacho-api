const express = require('express')
const router = express.Router()
const db = require('../connection/database')

router.get('/plans', async (req, res) => {
    const [rPlans, fPlans] = await db.query('SELECT id, name, credits, description FROM plans WHERE 1')
    return res.status(200).json(rPlans)
})

router.get('/packs', async (req, res) => {
    const [rPacks, fPacks] = await db.query('SELECT id, name, credits, description, icon FROM packs WHERE 1')
    return res.status(200).json(rPacks)
})

module.exports = router
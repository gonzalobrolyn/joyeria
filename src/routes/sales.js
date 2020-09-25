const express = require('express')
const router = express.Router()

const Sale = require('../models/Sale')
const {isAuthenticated} = require('../helpers/auth')

router.get('/sales', isAuthenticated, async (req, res) => {
  res.render('sales/sale')
})

module.exports = router
const express = require('express')
const router = express.Router()

const Sale = require('../models/Sale')
const Shop = require('../models/Shop')

const {isAuthenticated} = require('../helpers/auth')

router.get('/sales/:idLocal', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  const local = await Shop.findById(idLocal).lean()
  res.render('sales/sale', {local})
})

module.exports = router
const express = require('express')
const router = express.Router()

const Shop = require('../models/Shop')
const {isAuthenticated} = require('../helpers/auth')

router.get('/shops/add', isAuthenticated, (req, res) => {
  res.render('shops/new-shop')
})

router.post('/shops/new-shop', isAuthenticated, async (req, res) => {
  const {nombre, direccion} = req.body
  const errors = []
  if(!nombre) {
    errors.push({text: 'Escribe el nombre de Tienda'})
  }
  if(!direccion) {
    errors.push({text: 'Escribe la dirección de Tienda'})
  }
  if(errors.length > 0){
    res.render('shops/new-shop', {
      errors,
      nombre,
      direccion
    })
  } else {
    const newShop = new Shop({nombre, direccion})
    await newShop.save()
    req.flash('success_msg', 'Tienda agregada correctamente')
    res.redirect('/shops')
  }
})

router.get('/select', isAuthenticated, async (req, res) => {
  const shops = await Shop.find().lean()
  shops.shift()
  res.render('shops/select', {shops})
})

router.get('/shops/open-shop/:id', isAuthenticated, async (req, res) => {
  const idLocal = req.params.id
  const estado = 1
  await Shop.findByIdAndUpdate(idLocal, {estado})
  res.redirect('/sales/'+idLocal)
})

router.get('/shops/getin-shop/:id', isAuthenticated, async (req, res) => {
  const idLocal = req.params.id
  res.redirect('/sales/'+idLocal)
})

router.get('/shops', isAuthenticated, async (req, res) => {
  const shops = await Shop.find().lean()
  res.render('shops/all-shops', {shops})
})

router.get('/shops/edit/:id', isAuthenticated, async (req, res) => {
  const shop = await Shop.findById(req.params.id).lean()
  res.render('shops/edit-shop', {shop})
})

router.put('/shops/edit-shop/:id', isAuthenticated, async (req, res) => {
  const {nombre, direccion} = req.body
  await Shop.findByIdAndUpdate(req.params.id, {nombre, direccion})
  req.flash('success_msg', 'Tienda actualizada correctamente')
  res.redirect('/shops')
})

router.get('/shops/close-shop/:id', isAuthenticated, async (req, res) => {
  const idLocal = req.params.id
  const estado = 0
  const efectivo = 0
  await Shop.findByIdAndUpdate(idLocal, {estado, efectivo})
  res.redirect('/select')
})

router.delete('/shops/delete/:id', isAuthenticated, async (req, res) => {
  await Shop.findByIdAndDelete(req.params.id)
  req.flash('success_msg', 'Tienda eliminada correctamente')
  res.redirect('/shops')
})

module.exports = router
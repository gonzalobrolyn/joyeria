const express = require('express')
const router = express.Router()

const Shop = require('../models/Shop')
const Sale = require('../models/Sale')
const {isAuthenticated} = require('../helpers/auth')
const Pay = require('../models/Pay')

router.get('/shops/add', isAuthenticated, (req, res) => {
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('shops/new-shop', {admin})
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
  shops.shift() // elimina el elemento en el indice 0
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('shops/select', {shops, admin})
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
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('shops/all-shops', {shops, admin})
})

router.get('/shops/edit/:id', isAuthenticated, async (req, res) => {
  const shop = await Shop.findById(req.params.id).lean()
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('shops/edit-shop', {shop, admin})
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
  const tarjeta = 0
  const estadoDos = 'entregado'
  const listaVentas = await Sale.find().where({idLocal: idLocal}).where({estado: 'enDiario'}).lean()
  listaVentas.forEach(async elem => {
    await Sale.findByIdAndUpdate(elem._id, {estado: estadoDos})
  })
  const listaPagos = await Pay.find().where({idLocal: idLocal}).where({estado: 'enDiario'}).lean()
  listaPagos.forEach(async elem => {
    await Pay.findByIdAndUpdate(elem._id, {estado: estadoDos})
  })
  await Shop.findByIdAndUpdate(idLocal, {efectivo, tarjeta, estado})
  res.redirect('/select')
})

router.delete('/shops/delete/:id', isAuthenticated, async (req, res) => {
  await Shop.findByIdAndDelete(req.params.id)
  req.flash('success_msg', 'Tienda eliminada correctamente')
  res.redirect('/shops')
})

module.exports = router
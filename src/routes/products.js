const express = require('express')
const router = express.Router()

const Product = require('../models/Product')
const Value = require('../models/Value')
const Shop = require('../models/Shop')
const Stock = require('../models/Stock')
const List = require('../models/List')
const {isAuthenticated} = require('../helpers/auth')

router.get('/products/add', isAuthenticated, async (req, res) => {
  const values = await Value.find().lean().sort({fecha: 'asc'})
  values.forEach(elem => elem.precio = elem.precio.toFixed(2))
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/new-product', {values, admin})
})

router.post('/products/new-product', isAuthenticated, async (req, res) => {
  const {codigo, nombre, piezas, tipo, precio, peso, valoracion} = req.body
  const errors = []
  if(!codigo){
    errors.push({text: 'Escribe el código del producto'})
  }
  if(!nombre){
    errors.push({text: 'Escribe el nombre del producto'})
  }
  if(piezas < 1){
    errors.push({text: 'Ingresa al menos una pieza'})
  }
  if(tipo == 0){
    if(!precio){
      errors.push({text: 'Ingresa el precio del producto'})
    }
  } else if(tipo == 1){
    if(!peso){
      errors.push({text: 'Ingresa el peso del producto'})
    }
    if(!valoracion){
      errors.push({text: 'Selecciona una valoración'})
    }
  }

  if(errors.length > 0){
    const values = await Value.find().lean().sort({fecha: 'asc'})
    values.forEach(elem => elem.precio = elem.precio.toFixed(2))
    const sesion = req.user
    if (sesion.cargo == 'Administrador'){
      var admin = 'SI'
    }
    res.render('products/new-product', {
      errors,
      nombre,
      piezas,
      tipo,
      values, admin
    })
  } else {
    const newProduct = new Product({codigo, nombre, piezas, tipo, precio, peso, valoracion})
    await newProduct.save()
    req.flash('success_msg', 'Producto agregado correctamente')
    res.redirect('/products')
  }
})

router.get('/products', isAuthenticated, async (req, res) => {
  const products = await Product.find().lean().sort({codigo: 'asc'})
  products.forEach(elem => { if(elem.precio){elem.precio = elem.precio.toFixed(2)} })
  products.forEach( async elem => { if(elem.tipo){
    const valoracion = await Value.findById(elem.valoracion).lean()
    elem.valoracion = valoracion.precio.toFixed(2)
    elem.precio = (elem.peso * elem.valoracion).toFixed(2)
  } })
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/all-products', {products, admin})
})

router.get('/products/edit/:id', isAuthenticated, async (req, res) => {
  const product = await Product.findById(req.params.id).lean()
  const values = await Value.find().lean().sort({fecha: 'asc'})
  values.forEach(elem => elem.precio = elem.precio.toFixed(2))
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  if(product.valoracion){
    const value = await Value.findById(product.valoracion).lean()
    res.render('products/edit-product', {product, values, value, admin})
  } else {
    res.render('products/edit-product', {product, values, admin})
  }
})

router.put('/products/edit-product/:id', isAuthenticated, async (req, res) => {
  if(req.body.tipo == 1){
    tipo = true
    var {codigo, nombre, piezas, peso, valoracion} = req.body
  } else if(req.body.tipo == 0){
    tipo = false
    var {codigo, nombre, piezas, precio} = req.body
  }
  const errors = []
  if(!codigo){
    errors.push({text: 'Escribe el código del producto'})
  }
  if(!nombre){
    errors.push({text: 'Escribe el nombre del producto'})
  }
  if(piezas < 1){
    errors.push({text: 'Ingresa al menos una pieza'})
  }
  if(tipo == 0){
    if(!precio){
      errors.push({text: 'Ingresa el precio del producto'})
    }
  } else if(tipo == 1){
    if(!peso){
      errors.push({text: 'Ingresa el peso del producto'})
    }
    if(!valoracion){
      errors.push({text: 'Selecciona una valoración'})
    }
  }

  if(errors.length > 0){
    const _id = req.params.id
    const product = {_id, codigo, nombre, piezas, tipo, precio, peso, valoracion}
    const values = await Value.find().lean().sort({fecha: 'asc'})
    values.forEach(elem => elem.precio = elem.precio.toFixed(2))
    const sesion = req.user
    if (sesion.cargo == 'Administrador'){
      var admin = 'SI'
    }
    if(product.valoracion){
      const value = await Value.findById(product.valoracion).lean()
      res.render('products/edit-product', {errors, product, values, value, admin})
    } else {
      res.render('products/edit-product', {errors, product, values, admin})
    }

  } else {
    await Product.findByIdAndUpdate(req.params.id, {codigo, nombre, piezas, tipo, precio, peso,valoracion})
    req.flash('success_msg', 'Producto actualizado correctamente')
    res.redirect('/products')
  }
})

router.get('/products/delete/:id', isAuthenticated, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
  req.flash('success_msg', 'Producto eliminado correctamente')
  res.redirect('/products')
})

router.get('/products/deliver', isAuthenticated, async (req, res) => {
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/deliver-product', {admin})
})

router.post('/products/search-deliver', isAuthenticated, async (req, res) => {
  const {buscar} = req.body
  let listProducts = []
  const products = []
  const obj = {}
  listProducts = listProducts.concat(await Product.find({codigo: new RegExp(buscar,'i')}).lean())
  listProducts = listProducts.concat(await Product.find({nombre: new RegExp(buscar,'i')}).lean())
  listProducts.forEach(elem => {
    if (!(elem._id in obj)){
      obj[elem._id] = true
      products.push(elem)
    }
  })
  products.forEach(elem => { if(elem.precio){elem.precio = elem.precio.toFixed(2)} })
  products.forEach( async elem => { if(elem.tipo){
    const valoracion = await Value.findById(elem.valoracion).lean()
    elem.valoracion = valoracion.precio.toFixed(2)
    elem.precio = (elem.peso * elem.valoracion).toFixed(2)
  } })
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/deliver-product', {products, admin})
})

router.get('/products/add-deliver/:id', isAuthenticated, async (req, res) => {
  const product = await Product.findById(req.params.id).lean()
  const shops = await Shop.find().lean()
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/deliver-product', {product, shops, admin})
})

router.post('/products/new-deliver', isAuthenticated, async (req, res) => {
  const {idProducto, cantidad, idLocal} = req.body
  const stock = await Stock.findOne({idProducto: idProducto}).where({idLocal: idLocal}).lean()
  if (stock){
    stock.cantidad = stock.cantidad + parseInt(cantidad)
    await Stock.findByIdAndUpdate(stock._id, {cantidad: stock.cantidad})
    req.flash('success_msg', 'Producto entregado correctamente')
    res.redirect('/products/stock/'+idLocal)
  } else {
    const newItem = new Stock({idProducto, cantidad, idLocal})
    await newItem.save()
    req.flash('success_msg', 'Producto entregado correctamente')
    res.redirect('/products/stock/'+idLocal)
  }
})

router.get('/products/stock/:id', isAuthenticated, async (req, res) => {
  const items = await Stock.find({idLocal: req.params.id}).lean().populate({path: 'idProducto', options: {sort: {'codigo': 1 }}})
  const shop = await Shop.findById(req.params.id).lean()
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/stock-products', {items, shop, admin})
})

router.get('/products/stock-deliver/:id', isAuthenticated, async (req, res) => {
  const item = await Stock.findById(req.params.id).populate('idProducto').populate('idLocal').lean()
  const shops = await Shop.find().lean()
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/distribute-product', {item, shops, admin})
})

router.post('/products/new-distribute', isAuthenticated, async (req, res) => {
  const {idStock, idProducto, cantActual, cantidad, idLocal} = req.body
  const nuevaCant = parseInt(cantActual) - parseInt(cantidad) 
  await Stock.findByIdAndUpdate(idStock, {cantidad: nuevaCant})

  const stock = await Stock.findOne({idProducto: idProducto}).where({idLocal: idLocal}).lean()
  if (stock){
    stock.cantidad = stock.cantidad + parseInt(cantidad)
    await Stock.findByIdAndUpdate(stock._id, {cantidad: stock.cantidad})
    req.flash('success_msg', 'Producto entregado correctamente')
    res.redirect('/products/stock/'+idLocal)
  } else {
    const newItem = new Stock({idProducto, cantidad, idLocal})
    await newItem.save()
    req.flash('success_msg', 'Producto entregado correctamente')
    res.redirect('/products/stock/'+idLocal)
  }
})

router.get('/products/stock-quantity/:id', isAuthenticated, async (req, res) => {
  const item = await Stock.findById(req.params.id).populate('idProducto').populate('idLocal').lean()
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('products/quantity-product', {item, admin})
})

router.post('/products/update-quantity', isAuthenticated, async (req, res) => {
  const {idStock, idLocal, cantidad} = req.body
  await Stock.findByIdAndUpdate(idStock, {cantidad: cantidad})
  req.flash('success_msg', 'Cantidad corregida correctamente')
  res.redirect('/products/stock/'+idLocal)
})

router.post('/products/search-product/:idLocal', isAuthenticated, async (req, res) => {
  const {buscar} = req.body
  const idLocal = req.params.idLocal
  let listProducts = []
  const products = []
  const obj = {}
  listProducts = listProducts.concat(await Product.find({codigo: new RegExp(buscar,'i')}).lean())
  listProducts = listProducts.concat(await Product.find({nombre: new RegExp(buscar,'i')}).lean())
  listProducts.forEach(elem => {
    if (!(elem._id in obj)){
      obj[elem._id] = true
      products.push(elem)
    }
  })
  products.forEach(elem => { if(elem.precio){
    elem.precio = elem.precio.toFixed(2)
    elem.fecha = idLocal
  } })
  products.forEach( async elem => { if(elem.tipo){
    const valoracion = await Value.findById(elem.valoracion).lean()
    elem.valoracion = valoracion.precio.toFixed(2)
    elem.precio = (elem.peso * elem.valoracion).toFixed(2)
    elem.fecha = idLocal
  } })
  const local = await Shop.findById(idLocal).lean()
  const lista = await List.find().where({idLocal: idLocal}).populate('idProducto').populate('idLocal').lean()
  lista.forEach(elem => { if(elem.precio){
    elem.precio = elem.precio.toFixed(2)
    elem.precioVenta = elem.precioVenta.toFixed(2)
  } })
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  res.render('sales/sale', {products, local, lista, admin})
})

module.exports = router

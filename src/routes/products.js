const express = require('express')
const router = express.Router()

const Product = require('../models/Product')
const Value = require('../models/Value')
const {isAuthenticated} = require('../helpers/auth')

router.get('/products/add', isAuthenticated, async (req, res) => {
  const values = await Value.find().lean().sort({fecha: 'asc'})
  values.forEach(elem => elem.precio = elem.precio.toFixed(2))
  res.render('products/new-product', {values})
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
    res.render('products/new-product', {
      errors,
      nombre,
      piezas,
      tipo,
      values
    })
  } else {
    const newProduct = new Product({codigo, nombre, piezas, tipo, precio, peso, valoracion})
    await newProduct.save()
    req.flash('success_msg', 'Producto agregado correctamente')
    res.redirect('/products')
  }
})

router.get('/products', isAuthenticated, async (req, res) => {
  const products = await Product.find().lean().sort({fecha: 'desc'})
  products.forEach(elem => { if(elem.precio){elem.precio = elem.precio.toFixed(2)} })
  products.forEach( async elem => { if(elem.tipo){
    const valoracion = await Value.findById(elem.valoracion).lean()
    elem.valoracion = valoracion.precio.toFixed(2)
    elem.precio = (elem.peso * elem.valoracion).toFixed(2)
  } })
  res.render('products/all-products', {products})
})

router.get('/products/edit/:id', isAuthenticated, async (req, res) => {
  const product = await Product.findById(req.params.id).lean()
  const values = await Value.find().lean().sort({fecha: 'asc'})
  values.forEach(elem => elem.precio = elem.precio.toFixed(2))
  if(product.valoracion){
    const value = await Value.findById(product.valoracion).lean()
    res.render('products/edit-product', {product, values, value})
  } else {
    res.render('products/edit-product', {product, values})
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
    
    if(product.valoracion){
      const value = await Value.findById(product.valoracion).lean()
      res.render('products/edit-product', {errors, product, values, value})
    } else {
      res.render('products/edit-product', {errors, product, values})
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

router.post('/products/search-product', isAuthenticated, async (req, res) => {
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
  console.log(products)
  res.render('sales/sale', {products})
})

module.exports = router

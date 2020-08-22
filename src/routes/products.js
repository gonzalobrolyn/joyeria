const express = require('express')
const router = express.Router()

const Product = require('../models/Product')
const {isAuthenticated} = require('../helpers/auth')

router.get('/products/add', isAuthenticated, (req, res) => {
  res.render('products/new-product')
})

router.post('/products/new-product', isAuthenticated, async (req, res) => {
  const {nombre, descripcion} = req.body
  const errors = []
  if(!nombre) {
    errors.push({text: 'Escribe el nombre del producto'})
  }
  if(!descripcion) {
    errors.push({text: 'Escribe la descripción del producto'})
  }
  if(errors.length > 0){
    res.render('products/new-product', {
      errors,
      nombre,
      descripcion
    })
  } else {
    const newProduct = new Product({nombre, descripcion})
    await newProduct.save()
    req.flash('success_msg', 'Producto agregado correctamente')
    res.redirect('/products')
  }
})

router.get('/products', isAuthenticated, async (req, res) => {
  const products = await Product.find().lean().sort({fecha: 'desc'})
  res.render('products/all-products', {products})
})

router.get('/products/edit/:id', isAuthenticated, async (req, res) => {
  const product = await Product.findById(req.params.id).lean()
  res.render('products/edit-product', {product})
})

router.put('/products/edit-product/:id', isAuthenticated, async (req, res) => {
  const {nombre, descripcion} = req.body
  await Product.findByIdAndUpdate(req.params.id, {nombre, descripcion})
  req.flash('success_msg', 'Producto actualizado correctamente')
  res.redirect('/products')
})

router.get('/products/delete/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
  req.flash('success_msg', 'Producto eliminado correctamente')
  res.redirect('/products')
})

module.exports = router

const express = require('express')
const router = express.Router()

const Value = require('../models/Value')
const {isAuthenticated} = require('../helpers/auth')

router.get('/values/add', isAuthenticated, (req, res) => {
  res.render('values/new-value')
})

router.post('/values/new-value', isAuthenticated, async (req, res) => {
  const {nombre, precio} = req.body
  const errors = []
  if(!nombre) {
    errors.push({text: 'Escribe el nombre de la Valoración'})
  }
  if(!precio) {
    errors.push({text: 'Escribe el precio de la Valoración'})
  }
  if(errors.length > 0){
    res.render('values/new-value', {
      errors,
      nombre,
      precio
    })
  } else {
    const newValue = new Value({nombre, precio})
    await newValue.save()
    req.flash('success_msg', 'Valoración agregada correctamente')
    res.redirect('/values')
  }
})

router.get('/values', isAuthenticated, async (req, res) => {
  const values = await Value.find().lean()
  values.forEach(elem => elem.precio = elem.precio.toFixed(2)) 
  res.render('values/all-values', {values})
})

router.get('/values/edit/:id', isAuthenticated, async (req, res) => {
  const value = await Value.findById(req.params.id).lean()
  value.precio = value.precio.toFixed(2)
  res.render('values/edit-value', {value})
})

router.put('/values/edit-value/:id', isAuthenticated, async (req, res) => {
  const {nombre, precio} = req.body
  await Value.findByIdAndUpdate(req.params.id, {nombre, precio})
  req.flash('success_msg', 'Valoricación actualizada correctamente')
  res.redirect('/values')
})

router.get('/values/delete/:id', isAuthenticated, async (req, res) => {
  await Value.findByIdAndDelete(req.params.id)
  req.flash('success_msg', 'Valorización eliminada correctamente')
  res.redirect('/values')
})

module.exports = router
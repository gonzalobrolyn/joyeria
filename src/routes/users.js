const express = require('express')
const router = express.Router()

const User = require('../models/User')

const passport = require('passport')

router.get('/users/signin', (req, res) => {
  res.render('users/signin')
})

router.post('/users/signin', passport.authenticate('local', {
  successRedirect: '/products',
  failureRedirect: '/users/signin',
  failureFlash: true
}))

router.get('/users/signup', (req, res) => {
  res.render('users/signup')
})

router.post('/users/signup', async (req, res) => {
  const {nombre, apellido, dni, clave, confirma_clave} = req.body
  const errors = []
  if(!nombre) {
    errors.push({text: 'Escribe almenos un nombre'})
  }
  if(!apellido) {
    errors.push({text: 'Escribe almenos un apellido'})
  }
  if(!(dni.length == 8)) {
    errors.push({text: 'El número de DNI debe ser de 8 digitos'})
  }
  if(!clave) {
    errors.push({text: 'Escribe una contraseña'})
  }
  if(clave != confirma_clave) {
    errors.push({text: 'Las contraseñas deben ser iguales'})
  }
  if(errors.length > 0) {
    res.render('users/signup', {
      errors,
      nombre,
      apellido,
      dni,
      clave,
      confirma_clave
    })
  } else {
    const dniUser = await User.findOne({dni: dni})
    if(dniUser) {
      req.flash('error_msg', 'El número de DNI esta en uso')
      // res.render('users/signup', {nombre, apellido, dni, clave, confirma_clave})
      res.redirect('/users/signup')
    } else {
      const newUser = new User({nombre, apellido, dni, clave})
      newUser.clave = await newUser.encryptPassword(clave)
      await newUser.save()
      req.flash('success_msg', 'Usuario registrado correctamente')
      res.redirect('/users/signin')
    }
  }
})

router.get('/users/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router

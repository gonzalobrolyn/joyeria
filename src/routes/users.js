const express = require('express')
const router = express.Router()

const User = require('../models/User')
const {isAuthenticated} = require('../helpers/auth')
const passport = require('passport')

router.get('/users/signin', (req, res) => {
  res.render('users/signin')
})

router.post('/users/signin', passport.authenticate('local', {
  successRedirect: '/select',
  failureRedirect: '/users/signin',
  failureFlash: true
}))

router.get('/users/signup', isAuthenticated, (req, res) => {
  res.render('users/signup')
})

router.post('/users/signup', isAuthenticated, async (req, res) => {
  const {nombre, apellido, dni, clave, confirma_clave, cargo} = req.body
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
      res.redirect('/users/signup')
    } else {
      const newUser = new User({nombre, apellido, dni, clave, cargo})
      newUser.clave = await newUser.encryptPassword(clave)
      await newUser.save()
      req.flash('success_msg', 'Usuario registrado correctamente')
      res.redirect('/users')
    }
  }
})

router.get('/users', isAuthenticated, async (req, res) => {
  const users = await User.find().lean()
  res.render('users/all-users', {users})
})

router.delete('/users/delete/:id', isAuthenticated, async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  req.flash('success_msg', 'Usuario eliminado correctamente')
  res.redirect('/users')
})

router.get('/users/logout', isAuthenticated, (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router

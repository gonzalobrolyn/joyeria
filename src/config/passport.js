const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/User')

passport.use(new LocalStrategy({
  usernameField: 'dni',
  passwordField: 'clave'
}, async (dni, clave, done) => {
  const user = await User.findOne({dni: dni})
  if(!user) {
    return done(null, false, {message: 'Usuario no encontrado'})
  } else {
    const match = await user.matchPassword(clave)
    if(match) {
      return done(null, user)
    } else {
      return done(null, false, {message: 'Constraseña incorrecta'})
    }
  }
}))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})
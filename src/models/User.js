const mongoose = require('mongoose')
const {Schema} = mongoose
const bcrypt = require('bcryptjs')

const UserSchema = new Schema ({
  nombre: {type: String, required: true},
  apellido: {type: String, required: true},
  dni: {type: String, required: true},
  clave: {type: String, required: true},
  fecha: {type: Date, default: Date.now}
})

UserSchema.methods.encryptPassword = async (clave) => {
  const salt = await bcrypt.genSalt(10)
  const hash = bcrypt.hash(clave, salt)
  return hash
}

UserSchema.methods.matchPassword = async function (clave) {
  return await bcrypt.compare(clave, this.clave)
}

module.exports = mongoose.model('User', UserSchema)
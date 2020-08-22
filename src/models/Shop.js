const mongoose = require('mongoose')
const {Schema} = mongoose

const ShopSchema = new Schema ({
  nombre: {type: String, required: true},
  direccion: {type: String, required: true},
  efectivo: {type: Number, default: 0},
  tarjeta: {type: Number, default: 0},
  estado: {type: Boolean, default: 0},
  fecha: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Shop', ShopSchema)
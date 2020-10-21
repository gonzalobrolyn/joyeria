const mongoose = require('mongoose')
const {Schema} = mongoose

const ProductSchema = new Schema ({
  codigo: {type: String, required: true},
  nombre: {type: String, required: true},
  piezas: {type: Number, required: true},
  tipo: {type: Boolean, required: true},
  precio: {type: Number, default: 0},
  peso: {type: Number, default: 0},
  valoracion: {type: String, required: false},
  fecha: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Product', ProductSchema)
const mongoose = require('mongoose')
const {Schema} = mongoose

const ProductSchema = new Schema ({
  nombre: {type: String, required: true},
  piezas: {type: Number, required: true},
  tipo: {type: Boolean, required: true},
  precio: {type: Number, default: 0},
  peso: {type: Number, default: 0},
  valor: {type: Number, default: 0},
  descripcion: {type: String, default: ""},
  fecha: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Product', ProductSchema)
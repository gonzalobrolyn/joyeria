const mongoose = require('mongoose')
const {Schema} = mongoose

const SaleSquema = new Schema ({
  idLocal: {type: Schema.ObjectId, ref: 'Shop'},
  idProducto: {type: Schema.ObjectId, ref: 'Product'},
  cantidad: {type: Number, required: true},
  precio: {type: Number, required: true},
  precioVenta: {type: Number},
  estado: {type: String},
  formaPago: {type: String},
  fecha: {type: Date, required: true},
  vendedor: {type: String, required: true}
})

module.exports = mongoose.model('Sale', SaleSquema)


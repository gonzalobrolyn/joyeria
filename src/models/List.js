const mongoose = require('mongoose')
const {Schema} = mongoose

const ListSchema = new Schema ({
  idLocal: {type: Schema.ObjectId, ref: 'Shop'},
  idProducto: {type: Schema.ObjectId, ref: 'Product'},
  cantidad: {type: Number, required: true},
  precio: {type: Number, required: true},
  precioVenta: {type: Number, required: true}
})

module.exports = mongoose.model('List', ListSchema)
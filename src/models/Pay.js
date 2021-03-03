const mongoose = require('mongoose')
const {Schema} = mongoose

const PaySquema = new Schema ({
  idLocal: {type: Schema.ObjectId, ref: 'Shop'},
  concepto: {type: String},
  monto: {type: Number},
  estado: {type: String},
  formaPago: {type: String},
  fecha: {type: Date, required: true},
  vendedor: {type: String, required: true}
})

module.exports = mongoose.model('Pay', PaySquema)

const mongoose = require('mongoose')
const {Schema} = mongoose

const StockSchema = new Schema ({
  idProducto: {type: Schema.ObjectId, ref: 'Product'},
  cantidad: {type: Number, required: true},
  idLocal: {type: Schema.ObjectId, ref: 'Shop'},
  fecha: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Stock', StockSchema)
const mongoose = require('mongoose')
const {Schema} = mongoose

const SaleSquema = new Schema ({
  fecha: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Sale', SaleSquema)


const mongoose = require('mongoose')
const {Schema} = mongoose

const ValueSquema = new Schema ({
  nombre: {type: String, required: true},
  precio: {type: Number, required: true},
  fecha: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Value', ValueSquema)


const express = require('express')
const router = express.Router()

const Sale = require('../models/Sale')
const Shop = require('../models/Shop')
const List = require('../models/List')
const Value = require('../models/Value')
const Product = require('../models/Product')
const Stock = require('../models/Stock')

const {isAuthenticated} = require('../helpers/auth')

router.get('/sales/:idLocal', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  const local = await Shop.findById(idLocal).lean()
  const lista = await List.find().where({idLocal: idLocal}).populate('idProducto').populate('idLocal').lean()
  lista.forEach(elem => { if(elem.precio){
    elem.precio = elem.precio.toFixed(2)
  } })
  res.render('sales/sale', {local, lista})
})

router.get('/sales/product-sale/:idLocal/:idProducto', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  const idProducto = req.params.idProducto
  const cantidad = 1
  const producto = await Product.findById(idProducto).lean()
  if(producto.tipo){
    const valoracion = await Value.findById(producto.valoracion).lean()
    var precio = (producto.peso * valoracion.precio).toFixed(2)
  } else {
    var precio = producto.precio.toFixed(2)
  }
  const newItem = new List({idLocal, idProducto, cantidad, precio})
  await newItem.save()
  res.redirect('/sales/'+idLocal)
})

router.get('/sales/delete-list/:idItem', isAuthenticated, async (req, res) => {
  const idItem = req.params.idItem
  const item = await List.findById(idItem).lean()
  const idLocal = item.idLocal
  await List.findByIdAndDelete(idItem)
  res.redirect('/sales/'+idLocal)
})

router.get('/sales/to-sell/:idLocal', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  const fecha = Date.now()
  const vendedor = req.user.nombre
  const lista = await List.find().where({idLocal: idLocal}).lean()
  lista.forEach( async elem => {
    const {idProducto, cantidad, precio} = elem
    const newSale = new Sale({idLocal, idProducto, cantidad, precio, fecha, vendedor})
    await newSale.save()
    const local = await Shop.findById(idLocal).lean()
    const efectivo = local.efectivo + precio
    await Shop.findByIdAndUpdate(idLocal, {efectivo})
    const stock = await Stock.findOne({idProducto: idProducto}).where({idLocal: idLocal}).lean()
    console.log(stock)
    const cant = stock.cantidad - cantidad
    await Stock.findByIdAndUpdate(stock._id, {cantidad: cant})
    await List.findByIdAndDelete(elem._id)
  })
  res.redirect('/sales/'+idLocal)
})

module.exports = router
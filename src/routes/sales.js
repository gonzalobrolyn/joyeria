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
  var sumaVenta = 0
  const local = await Shop.findById(idLocal).lean()
  const lista = await List.find().where({idLocal: idLocal}).populate('idProducto').populate('idLocal').lean()
  lista.forEach(elem => { if(elem.precio){
    sumaVenta = sumaVenta + elem.precioVenta
    elem.precio = elem.precio.toFixed(2)
    elem.precioVenta = elem.precioVenta.toFixed(2) 
  } })
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  sumaVenta = sumaVenta.toFixed(2)
  res.render('sales/sale', {local, lista, admin, sumaVenta})
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
  const precioVenta = precio
  const newItem = new List({idLocal, idProducto, cantidad, precio, precioVenta})
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

router.post('/sales/discount', isAuthenticated, async (req, res) => {
  const {idItem, precioVenta} = req.body
  const item = await List.findById(idItem).lean()
  const idLocal = item.idLocal
  await List.findByIdAndUpdate(idItem,{precioVenta})
  res.redirect('/sales/'+idLocal)
})

router.get('/sales/to-sell-cash/:idLocal', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  const fecha = Date.now()
  const vendedor = req.user.nombre
  const estado = 'enDiario'
  const formaPago = 'En Efectivo'
  var totalVenta = 0
  const lista = await List.find().where({idLocal: idLocal}).lean()
  lista.forEach( async elem => {
    const {idProducto, cantidad, precio, precioVenta} = elem
    totalVenta = totalVenta + precioVenta
    const newSale = new Sale({idLocal, idProducto, cantidad, precio, precioVenta, estado, formaPago, fecha, vendedor})
    await newSale.save()
    const stock = await Stock.findOne({idProducto: idProducto}).where({idLocal: idLocal}).lean()
    const cant = stock.cantidad - cantidad
    await Stock.findByIdAndUpdate(stock._id, {cantidad: cant})
    await List.findByIdAndDelete(elem._id)
  })
  const local = await Shop.findById(idLocal).lean()
  const efec = local.efectivo + totalVenta
  await Shop.findByIdAndUpdate(idLocal, {efectivo: efec})
  res.redirect('/sales/'+idLocal)
})

router.get('/sales/to-sell-card/:idLocal', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  const fecha = Date.now()
  const vendedor = req.user.nombre
  const estado = 'enDiario'
  const formaPago = 'Con Tarjeta'
  var totalVenta = 0
  const lista = await List.find().where({idLocal: idLocal}).lean()
  lista.forEach( async elem => {
    const {idProducto, cantidad, precio, precioVenta} = elem
    totalVenta = totalVenta + precioVenta
    const newSale = new Sale({idLocal, idProducto, cantidad, precio, precioVenta, estado, formaPago, fecha, vendedor})
    await newSale.save()
    const stock = await Stock.findOne({idProducto: idProducto}).where({idLocal: idLocal}).lean()
    const cant = stock.cantidad - cantidad
    await Stock.findByIdAndUpdate(stock._id, {cantidad: cant})
    await List.findByIdAndDelete(elem._id)
  })
  const local = await Shop.findById(idLocal).lean()
  const tarj = local.tarjeta + totalVenta
  await Shop.findByIdAndUpdate(idLocal, {tarjeta: tarj})
  res.redirect('/sales/'+idLocal)
})

router.get('/sales/history/:idLocal', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  var total = 0
  var enEfectivo = 0
  var conTarjeta = 0
  const ventas = await Sale.find().where({idLocal: idLocal}).where({estado: 'enDiario'}).populate('idProducto').lean()
  ventas.forEach(elem => {
    elem.precio = elem.precio.toFixed(2)
    total = total + elem.precioVenta
    if (elem.formaPago == "En Efectivo"){
      enEfectivo = enEfectivo + elem.precioVenta
    } else if (elem.formaPago == "Con Tarjeta"){
      conTarjeta = conTarjeta + elem.precioVenta
    }
    elem.precioVenta = elem.precioVenta.toFixed(2)
    elem.fecha = elem.fecha.toLocaleTimeString()
  })
  const sesion = req.user
  if (sesion.cargo == 'Administrador'){
    var admin = 'SI'
  }
  total = total.toFixed(2)
  enEfectivo = enEfectivo.toFixed(2)
  conTarjeta = conTarjeta.toFixed(2)
  const local = await Shop.findById(idLocal).lean()
  res.render('sales/history', {ventas, admin, total, enEfectivo, conTarjeta, local})
})

module.exports = router
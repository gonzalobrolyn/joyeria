const express = require('express')
const router = express.Router()

const Pay = require('../models/Pay')
const Shop = require('../models/Shop')
  
const {isAuthenticated} = require('../helpers/auth')

router.get('/pays/add-pay/:idLocal', isAuthenticated, (req, res) => {
  const idLocal = req.params.idLocal
  const sesion = req.user
  if (sesion.cargo == "Administrador"){
    var admin = 'SI'
  }
  res.render('pays/new-pay', {idLocal, admin})
})

router.post('/pays/new-pay/:idLocal', isAuthenticated, async (req, res) => {
  const idLocal = req.params.idLocal
  const estado = "enDiario"
  const fecha = Date.now()
  const vendedor = req.user.nombre
  const {concepto, monto} = req.body
  const errors = []
  if(!concepto) {
    errors.push({text: 'Escribe el concepto del ingreso'})
  }
  if(!monto) {
    errors.push({text: 'Escribe el monto del ingreso'})
  }
  if(errors.length > 0){
    res.render('pays/new-pay', {
      errors,
      concepto,
      monto
    })
  } else {
    const newPay = new Pay({idLocal, concepto, monto, estado, fecha, vendedor})
    await newPay.save()
    const local = await Shop.findById(idLocal).lean()
    const efec = local.efectivo + monto
    await Shop.findByIdAndUpdate(idLocal, {efectivo: efec})
    req.flash('success_msg', 'Ingreso de efectivo registrado correctamente')
    res.redirect('/sales/'+idLocal)
  }
})

module.exports = router
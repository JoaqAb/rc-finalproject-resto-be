import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'order'

const orderSchema = new mongoose.Schema({
    mesa: {
      type: Number,
      required: true,
    },
    productos: [
      {
        nombre: String,
        cantidad: Number,
        precio: Number,
      },
    ],
    estado: {
      type: String,
      enum: ['en espera', 'pedido realizado'],
      default: 'en espera',
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  });
  
  const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;

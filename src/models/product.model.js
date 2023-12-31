import mongoose from "mongoose";

mongoose.pluralize(null);

const collection = "product";

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  available: { type: Boolean, default: true },
  image: { type: String, required: true },
});

const productModel = mongoose.model(collection, productSchema);

export default productModel;

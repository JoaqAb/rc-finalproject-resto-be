import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'table'

const tableSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true},
    qrCode: { type: String, required: true},
});

const tableModel = mongoose.model(collection, tableSchema);

export default tableModel;

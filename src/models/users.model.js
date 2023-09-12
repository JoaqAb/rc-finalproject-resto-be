import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'user'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    table: { type: String, default: 0},
    rol: { type: String, default: 'client'},
});

const userModel = mongoose.model(collection, userSchema);

export default userModel;

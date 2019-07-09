const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    id:{
        type: Number,
        require:true,
        unique: true
    },
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type:String,
        require: true,
    },
    phone:{
        type: String,
        require: true
    },
    rol:{
        type: Number,
        require: true
    },
})

userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);
module.exports = User;
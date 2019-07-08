const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const courseSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    id:{
        type: Number,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    modality:{
        type:String,
        require: true,
    },
    intensity:{
        type:Number,
        require:true
    },
    available:{
        type:Boolean,
        default: true
    }
})


const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
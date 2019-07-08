const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const subscriptionSchema = new Schema({
    course_id:{
        type: Number,
        require: true
    },
    student_id:{
        type: Number,
        require:true
    },


})
const Subscription = mongoose.model('Subscription', subscriptionSchema );
module.exports = Subscription;
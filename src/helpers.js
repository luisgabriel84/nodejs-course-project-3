"use strict"
const { title_app } = require('./config/global');


const hbs = require('hbs');
hbs.registerHelper('getAppTitle',()=>{
    return title_app;
})
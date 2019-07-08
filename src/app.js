"use strict"

//Dependencies
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');



const Course = require('./models/courses'); 
const User = require('./models/users');



//Directories
const publicDir = path.join(__dirname, '../public');
const partialDir = path.join(__dirname,  './views/partials/');
const boweComponents = path.join(__dirname, '../bower_components');



//Modules
const courses = require('./controllers/courses');
const students = require('./controllers/students');
const users = require('./controllers/users');

//configurations
const app = express();
hbs.registerPartials(partialDir);

mongoose.connect('mongodb://localhost:27017/gestion_academica',{useNewUrlParser:true},(err,result)=>{
    if(err){
        return console.log(err);
    }
    //console.log('Conectado');
});

//Helpers
require('./helpers')


app.use(session({
    secret: 'keyboard cat',
    resave:false,
    saveUninitialized:true
}))

//middleware
app.use((req, res, next)=>{
    if(req.session.user){
        res.locals.session=true;
        res.locals.nombre = req.session.name
        res.locals.admin =false;
        if(req.session.rol===1){
            res.locals.admin =true;
        }
    }
    next();
})

//Express
	app.use(bodyParser.urlencoded({extended:false}))
	.use(express.static(publicDir))
    .set('view engine', 'hbs')
    .use(express.static(boweComponents))
    
    .get('/',(req, res)=>{
        res.render('users/login')
    })
    

    //Create course
    .get('/create-course',(req, res)=>{
        res.render('courses/add')
    })

    // Add Course
    .post('/create-course',(req, res)=>{
        
        let course = new Course({
			name: req.body.name,
			id: parseInt(req.body.id),
			description: req.body.description,
			price: parseFloat(req.body.price),
			modality: req.body.modality,
			intensity: parseFloat(req.body.intensity) || 0,
			available: true
		})

        course.save((err, resultado)=>{
            if(err){
                return console.log("Error");
            }
            res.redirect(301, '/view-courses');
        });
    })
    // List all courses
    .get('/view-courses',(req, res)=>{
        Course.find({}).exec((err,response)=>{
            if(err){
                return console.log(err);
            }
            res.render('courses/index',{
                listado: response
            })
        })

    })
    // Register form
    .get('/register',(req, res)=>{
        res.render('users/register')
    })
    // Process register data
    .post('/register',(req, res)=>{
        let user = new User({
            id: req.body.id,
            name: req.body.name,
            email: req.body.email,
            password:  bcrypt.hashSync( req.body.password,10),
            phone: req.body.phone,
            rol: 2
        });

       
        user.save((err, result)=>{
            if(err){
                return console.log("Error");
            }
            res.redirect(301, '/view-courses');
            console.log(result)
        });
        
        
    })

    .get('/login',(req,res)=>{
        res.render('users/login')     
    })

    .post('/login',(req,res)=>{

        User.findOne({email: req.body.username}, (err, result)=>{
            if(err){
                return console.log(err);
            }

            if(!result){
                return res.render('users/login',{
                    message: "usuario no encontrado"
                })
               
            }
        

            if(!bcrypt.compareSync(req.body.password, result.password)){
                console.log("clave errada");
                return res.render('users/login',{
                    message: "Contraseña errrada"
                })
               
            }

            req.session.user = result._id
            req.session.name = result.name;
            req.session.rol = result.rol;
           
            res.redirect(301, '/view-courses');
            
        })
    })
    .get('/logout',(req,res)=>{
        req.session.destroy(( err)=> {
           console.log("No se pudo eliminar la session");
        })
        console.log("session destroyed")
        res.redirect('/login');


    })
    .get('/inscripcion/*',(req,res)=>{

        let id = req.query.course_id;

    })



//start port    
app.listen(3000, ()=>{
    console.log('Escuchando en el puerto 3000')
})




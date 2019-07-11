"use strict"

//Dependencies
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

const port = process.env.PORT || 3000;



const Course = require('./models/courses'); 
const User = require('./models/users');
const Subscription = require('./models/subscriptions');



//Directories
const publicDir = path.join(__dirname, '../public');
const partialDir = path.join(__dirname,  './views/partials/');
const boweComponents = path.join(__dirname, '../bower_components');



//configurations
const app = express();
hbs.registerPartials(partialDir);

var local= "mongodb://localhost:27017/gestion_academica";
var prod="mongodb+srv://mongoadmin:nimda@cluster0-t5f5t.mongodb.net/gestion_academica?retryWrites=true&w=majority";

mongoose.connect(prod,{useNewUrlParser:true},(err,result)=>{
    if(err){
        return console.log(err);
    }
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
        res.locals.adminSession =false; //interesado
        if(req.session.rol===1){
            res.locals.adminSession =true; //coordinador
        }
    }
    next();
})

//Express
	app.use(bodyParser.urlencoded({extended:false}))
	.use(express.static(publicDir))
    .set('view engine', 'hbs')
    .use(express.static(boweComponents))
    .set('views', path.join(__dirname, 'views'))
    
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
                listado: response,
                admin: req.session.rol
            })
        })

    })


    .get('/availabe-courses',(req, res)=>{
        Course.find({available:true}).exec((err,response)=>{
            if(err){
                return console.log(err);
            }
            res.render('courses/availabe-courses',{
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
                console.log(err);
                res.render('users/register',{
                    errorMessage:true,
                    message:err.message,
                })

            }


            res.render('users/login',{
                succesMessage:true,
                message:'Te has registrado exitosamente como aspirante, puedes ingresar y registrarte en los cursos'
            })
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
            req.session.userid = result.id;
           
            res.redirect(301, '/view-courses');
            
        })
    })
    .get('/logout',(req,res)=>{
        req.session.destroy(( err)=> {
           console.log("No se pudo eliminar la session");
        })
     //   console.log("session destroyed")
        res.redirect('/login');


    })
    .get('/enroll',(req,res)=>{


        let subscription = new Subscription({
            student_id:  req.session.userid,
            course_id : req.query.course_id,
        })


        subscription.save((err, result)=>{
            if(err){
                return console.log("Error");
            }
          
            console.log(result)
        });
    
    })
    .get('/inscritos',(req,res)=>{
      
        
        Subscription.find({course_id: req.query.course_id}).exec( (err,response, course_id=req.query.course_id )=>{

            if(err){
                return console.log(err);
            }
            let students =[];
            let i;
            for(i =0; i< response.length; i++){
                students.push(response[i].student_id);
            }
            
            User.find({
                'id':{ $in:students}
            },
                (err,enrolled, courseID = course_id) => {  
                    
                res.render('courses/subscribed.hbs', {
                    estudiantes: enrolled,
                    course: courseID
                })
            })
        }); 
        
    })

    .get('/drop',(req, res)=>{
        console.log(req.query.user_id, req.query.course_id);
        Subscription.deleteOne( {course_id:req.query.course_id, student_id:req.query.user_id} , (err, response)=>{
            res.redirect(301, '/view-courses');
        })
    })



//start port    
app.listen(port, ()=>{
    console.log('Escuchando en el puerto:'+port);
})




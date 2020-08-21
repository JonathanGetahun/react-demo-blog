const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { auth } = require("./middleware/auth");

const config = require('./config/key')

const { User } = require('./models/user');
const user = require('./models/user');

mongoose.connect(config.mongoURI, 
    {useNewUrlParser: true}).then(()=>console.log('connected success'))
    .catch(err=>console.error(err));

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(cookieParser());


app.get("/api/user/auth", auth, (req,res) => {
    res.status(200).json({
        _id: req._id,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role
    })
})

//request is coming from client (postman when developing) and put
//data into mongoDB
app.post('/api/users/register',  (req,res) => {
    const user = new User(req.body)
    user.save()
    .then(() => res.status(200).json(`User '${req.body.name}' added!`))
    .catch((err) => res.status(400).json(`Unable to add user. Error: ${err}.`));
    
})

app.post('/api/user/login', (req,res) => {
    //find the email
    User.findOne({ email: req.body.email}, (err,user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            })
        }

    })
    //this.password is the password in teh database

    //compare Password 
    user.comparePassword(req.body.password, (err, isMatch) => {
        if(isMatch){
            return res.json({
                loginSuccess:false,
                message:"Auth failed, wrong password"
            })
        }
    })
    //generate Token
    user.generateToken((err, user) => {
        if(err) return res.status(400).send(err)
        res.cookie("x_auth", user.token)
            .status(200)
            .json({
                loginSuccess: true
            })
    })
})
app.get('/',(req,res)=> {
    res.send("hello world")
})

app.listen(5000);
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key')

const { User } = require('./models/user');

mongoose.connect(config.mongoURI, 
    {useNewUrlParser: true}).then(()=>console.log('connected success'))
    .catch(err=>console.error(err));

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(cookieParser());

app.post('/api/users/register', (req,res) => {
    const user = new User(req.body)
    user.save()
    .then(() => res.status(200).json(`User '${req.body.name}' added!`))
    .catch((err) => res.status(400).json(`Unable to add user. Error: ${err}.`));
    
})

app.get('/',(req,res)=> {
    res.send("hello world")
})

app.listen(5000);
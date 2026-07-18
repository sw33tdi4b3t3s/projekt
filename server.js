const express = require('express');
const app = express();
const db = require('./db');
const connectDB = require('./db');
app.use(express.json({ limit: 10000 }));
app.use(express.urlencoded({ extended: true }));
const path = require('node:path');
const api = require(path.join(__dirname, 'routes', 'api'));

//const views = require(path.join(__dirname, 'routes', 'views'));
//require('dotenv').config();
//const PORT = process.env.PORT || 9999;

app.use('/api', api);
// app.use('/other', views);


app.get('/', (req,res)=>{

    res.redirect("/dashboard.html");
    console.log("Hello World");

});


app.listen(3000, async ()=>{
    await connectDB();
    console.log("aplikacja dziala!");

});
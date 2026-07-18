const express = require('express');
const router = express.Router();
const path = require('node:path');

router.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname, 'login.html'));
});

router.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname, 'register.html'));
})

router.get('/dashboard', (req,res)=>{
    res.sendFile(path.join(__dirname, 'dashboard.html'));
})



module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;

router.post('/login', async (req,res)=>{
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user) return res.status(400).json({message:'błędny email lub hasło!'});

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) return res.status(400).json({message:'błędny email lub hasło!'});
        
        const token  = jwt.sign({userId: user._id, role: user.role }, secretKey, {expiresIn: '1h'});

        res.status(200).json({
            message: 'Zalogowano pomyślnie!',
            token: token
        });
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Błąd serwera podczas logowania.'});
    }
});


router.post('/register', async (req,res)=>{
    try{
        const {name ,email, password} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'Ten e-mail jest już zajęty!'});
        }

        const newUser = new User({name, email, password});

        await newUser.save();

        res.status(201).json({message: 'Zarejestrowano pomyślnie!'});
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Błąd serwera podczas rejestracji.'});
    }
});

module.exports = router;
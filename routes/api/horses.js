const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const Breeder = require('../../models/Breeder');
const Horse = require('../../models/Horse');

router.post('/add', async (req,res)=>{

    try{
        const {name, birthYear, gender, color, countryCode, father, mother, breeder, notes} = req.body;
        
        if(!name || !birthYear || !gender || !color || !countryCode || !breeder){
            res.status(400).json({error: "pola wymagane: name, birthYear, gender, color, countryCode, breeder"})
        }

        const country = await Country.findOne({code: countryCode.toUpperCase()}); // czy wogole takie ISO istnieje w bazie 

        if(!country){
            return res.status(404).json({error: "nie znaleziono kraju(ISO)"});
        }

        const breederDoc = await Breeder.findById(breeder);

        if(!breederDoc){
            return res.status(404).json({error: "nie znaleziono hodowcy"});
        }

        //przypisanie null jesli nie ma ojca lub matki 
        const fatherDoc = father ? await Horse.findById(father) : null;
        const motherDoc = mother ? await Horse.findById(mother) : null;


        const horse = new Horse({
            name,
            birthYear,
            gender,
            color,
            country: country._id,
            breeder: breederDoc._id,
            father: fatherDoc?._id, // jesli istnieje to zapisz id jesli nie to undefined
            mother: motherDoc?._id, // jesli istnieje to zapisz id jesli nie to undefined
            notes

        });

        await horse.save();

        res.status(201).json({message: "Dodano konia", horse});


    }catch(err){
        res.status(500).json({error: err.message});
    }

});

router.get('/all', async (req,res)=>{

    try{
        const horses = await Horse.find();

        res.status(200).json(horses);

    }catch(err){
        res.status(500).json({error: err.message});
    }

});


module.exports = router;
const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const Breeder = require('../../models/Breeder');

router.post('/add', async (req,res)=>{
   
   try{
        const {name, countryCode, notes} = req.body;

        if(!name || !countryCode){
            return res.status(400).json({error: `pola name oraz countryCode są wymagane! -> name: ${name}, countryCode: ${countryCode}`});
        }

        const country = await Country.findOne({code: countryCode.toUpperCase()}); // czy wogole takie ISO istnieje w bazie zwraca caly obiekt!!!

        if(!country){
            return res.status(404).json({error: `nie znaleziono kraju(ISO): ${countryCode}`});
        }


        const breeder = new Breeder({
            name,
            country: country._id,
            notes
        });


        await breeder.save();
        res.status(201).json({message: `Dodano hodowce: ${name} o kodzie kraju: ${countryCode} oraz o notatkach: ${notes}`});

   }catch(err){
        if(err.code === 11000){
            res.status(409).json({error: `Hodowca o podanych danych już istnieje!`});
        }else{
            res.status(500).json({error: err.message});
        }
   }
});

router.get('/all', async (req,res)=>{

    try{
        const breeders = await Breeder.find();

        res.status(200).json(breeders);

    }catch(err){
        res.status(500).json({error: err.message});
    }

});


module.exports = router;
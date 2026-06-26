const express = require('express');
const app = express();
const mongoose = require('mongoose');

const Country = require('./models/Country'); // import country
const Breeder = require('./models/Breeder'); // import breeder
const Horse = require('./models/Horse'); // import horse
const db = require('./db');
const connectDB = require('./db');
app.use(express.json());


app.post('/addCountry', async (req,res)=>{
   
   try{
    const {name, code} = req.body;

    const country = new Country({
        name,
        code
    });

    await country.save();


    res.status(201).json({message: `Dodano kraj: ${name} o kodzie: ${code}`});

   }catch(err){
        res.status(500).json({error: err.message});
   }
});

app.post('/addBreeder', async (req,res)=>{
   
   try{
    const {name, breederCode, notes} = req.body;

    const countryCode = await Country.findOne({code: breederCode}); // czy wogole takie ISO istnieje w bazie 

    if(!countryCode){
        return res.status(404).json({error: "nie znaleziono kraju(ISO)"});
    }


    const breeder = new Breeder({
        name,
        countryCode: countryCode._id,
        notes
    });

    await breeder.save();


    res.status(201).json({message: `Dodano hodowce: ${name} o kodzie kraju: ${breederCode} oraz o notatkach: ${notes}`});

   }catch(err){
        res.status(500).json({error: err.message});
   }
});

app.post('/addHorse', async (req,res)=>{

    try{
        const {name, birthYear, gender, color, countryCode, father, mother, breeder, notes} = req.body;
        
        const country = await Country.findOne({code: countryCode}); // czy wogole takie ISO istnieje w bazie 

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
            countryCode: country._id,
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


app.get('/', (req,res)=>{

    res.send("Hello world klient"); 
    console.log("Hello World");

});


app.listen(3000, async ()=>{
    await connectDB();
    console.log("aplikacja dziala!");

});
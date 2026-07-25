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

router.route('/:value')
    .get(async (req,res)=>{
        try{
          const {value} = req.params;
          
          if(!value){
            return res.status(400).json({error: `wymagany parametr wyszukiwania to name lub ISO_kraju ! Podano: ${value}`});
          }

          const breeder = await Breeder.findOne(buildQuery(value));

          if(!breeder){
            return res.status(404).json({error: `hodowca o podanych parametrach -> parametr: ${value} nie istnieje w bazie ` });
          }

          res.status(200).json(breeder);

        }catch(err){
            res.status(500).json({error: err.message});
        }

    })

    .delete(async (req,res)=>{
        try{
            const {value} = req.params;

            if(!value){
                return res.status(400).json({error: `wymagany parametr do usuniecia to name lub ISO_kraju! Podano: ${value}`});
            }

            const result = await Breeder.deleteOne(buildQuery(value));

            if(result.deletedCount === 0){
                return res.status(404).json({error: `hodowca o podanych parametrach -> parametr: ${value} nie istnieje w bazie! `});
            }

            res.status(200).json({message: `pomyślnie usunięto z bazy hodowce o parametrze: ${value}`});

        }catch(err){
            res.status(500).json({error: err.message});
        }

    })

    .patch(async (req,res)=>{
        try{

            const {value} = req.params; 
            const {name,country, notes} = req.body;

            if(!value){
                return res.status(400).json({error: `wymagany minimum 1 parametr do update'a to name lub ISO_kraju! Podano: ${value}`});
            }

            if(!name && !country && !notes){
                return res.status(400).json({error: `Wymagany parametr do update to name, ISO_kraju lub notes!`});
            }

            const updateData = {};
            if(name){ updateData.name = name;}
            if(country){updateData.country = country.toUpperCase();}
            if(notes){updateData.notes = notes;}

            const result = await Breeder.updateOne(buildQuery(value),updateData);

            if(result.matchedCount === 0){
                return res.status(404).json({error: `brak danego hodowcy w bazie Podano: ${value}`});
            }

            res.status(200).json({message: `pomyslnie dokonano zmian w hodowcy o parametrze: ${value}`});

        }catch(err){
            res.status(500).json({error: err.message});
        }


    } )


function buildQuery(value){
    if(value.length >= 0 && value.length <=2){
        return {country: value.toUpperCase() };
    }else{
        return {name: {$regex: value, $options: 'i'}};
    }
}

module.exports = router;
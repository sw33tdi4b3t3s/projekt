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

        const country = await Country.findOne({code: countryCode.toUpperCase()}); 

        if(!country){
            return res.status(404).json({error: `nie znaleziono kraju(ISO): ${countryCode}`});
        }


        const breeder = new Breeder({
            name: name.trim(),
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
        const breeders = await Breeder.find().populate('country');
        res.status(200).json(breeders);
    
    }catch(err){
        res.status(500).json({error: err.message});
    }

});

router.route('/:name/:country')
    .get(async (req,res)=>{
        try{
          const {name, country} = req.params;
          const query = await buildQuery(name, country);

          if(!query){
            return res.status(400).json({error: `nie znaleziono kraju w bazie dla parametru: ${country}`});
          }

          const breeder = await Breeder.findOne(query).populate('country');

          if(!breeder){
            return res.status(404).json({error: `Hodowca ${name} w kraju ${country} nie istnieje w bazie ` });
          }

          res.status(200).json(breeder);

        }catch(err){
            res.status(500).json({error: err.message});
        }
    })

    .delete(async (req,res)=>{
        try{
            const {name,country} = req.params;
            const query = await buildQuery(name,country);

            if(!query){
            return res.status(400).json({error: `nie znaleziono kraju w bazie dla parametru: ${country}`});
            }

            const result = await Breeder.deleteOne(query);

            if(result.deletedCount === 0){
                return res.status(404).json({error: `Hodowca ${name} z kraju ${country} nie istnieje w bazie! `});
            }

            res.status(200).json({message: `pomyślnie usunięto hodowce: ${name}, ${country}`});

        }catch(err){
            res.status(500).json({error: err.message});
        }

    })

    .patch(async (req,res)=>{
        try{
            const {name: paramName, country: paramCountry} = req.params; 
            const {name, country, notes} = req.body;

            const query = await buildQuery(paramName, paramCountry);

            if(!query){
                return res.status(404).json({error: `nie znaleziono hodowcy w bazie dla parametru: ${paramCountry}`})
            }

            // poprzed undefined pozwalamy na wyczysczenie notatek ""
            if(!name && !country && notes === undefined){
                return res.status(400).json({error: `Wymagany parametr do update to name, country lub notes!`});
            }
            
            const updateData = {};
            if(name){ updateData.name = name.trim(); }
            if(notes !== undefined){ updateData.notes = notes; }

            if(country){
                const safeNewCountry = escapeRegex(country);
                const newCountry = await Country.findOne({
                    $or: [
                        { code: country.toUpperCase() },
                        { name: { $regex: safeNewCountry, $options: 'i' } }
                    ]
                });

                if (!newCountry) {
                    return res.status(404).json({ error: `Podany nowy kod kraju (${country}) nie istnieje!` });
                }
                updateData.country = newCountry._id;
            }

            const result = await Breeder.updateOne(query,updateData);

            if(result.matchedCount === 0){
                return res.status(404).json({error: `brak danego hodowcy w bazie`});
            }

            res.status(200).json({message: `pomyslnie dokonano zmian w hodowcy`});

        }catch(err){
            if(err.code === 11000){
                return res.status(409).json({error: `Hodowca o takiej nazwie i kraju juz istnieje w bazie!`});
            }
            res.status(500).json({error: err.message});
        }
    });

// wyszukuje mozliwy znak w zapytaniu i przed nim wstawi \ , przyklad: Jan Kowalski \(fajny\)
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

async function buildQuery(name, countryParam){
    if(!name || !countryParam) return null;

    const safeCountry = escapeRegex(countryParam);
    const safeName = escapeRegex(name);

    const country = await Country.findOne({
        $or: [
            {code: countryParam.toUpperCase()},
            {name: {$regex: safeCountry, $options: 'i'}}
        ]
    });

    if(!country) return null;

    return {
        name: {$regex: safeName, $options: 'i'},
        country: country._id
    };
}

module.exports = router;
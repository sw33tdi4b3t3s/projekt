const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');

router.post('/add', async (req,res)=>{
   
   try{
        const {name, code} = req.body;

        if(!name || !code){
            return res.status(400).json({error: `pola name oraz code są wymagane! -> name: ${name}, code: ${code}`});
        }


        const country = new Country({
            name,
            code
        });

        await country.save();


        res.status(201).json({message: `Dodano kraj: ${name} o kodzie: ${code}`});

   }catch(err){ 
        if(err.code === 11000){
            return res.status(409).json({error: "Kraj o podanych danych już istnieje w bazie!"})
        }

        res.status(500).json({error: err.message});
   }
});


module.exports = router;


//const express = require('express');
// const router = express.Router();

// router.route('/:id')
//     .post((req, res) => {
//         req.body = {
//             task: 'INSERT',
//             id: req.params.id
//         };
//         res.json(req.body);
//     })
//     .delete((req, res) => {
//         const id  = req.params.id;
//         res.json({
//             'task': 'DELETE',
//             'id': id
//         });
//     });

// module.exports = router;

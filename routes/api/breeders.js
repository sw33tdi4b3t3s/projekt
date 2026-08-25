const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const Breeder = require('../../models/Breeder');
const verifyToken = require('../../middleware/tokenAuth');
const checkRole = require('../../middleware/checkRole');

router.post('/add', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const { name, countryCode, notes } = req.body;

        if (!name || !countryCode) {
            return res.status(400).json({ error: `pola name lub countryCode są wymagane! -> name: ${name}, countryCode: ${countryCode}` });
        }

        const country = await Country.findByCodeOrName(countryCode);

        if (!country) {
            return res.status(404).json({ error: `nie znaleziono kraju: ${countryCode}` });
        }

        const breeder = new Breeder({
            name: name.trim(),
            country: country._id,
            notes
        });

        await breeder.save();
        res.status(201).json({ message: `Dodano hodowce: ${name} o kodzie kraju: ${countryCode} oraz o notatkach: ${notes}` });

    } catch (err) {
        if (err.code === 11000) {
            res.status(409).json({ error: `Hodowca o podanych danych już istnieje!` });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

router.get('/all', verifyToken,checkRole('admin'), async (req, res) => {
    try {
        const breeders = await Breeder.find().populate('country');
        res.status(200).json(breeders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.route('/search')
    .get(verifyToken,checkRole('admin'), async (req, res) => {
        try {
            const { name, country } = req.query;
            const query = await buildQuery(name, country);
            
            if (!query) {
                return res.status(400).json({ error: `nie znaleziono kraju w bazie dla parametru: ${country}` });
            }

            const breeder = await Breeder.find(query).populate('country');

            if(breeder.length===0){
                return res.status(404).json({error: `Nie znaleziono hodowcy spelniajacego kryteria.`});
            }

            if(breeder.length>1){
                return res.status(405).json({error: `wyszukiwanie po danym parametrze nie daje jednoznacznego wyniku...`});
            }
            
            if (!breeder) {
                return res.status(404).json({ error: `Hodowca ${name} w kraju ${country} nie istnieje w bazie ` });
            }

            res.status(200).json(breeder);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    })

    .delete(verifyToken,checkRole('admin'), async (req, res) => {
        try {
            const { name, country } = req.query;
            const query = await buildQuery(name, country);

            if (!query) {
                return res.status(400).json({ error: `Nie podano prawidłowych kryteriów wyszukiwania.` });
            }

            const breeders = await Breeder.find(query);

            if (breeders.length === 0) {
                return res.status(404).json({ error: `Nie znaleziono hodowcy spełniającego kryteria.` });
            }

            if (breeders.length > 1) {
                return res.status(405).json({ error: `Wyszukiwanie po danym parametrze nie daje jednoznacznego wyniku...` });
            }

            const result = await Breeder.deleteOne(query);

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: `Hodowca nie istnieje w bazie!` });
            }

            res.status(200).json({ message: `Pomyślnie usunięto hodowcę.` });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }

    })

    .patch(verifyToken,checkRole('admin'), async (req, res) => {
        try {
            const { name: paramName, country: paramCountry } = req.query; 
            const { name, country, notes } = req.body;

            const query = await buildQuery(paramName, paramCountry);

            if (!query) {
                return res.status(400).json({ error: `Nie podano prawidłowych kryteriów wyszukiwania.` });
            }

            if (!name && !country && notes === undefined) {
                return res.status(400).json({ error: `Wymagany parametr do update to name, country lub notes!` });
            }

            const breeders = await Breeder.find(query);

            if (breeders.length === 0) {
                return res.status(404).json({ error: `Nie znaleziono hodowcy spełniającego kryteria.` });
            }

            if (breeders.length > 1) {
                return res.status(405).json({ error: `Wyszukiwanie po danym parametrze nie daje jednoznacznego wyniku...` });
            }
            
            const updateData = {};
            if (name) { updateData.name = name.trim(); }
            if (notes !== undefined) { updateData.notes = notes; }

            if (country) {
                const newCountry = await Country.findByCodeOrName(country);

                if (!newCountry) {
                    return res.status(404).json({ error: `Podany nowy kod kraju (${country}) nie istnieje!` });
                }
                updateData.country = newCountry._id;
            }

            const result = await Breeder.updateOne(query, updateData);

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: `Brak danego hodowcy w bazie` });
            }

            res.status(200).json({ message: `Pomyślnie dokonano zmian w hodowcy` });

        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ error: `Hodowca o takiej nazwie i kraju już istnieje w bazie!` });
            }
            res.status(500).json({ error: err.message });
        }
    });

async function buildQuery(nameParam, countryParam) {
    let countryQuery = null;
    let nameQuery = null;

    if (countryParam) {
        const country = await Country.findByCodeOrName(countryParam);
        if (country) {
            countryQuery = { country: country._id };
        }
    }

    if (nameParam) {
        nameQuery = { name: { $regex: `^${nameParam.trim()}`, $options: 'i' } };
    }

    if (!nameQuery && !countryQuery) {
        return null;
    }

    if (nameQuery && countryQuery) {
        return { $and: [nameQuery, countryQuery] };
    }

    return nameQuery || countryQuery;
}

module.exports = router;
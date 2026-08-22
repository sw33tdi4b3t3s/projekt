const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');

router.post('/add', async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: `pola name oraz code są wymagane! -> name: ${name}, code: ${code}` });
        }

        const country = new Country({
            name: name.trim(),
            code: code.toUpperCase().trim()
        });

        await country.save();

        res.status(201).json({ message: `Dodano kraj: ${name} o kodzie: ${code.toUpperCase()}` });

    } catch (err) { 
        if (err.code === 11000) {
            return res.status(409).json({ error: "Kraj o podanych danych już istnieje w bazie!" });
        }

        res.status(500).json({ error: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const countries = await Country.find();
        res.status(200).json(countries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.route('/:value')

    .get(async (req, res) => {
        try {
            const { value } = req.params;

            if (!value) {
                return res.status(400).json({ error: `wymagany parametr wyszukiwania to name lub code! Podano: ${value}` });
            }

            const country = await Country.findByCodeOrName(value);

            if (!country) {
                return res.status(404).json({ error: `kraj o podanych parametrach -> parametr: ${value} nie istnieje w bazie ` });
            }
            res.status(200).json(country);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    })

    .delete(async (req, res) => {
        try {
            const { value } = req.params;

            if (!value) {
                return res.status(400).json({ error: `wymagany parametr do usuniecia to name lub code! Podano: ${value}` });
            }

            const country = await Country.findByCodeOrName(value);

            if (!country) {
                return res.status(404).json({ error: `kraj o podanych parametrach -> parametr: ${value} nie istnieje w bazie! ` });
            }

            await Country.deleteOne({ _id: country._id });

            res.status(200).json({ message: `pomyślnie usunięto z bazy kraj o parametrze: ${value}` });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    })

    .patch(async (req, res) => {
        try {
            const { value } = req.params; 
            const { name, code } = req.body;

            if (!value) {
                return res.status(400).json({ error: `wymagany minimum 1 parametr do update'a to name lub code! Podano: ${value}` });
            }

            if (!name && !code) {
                return res.status(400).json({ error: `Wymagany parametr do update to name lub code!` });
            }

            const country = await Country.findByCodeOrName(value);

            if (!country) {
                return res.status(404).json({ error: `brak danego kraju w bazie. Podano: ${value}` });
            }

            const updateData = {};
            if (name) { updateData.name = name.trim(); }
            if (code) { updateData.code = code.toUpperCase().trim(); }

            await Country.updateOne({ _id: country._id }, updateData, { runValidators: true });

            res.status(200).json({ message: `pomyslnie dokonano zmian w kraju o parametrze: ${value}` });

        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ error: "Kraj o podanych danych już istnieje w bazie!" });
            }

            res.status(500).json({ error: err.message });
        }
    });

module.exports = router;
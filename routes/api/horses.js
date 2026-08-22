const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const Breeder = require('../../models/Breeder');
const Horse = require('../../models/Horse');

router.post('/add', async (req, res) => {
    try {
        const { name, birthYear, gender, color, countryCode, breederName, breederCountryCode, father, mother, notes } = req.body;

        if (!name || !birthYear || !gender || !color || !countryCode || !breederName || !breederCountryCode) {
            return res.status(400).json({ 
                error: "Pola wymagane: name, birthYear, gender, color, countryCode, breederName, breederCountryCode" 
            });
        }

        const allowedGenders = ['klacz', 'ogier', 'wałach'];
        const allowedColors = ['siwa', 'gniada', 'kasztanowata', 'kara'];

        if (!allowedGenders.includes(gender.toLowerCase())) {
            return res.status(400).json({ error: `Niedozwolona płeć! Dopuszczalne: ${allowedGenders.join(', ')}` });
        }
        if (!allowedColors.includes(color.toLowerCase())) {
            return res.status(400).json({ error: `Niedozwolona maść! Dopuszczalne: ${allowedColors.join(', ')}` });
        }

        const countryHorse = await Country.findByCodeOrName(countryCode);
        if (!countryHorse) {
            return res.status(404).json({ error: `Nie znaleziono kraju o parametrze: ${countryCode}` });
        }

        const countryBreeder = await Country.findByCodeOrName(breederCountryCode);
        if (!countryBreeder) {
            return res.status(404).json({ error: `Nie znaleziono kraju hodowcy o parametrze: ${breederCountryCode}` });
        }

        const breederDoc = await Breeder.findOne({
            name: breederName.trim(),
            country: countryBreeder._id
        });

        if (!breederDoc) {
            return res.status(404).json({ 
                error: `Nie znaleziono hodowcy "${breederName}" zarejestrowanego w kraju ${breederCountryCode}` 
            });
        }

        let fatherDoc = null;
        if (father && father.name && father.countryCode && father.birthYear) {
            const fatherCountry = await Country.findByCodeOrName(father.countryCode);
            if (!fatherCountry) {
                return res.status(404).json({ error: `Nie znaleziono kraju ojca konia o parametrze: ${father.countryCode}` });
            }

            fatherDoc = await Horse.findOne({
                name: father.name.trim(),
                country: fatherCountry._id,
                birthYear: Number(father.birthYear)
            });

            if (!fatherDoc) {
                return res.status(404).json({ error: `Nie znaleziono ojca konia o parametrach: (${father.name} ${father.countryCode} ${father.birthYear})` });
            }

            if (fatherDoc.gender !== 'ogier') {
                return res.status(400).json({ error: `Ojciec musi być ogierem, a jest: ${fatherDoc.gender}` });
            }
        }

        let motherDoc = null;
        if (mother && mother.name && mother.countryCode && mother.birthYear) {
            const motherCountry = await Country.findByCodeOrName(mother.countryCode);
            if (!motherCountry) {
                return res.status(404).json({ error: `Nie znaleziono kraju matki konia o parametrze: ${mother.countryCode}` });
            }

            motherDoc = await Horse.findOne({
                name: mother.name.trim(),
                country: motherCountry._id,
                birthYear: Number(mother.birthYear)
            });

            if (!motherDoc) {
                return res.status(404).json({ error: `Nie znaleziono matki konia o parametrach: (${mother.name} ${mother.countryCode} ${mother.birthYear})` });
            }

            if (motherDoc.gender !== 'klacz') {
                return res.status(400).json({ error: `Matka musi być klaczą, a jest: ${motherDoc.gender}` });
            }
        }

        const horse = new Horse({
            name: name.trim(),
            birthYear: Number(birthYear),
            gender: gender.toLowerCase(),
            color,
            country: countryHorse._id,
            breeder: breederDoc._id,
            father: fatherDoc ? fatherDoc._id : null,
            mother: motherDoc ? motherDoc._id : null,
            notes
        });

        await horse.save();

        res.status(201).json({ message: "Dodano konia pomyślnie", horse });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "Koń o takiej nazwie, kraju i roku urodzenia już istnieje w bazie!" });
        }
        res.status(400).json({ error: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const horses = await Horse.find()
            .populate('country')
            .populate({
                path: 'breeder',
                populate: { path: 'country' }
            })
            .populate({
                path: 'father',
                populate: [
                    { path: 'country' },
                    { path: 'breeder' }
                ]
            })
            .populate({
                path: 'mother',
                populate: [
                    { path: 'country' },
                    { path: 'breeder' }
                ]
            });

        res.status(200).json(horses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.route('/:name/:country/:birthYear')

    .get(async (req, res) => {
        try {
            const { name, country, birthYear } = req.params;
            const query = await buildHorseQuery(name, country, birthYear);

            if (!query) {
                return res.status(400).json({ error: `Nie znaleziono kraju w bazie dla parametru: ${country}` });
            }

            const horse = await Horse.findOne(query)
                .populate('country')
                .populate('breeder')
                .populate('father')
                .populate('mother');

            if (!horse) {
                return res.status(404).json({ error: `Koń ${name} (${birthYear}) z kraju ${country} nie istnieje w bazie.` });
            }

            res.status(200).json(horse);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    })

    .delete(async (req, res) => {
        try {
            const { name, country, birthYear } = req.params;
            const query = await buildHorseQuery(name, country, birthYear);

            if (!query) {
                return res.status(400).json({ error: `Nie znaleziono kraju w bazie dla parametru: ${country}` });
            }

            const result = await Horse.deleteOne(query);

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: `Koń ${name} (${birthYear}) z kraju ${country} nie istnieje w bazie!` });
            }

            res.status(200).json({ message: `Pomyślnie usunięto konia: ${name} (${birthYear})` });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    })

    .patch(async (req, res) => {
        try {
            const { name: paramName, country: paramCountry, birthYear: paramBirthYear } = req.params;
            const { name, birthYear, gender, color, countryCode, father, mother, breederName, breederCountryCode, notes } = req.body;

            const query = await buildHorseQuery(paramName, paramCountry, paramBirthYear);

            if (!query) {
                return res.status(404).json({ error: `Nie znaleziono w bazie kraju dla parametru: ${paramCountry}` });
            }

            const horse = await Horse.findOne(query);

            if (!horse) {
                return res.status(404).json({ error: `Koń ${paramName} (${paramBirthYear}) nie istnieje w bazie!` });
            }

            if (name) horse.name = name.trim();
            if (birthYear) horse.birthYear = Number(birthYear);
            if (gender) horse.gender = gender;
            if (color) horse.color = color;
            if (notes !== undefined) horse.notes = notes;

            let targetCountryId = horse.country; 
            if (countryCode) {
                const country = await Country.findByCodeOrName(countryCode);
                if (!country) {
                    return res.status(404).json({ error: `Nie znaleziono nowego kraju o parametrze: ${countryCode}` });
                }
                horse.country = country._id;
                targetCountryId = country._id;
            }

            if (breederName !== undefined) {
                if (breederName === null || breederName.trim() === "") {
                    horse.breeder = null;
                } else {
                    let breederCountryId = targetCountryId;

                    if (breederCountryCode) {
                        const breederCountry = await Country.findByCodeOrName(breederCountryCode);
                        if (!breederCountry) {
                            return res.status(404).json({ error: `Nie znaleziono kraju hodowcy o parametrze: ${breederCountryCode}` });
                        }
                        breederCountryId = breederCountry._id;
                    }

                    const safeBreederName = escapeRegex(breederName.trim());
                    const breederDoc = await Breeder.findOne({
                        name: { $regex: safeBreederName, $options: 'i' },
                        country: breederCountryId
                    });

                    if (!breederDoc) {
                        return res.status(404).json({ 
                            error: `Nie znaleziono hodowcy "${breederName}" zarejestrowanego w podanym kraju!` 
                        });
                    }
                    horse.breeder = breederDoc._id;
                }
            }

            if (father !== undefined) {
                if (father === null) {
                    horse.father = null;
                } else if (father.name && father.birthYear) {
                    let fatherCountryId = targetCountryId;

                    if (father.countryCode) {
                        const fatherCountry = await Country.findByCodeOrName(father.countryCode);
                        if (!fatherCountry) {
                            return res.status(404).json({ error: `Nie znaleziono kraju ojca o parametrze: ${father.countryCode}` });
                        }
                        fatherCountryId = fatherCountry._id;
                    }

                    const safeFatherName = escapeRegex(father.name.trim());
                    const fatherDoc = await Horse.findOne({
                        name: { $regex: safeFatherName, $options: 'i' },
                        country: fatherCountryId,
                        birthYear: Number(father.birthYear)
                    });

                    if (!fatherDoc) {
                        return res.status(404).json({ 
                            error: `Podany ojciec (${father.name}, rok: ${father.birthYear}) nie istnieje w bazie!` 
                        });
                    }

                    if (fatherDoc.gender && fatherDoc.gender.toLowerCase() !== 'ogier') {
                        return res.status(400).json({ error: `Wskazany ojciec (${father.name}) nie jest ogierem!` });
                    }

                    if (fatherDoc._id.equals(horse._id)) {
                        return res.status(400).json({ error: "Koń nie może być swoim własnym ojcem!" });
                    }

                    horse.father = fatherDoc._id;
                } else {
                    return res.status(400).json({ error: "Ojciec wymaga przekazania pól 'name' oraz 'birthYear'!" });
                }
            }

            if (mother !== undefined) {
                if (mother === null) {
                    horse.mother = null;
                } else if (mother.name && mother.birthYear) {
                    let motherCountryId = targetCountryId;

                    if (mother.countryCode) {
                        const motherCountry = await Country.findByCodeOrName(mother.countryCode);
                        if (!motherCountry) {
                            return res.status(404).json({ error: `Nie znaleziono kraju matki o parametrze: ${mother.countryCode}` });
                        }
                        motherCountryId = motherCountry._id;
                    }

                    const safeMotherName = escapeRegex(mother.name.trim());
                    const motherDoc = await Horse.findOne({
                        name: { $regex: safeMotherName, $options: 'i' },
                        country: motherCountryId,
                        birthYear: Number(mother.birthYear)
                    });

                    if (!motherDoc) {
                        return res.status(404).json({ 
                            error: `Podana matka (${mother.name}, rok: ${mother.birthYear}) nie istnieje w bazie!` 
                        });
                    }

                    if (motherDoc.gender && motherDoc.gender.toLowerCase() !== 'klacz') {
                        return res.status(400).json({ error: `Wskazana matka (${mother.name}) nie jest klaczą!` });
                    }

                    if (motherDoc._id.equals(horse._id)) {
                        return res.status(400).json({ error: "Koń nie może być swoją własną matką!" });
                    }

                    horse.mother = motherDoc._id;
                } else {
                    return res.status(400).json({ error: "Matka wymaga przekazania pól 'name' oraz 'birthYear'!" });
                }
            }

            await horse.save();

            res.status(200).json({ message: "Pomyślnie zaktualizowano dane konia", horse });

        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ error: "Koń o takiej nazwie, kraju i roku urodzenia już istnieje w bazie!" });
            }
            res.status(500).json({ error: err.message });
        }
    });

router.get('/lineAge/:nameHorse/:countryHorse/:birthYearHorse', async (req, res) => {
    try {
        const { nameHorse, countryHorse, birthYearHorse } = req.params;
        const depth = parseInt(req.query.depth) || 3;

        const horseLineage = await lineageQuery(nameHorse, countryHorse, birthYearHorse, depth);

        if (!horseLineage) {
            return res.status(404).json({
                error: `Nie znaleziono kraju lub konia dla podanych parametrów: ${nameHorse}, ${countryHorse}, ${birthYearHorse}`
            });
        }

        res.status(200).json(horseLineage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function buildHorseQuery(name, countryParam, birthYear) {
    if (!name || !countryParam || !birthYear) return null;

    const country = await Country.findByCodeOrName(countryParam);

    if (!country) return null;

    const safeName = escapeRegex(name.trim());

    return {
        name: { $regex: `^${safeName}$`, $options: 'i' },
        country: country._id,
        birthYear: Number(birthYear)
    };
}

function buildLineageTree(depth) {
    if (depth <= 0) return [];

    return [
        {
            path: 'father',
            populate: [
                { path: 'country' },
                ...buildLineageTree(depth - 1)
            ]
        },
        {
            path: 'mother',
            populate: [
                { path: 'country' },
                ...buildLineageTree(depth - 1)
            ]
        }
    ];
}

async function lineageQuery(nameHorse, countryHorse, birthYearHorse, depth = 3) {
    const query = await buildHorseQuery(nameHorse, countryHorse, birthYearHorse);
    
    if (!query) return null;

    const lineageTree = buildLineageTree(depth);

    return await Horse.findOne(query)
        .populate('country')
        .populate('breeder')
        .populate(lineageTree);
}

module.exports = router;
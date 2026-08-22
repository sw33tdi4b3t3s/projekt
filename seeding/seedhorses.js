const mongoose = require("mongoose");
const { fakerPL } = require('@faker-js/faker');
const Country = require("../models/Country");
const Breeder = require("../models/Breeder");
const Horse = require("../models/Horse");
const connectDB = require("../db.js");

const faker = fakerPL;

const currentYear = new Date().getFullYear();
let qtyGen = 7; 
let qtyHorsesPerGen = 40;
let qtyBreeders = 10;
let baseCountries = [];
let baseBreeders = [];

function generateHorseName(gender){
    if(gender === "ogier" || gender === "wałach"){
        return faker.person.firstName("male");
    }

    if(gender === "klacz"){
        return faker.person.firstName("female");
    }

    return faker.person.firstName();
}

async function seedCountries(){
    await Country.deleteMany({});

    const countries = [
        {name: "Polska" , code: "PL"},
        {name: "Francja" , code: "FR"},
        {name: "Hiszpania" , code: "ES"},
        {name: "Włochy" , code: "IT"},
        {name: "Niemcy" , code: "DE"},
        {name: "Arabia Saudyjska" , code: "AS"}
    ];

    baseCountries = await Country.insertMany(countries);
}

async function seedBreeders(){
    await Breeder.deleteMany({});

    const breeders = [];

    for(let i = 0; i < qtyBreeders; i++){
        const breederName = faker.person.firstName() +" "+ faker.person.lastName();
        const breederCountry = faker.helpers.arrayElement(baseCountries);
        const breederNotes = faker.lorem.sentences(3);
        breeders.push({name: breederName, country: breederCountry._id, notes: breederNotes});
    }

    baseBreeders = await Breeder.insertMany(breeders);
}

async function seedHorses(){
    await Horse.deleteMany({});
    
    const genders = ["ogier", "klacz", "wałach"];
    const colors = ["siwa", "gniada", "kasztanowata", "kara"];
    const startYearForOldestGen = 1930;
    let previousGenOgiery = [];
    let previousGenKlacze = [];

    for(let gen = qtyGen; gen >= 0; gen--){
        console.log(`\nGenerowanie pokolenia: ${gen} wstecz...`);

        let savedHorsesInThisGen = [];

        for(let i = 0; i < qtyHorsesPerGen; i++){
            let horseBirthYear, fatherId = null, motherId = null;

            if(gen === qtyGen){
                horseBirthYear = faker.number.int({min: startYearForOldestGen, max: startYearForOldestGen + 10});
            } else {
                if(previousGenKlacze.length === 0 || previousGenOgiery.length === 0){
                    break;
                }

                const mother = faker.helpers.arrayElement(previousGenKlacze);

                const validFathers = previousGenOgiery.filter(
                    o => Math.abs(o.birthYear - mother.birthYear) <= 18
                );

                if(validFathers.length === 0) continue;

                const father = faker.helpers.arrayElement(validFathers);

                const minYear = Math.max(father.birthYear + 3, mother.birthYear + 3);
                let maxYear = Math.min(father.birthYear + 21, mother.birthYear + 21);

                if(maxYear > currentYear) maxYear = currentYear;
                if(minYear > maxYear) continue;

                horseBirthYear = faker.number.int({min: minYear, max: maxYear});
                fatherId = father._id;
                motherId = mother._id;
            }

            const genderRoll = Math.random();
            let horseGender = "wałach";
            if(genderRoll < 0.45) {
                horseGender = "ogier";
            } else if(genderRoll < 0.90){
                horseGender = "klacz";
            }

            const horseName = generateHorseName(horseGender);

            const newHorse = new Horse({
                name: horseName,
                birthYear: horseBirthYear,
                gender: horseGender,
                color: faker.helpers.arrayElement(colors),
                country: faker.helpers.arrayElement(baseCountries)._id,
                breeder: faker.helpers.arrayElement(baseBreeders)._id,
                notes: faker.lorem.sentence()
            });

            if (fatherId && motherId) {
                newHorse.father = fatherId;
                newHorse.mother = motherId;
            }
            
            try {
                await newHorse.save();
                savedHorsesInThisGen.push(newHorse);
            } catch (err) {
                if(err.code !== 11000) {
                    console.log(`Błąd walidacji przy zapisie konia (rodowód odrzucony): ${err.message}`);
                }
            }
        }
        
        console.log(`Wygenerowano i zapisano ${savedHorsesInThisGen.length} koni w pokoleniu ${gen}.`);
        previousGenOgiery = savedHorsesInThisGen.filter(h => h.gender === "ogier");
        previousGenKlacze = savedHorsesInThisGen.filter(h => h.gender === "klacz");
    }
}

async function seedDataBase(){
    try{
        await connectDB();
        
        await seedCountries();
        await seedBreeders();
        await seedHorses();

        console.log("Pomyślny seed");

        await mongoose.disconnect();

    }catch(err){
        console.log("blad przy seedowaniu: "+err.message);
    }
}

seedDataBase();
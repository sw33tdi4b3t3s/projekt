const mongoose = require('mongoose');


const connectDB = async () =>{
    try{
        await mongoose.connect('mongodb://localhost:27017/KONIOWELOVEDB');
        console.log('Połączono z MongoDB...');

    }catch(err){
        console.log('Nie udało sie połączyć z MongoDB...',err);
    }
};

module.exports = connectDB;
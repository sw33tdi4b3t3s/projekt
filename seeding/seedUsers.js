const mongoose = require("mongoose");
const connectDB = require("../db.js");
const User = require("../models/User");

const seedUsers = async () => {
    try {
        // Używamy Twojej funkcji do połączenia z bazą
        await connectDB();
        console.log('Połączono z bazą danych (seedowanie użytkowników)...');

        // Definicja testowych użytkowników
        const testUsers = [
            {
                name: 'Zwykły User',
                email: 'user@test.com',
                password: 'user123',
                role: 'user'
            },
            {
                name: 'Super Admin',
                email: 'admin@test.com',
                password: 'admin123',
                role: 'admin'
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (!existingUser) {
                await User.create(userData);
                console.log(`[SUKCES] Utworzono konto (${userData.role}): ${userData.email}`);
            } else {
                console.log(`[INFO] Konto z emailem ${userData.email} już istnieje w bazie.`);
            }
        }

        console.log('Seedowanie użytkowników zakończone pomyślnie!');
    } catch (err) {
        console.error('Wystąpił błąd podczas seedowania użytkowników:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Rozłączono z bazą danych.');
    }
};

seedUsers();
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createFirstAdmin = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      process.exit(0);
    }

    // Créer l'admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@davybookzone.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

createFirstAdmin(); 
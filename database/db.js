const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
    throw error;
  }
};

mongoose.connection.on('error', (err) => {
  console.error('Erreur connexion MongoDB:', err);
});

module.exports = connectDB;

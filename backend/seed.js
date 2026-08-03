require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing admin
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('solomon2026', 10);
    await User.create({ username: 'solomon', password: hashedPassword });

    console.log('✅ Admin account created!');
    console.log('   Username: solomon');
    console.log('   Password: solomon2026');
    console.log('   ⚠️  Change this password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();

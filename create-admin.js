const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://nihan:Killer888beats@nihan.3jzvm5.mongodb.net/climate-sustainability?retryWrites=true&w=majority&appName=nihan';

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'nihan9t9' });
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists');
            await mongoose.connection.close();
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('1234', 10);

        // Create admin
        const admin = new Admin({
            username: 'nihan9t9',
            password: hashedPassword,
            name: 'Nihan Admin',
            email: 'nihan@example.com',
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('Username: nihan9t9');
        console.log('Password: 1234');

        // Verify creation
        const admins = await Admin.find({});
        console.log(`Total admins in database: ${admins.length}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

createAdmin();
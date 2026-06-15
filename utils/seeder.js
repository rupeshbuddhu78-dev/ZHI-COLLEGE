const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@zhi.edu.in' });
        if (!adminExists) {
            await User.create({
                role: 'director',
                email: 'admin@zhi.edu.in',
                password: 'admin123'
            });
            console.log("👤 Admin seeded: admin@zhi.edu.in / admin123");
        }
    } catch (error) {
        console.error("❌ Admin Seeding Error:", error);
    }
};

module.exports = seedAdmin;

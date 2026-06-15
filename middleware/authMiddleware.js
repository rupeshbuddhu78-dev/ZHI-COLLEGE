const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.protect = (req, res, next) => {
    let token;

    // 1. Check karo ki request ke header mein 'Authorization' hai aur wo 'Bearer' se shuru ho raha hai
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Token nikal lo (Bearer <token> mein se 2nd part)
            token = req.headers.authorization.split(' ')[1];

            // 3. Token verify karo asli hai ya nahi
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. User ki details request object mein daal do
            req.user = decoded; 

            next(); // 5. Sab sahi hai, aage Controller ke paas jane do!
        } catch (error) {
            return res.status(401).json({ success: false, message: "Token galat hai ya expire ho gaya!" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Bina token ke entry allowed nahi hai!" });
    }
};

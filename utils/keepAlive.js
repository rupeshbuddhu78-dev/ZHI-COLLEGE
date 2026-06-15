const https = require('https');

const keepAlive = () => {
    const SERVER_URL = 'https://zhi-college-rtya.onrender.com';
    setInterval(() => {
        https.get(SERVER_URL, (res) => {
            if (res.statusCode === 200) {
                console.log('⏰ Server khud ko ping kar raha hai taaki soye nahi! (Status: 200)');
            }
        }).on('error', (err) => {
            console.error('❌ Ping failed:', err.message);
        });
    }, 14 * 60 * 1000); // 14 mins interval
};

module.exports = keepAlive;

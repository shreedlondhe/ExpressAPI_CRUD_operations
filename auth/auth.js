const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const authPath = path.join(__dirname, 'auth.json');

// Store active tokens in memory
const activeTokens = new Set();


// ========================================
// READ USERS FROM auth.json
// ========================================

function readUsers() {

    const data = fs.readFileSync(authPath, 'utf-8');

    return JSON.parse(data);
}


// ========================================
// GENERATE TOKEN
// ========================================

function generateToken() {

    return crypto.randomBytes(32).toString('hex');
}


// ========================================
// AUTHENTICATE USER
// ========================================

function authenticate(username, password) {

    const users = readUsers();

    if (
        users[username] &&
        users[username] === password
    ) {

        const token = generateToken();

        activeTokens.add(token);

        return token;
    }

    return null;
}


// ========================================
// AUTHORIZATION MIDDLEWARE
// ========================================

function authorize(req, res, next) {

    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader) {

        return res.status(401).json({
            message: 'Authorization header is missing'
        });
    }


    // Check Bearer format

    if (!authHeader.startsWith('Bearer ')) {

        return res.status(401).json({
            message: 'Invalid authorization format'
        });
    }


    // Extract token

    const token = authHeader.split(' ')[1];


    // Validate token

    if (!activeTokens.has(token)) {

        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }


    // Token is valid
    next();
}


module.exports = {
    authenticate,
    authorize
};
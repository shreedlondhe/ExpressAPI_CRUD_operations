const express = require('express');
const fs = require('fs');
const path = require('path');

const {
    authenticate,
    authorize
} = require('./auth/auth');

const app = express();

const PORT = 3000;

app.use(express.json());


// ========================================
// DATABASE
// ========================================

const dbPath = path.join(
    __dirname,
    'dataBase',
    'data.json'
);


function readDatabase() {

    const data = fs.readFileSync(
        dbPath,
        'utf-8'
    );

    return JSON.parse(data);
}


function writeDatabase(data) {

    fs.writeFileSync(
        dbPath,
        JSON.stringify(data, null, 2)
    );
}


// ========================================
// GENERATE TOKEN
// ========================================

app.post('/auth/token', (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {

        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    const token = authenticate(
        username,
        password
    );

    if (!token) {

        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    res.json({
        message: 'Token generated successfully',
        token: token
    });
});


// ========================================
// GET ALL USERS
// ========================================

app.get('/users', authorize, (req, res) => {

    const users = readDatabase();

    res.json(users);
});


// ========================================
// GET USER BY ID
// ========================================

app.get('/users/:id', authorize, (req, res) => {

    const users = readDatabase();

    const id = Number(req.params.id);

    const user = users.find(
        user => user.id === id
    );

    if (!user) {

        return res.status(404).json({
            message: 'User not found'
        });
    }

    res.json(user);
});


// ========================================
// VALIDATE USER PAYLOAD
// ========================================

function validateUserPayload(payload) {

    const requiredFields = ['name', 'age', 'city'];
    const missingFields = requiredFields.filter(field => {
        const value = payload?.[field];

        if (field === 'age') {
            return value === undefined || value === null || value === '' || Number.isNaN(Number(value));
        }

        return value === undefined || value === null || String(value).trim() === '';
    });

    return {
        isValid: missingFields.length === 0,
        missingFields
    };
}


// ========================================
// CREATE USER
// ========================================

app.post('/users', authorize, (req, res) => {

    const users = readDatabase();
    const payload = req.body || {};
    const { isValid, missingFields } = validateUserPayload(payload);

    if (!isValid) {

        return res.status(400).json({
            success: false,
            message: 'All required user fields are mandatory',
            requiredFields: ['name', 'age', 'city'],
            missingFields: missingFields,
            received: payload
        });
    }

    const newUser = {

        id: users.length > 0
            ? users[users.length - 1].id + 1
            : 1,

        name: String(payload.name).trim(),

        age: Number(payload.age),

        city: String(payload.city).trim()
    };

    users.push(newUser);

    writeDatabase(users);

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: newUser
    });
});


// ========================================
// UPDATE USER
// ========================================

app.put('/users/:id', authorize, (req, res) => {

    const users = readDatabase();
    const payload = req.body || {};
    const { isValid, missingFields } = validateUserPayload(payload);

    const id = Number(req.params.id);

    const userIndex = users.findIndex(
        user => user.id === id
    );

    if (userIndex === -1) {

        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (!isValid) {

        return res.status(400).json({
            success: false,
            message: 'All required user fields are mandatory',
            requiredFields: ['name', 'age', 'city'],
            missingFields: missingFields,
            received: payload
        });
    }

    users[userIndex] = {

        id: id,

        name: String(payload.name).trim(),

        age: Number(payload.age),

        city: String(payload.city).trim()
    };

    writeDatabase(users);

    res.json({
        success: true,
        message: 'User updated successfully',
        user: users[userIndex]
    });
});


// ========================================
// DELETE USER
// ========================================

app.delete('/users/:id', authorize, (req, res) => {

    const users = readDatabase();

    const id = Number(req.params.id);

    const userIndex = users.findIndex(
        user => user.id === id
    );

    if (userIndex === -1) {

        return res.status(404).json({
            message: 'User not found'
        });
    }

    const deletedUser = users.splice(
        userIndex,
        1
    );

    writeDatabase(users);

    res.json({

        message: 'User deleted successfully',

        user: deletedUser[0]
    });
});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});
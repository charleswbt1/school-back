require('dotenv').config();
const admin = require('firebase-admin');

let db = null;

function initializeFirebase() {
    try {
        if (!admin.apps.length) {
            admin.initializeApp();
            console.log('Firebase initialized successfully.');
        }
        db = admin.firestore();
        db.settings({
            databaseId: 'school'
        });
        return db;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

function getDb() {
    if (!db) {
        return initializeFirebase();
    }
    return db;
}

module.exports = {
    admin,
    initializeFirebase,
    getDb
};
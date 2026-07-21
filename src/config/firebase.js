require('dotenv').config();
const admin = require('firebase-admin');

let db = null;
let bucket = null;

function initializeFirebase() {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: process.env.GOOGLE_CLOUD_PROJECT,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        }
        db = admin.firestore();
        db.settings({
            databaseId: 'school'
        });

        bucket = admin.storage().bucket();
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

function getBucket() {
    if (!bucket) {
        initializeFirebase();
    }
    return bucket;
}

module.exports = {
    admin,
    initializeFirebase,
    getDb,
    getBucket
};
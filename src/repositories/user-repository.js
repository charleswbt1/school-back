const { getDb } = require('../config/firebase.js');

class UserRepository {
    async getAllUsers() {
        const db = getDb();
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getUserById(id) {
        const userRef = db.collection('users').doc(id);
        const doc = await userRef.get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }

    async createUser(userData) {
        const usersRef = db.collection('users');
        const newUserRef = await usersRef.add(userData);
        const newUser = await newUserRef.get();
        return { id: newUser.id, ...newUser.data() };
    }

    async updateUser(id, userData) {
        const userRef = db.collection('users').doc(id);
        await userRef.update(userData);
        const updatedUser = await userRef.get();
        return { id: updatedUser.id, ...updatedUser.data() };
    }

    async deleteUser(id) {
        const userRef = db.collection('users').doc(id);
        await userRef.delete();
        return { message: 'User deleted successfully' };
    }
}

module.exports = new UserRepository();

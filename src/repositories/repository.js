const { getDb } = require('../config/firebase.js');

class Repository {

    getCollection(collectionName) {
        return getDb().collection(collectionName);
    }

    async getAll(collectionName) {
        const snapshot = await this
            .getCollection(collectionName)
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getByState(state, collectionName) {
        const snapshot = await this
            .getCollection(collectionName)
            .where('state', '==', state)
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getById(id, collectionName) {
        const ref = this
            .getCollection(collectionName)
            .doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    async create(data, collectionName) {
        const prefix = collectionName
            .replace(/s$/, '')
            .substring(0, 3)
            .toUpperCase();
        const newData = {
            id: `${prefix}_${Date.now()}`,
            ...JSON.parse(JSON.stringify(data)),
            state: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const docRef = this
            .getCollection(collectionName)
            .doc(newData.id);
        await docRef.set(newData);

        const newDoc = await docRef.get();
        return {
            id: newDoc.id,
            ...newDoc.data()
        };
    }

    async update(id, data, collectionName) {
        const ref = this
            .getCollection(collectionName)
            .doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new Error(`${collectionName} ${id} not found`);
        }
        await ref.update({
            ...JSON.parse(JSON.stringify(data)),
            updatedAt: new Date()
        });
        const updatedDoc = await ref.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data()
        };
    }

    async delete(id, collectionName) {
        const ref = this
            .getCollection(collectionName)
            .doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new Error(`${collectionName} ${id} not found`);
        }
        await ref.update({ state: 'inactive' });
        return {
            message: 'Deleted successfully'
        };
    }
}

module.exports = new Repository();
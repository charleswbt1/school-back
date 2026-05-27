const { getDb } = require('../config/firebase.js');

class AdviserRepository {
    constructor() {
        this.db = getDb();
        this.collection = this.db.collection('adviser');
    }

    async getAll() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getById(id) {
        const ref = this.collection.doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }

    async create(data) {
        const adviserData = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const saveRef = await this.collection.add(adviserData);
        const newDoc = await saveRef.get();
        return {
            id: newDoc.id,
            ...newDoc.data()
        };
    }

    async update(id, data) {
        const ref = this.collection.doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new Error(`update ${id} not found`);
        }
        await ref.update({
            ...data,
            updatedAt: new Date()
        });
        const updatedRef = await ref.get();
        return { id: updatedRef.id, ...updatedRef.data() };
    }

    async delete(id) {
        const ref = this.collection.doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new Error(`delete ${id} not found`);
        }
        await ref.delete();
        return { message: 'Deleted successfully' };
    }
}

module.exports = new AdviserRepository();

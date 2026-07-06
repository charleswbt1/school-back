const { getDb } = require('../config/firebase.js');
const admin = require('firebase-admin');

class Repository {

    getCollection(collectionName) {
        return getDb().collection(collectionName);
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

    async query(collectionName, filters = [], orderBy = null, limit = null) {
        let ref = this.getCollection(collectionName);

        for (const [field, op, value] of filters) {
            ref = ref.where(field, op, value);
        }
        if (orderBy) {
            ref = ref.orderBy(orderBy.field, orderBy.direction || 'asc');
        }
        if (limit) {
            ref = ref.limit(limit);
        }

        const snapshot = await ref.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async create(data, collectionName, state) {
        const prefix = collectionName
            .replace(/s$/, '')
            .substring(0, 3)
            .toUpperCase();
        const cleanData = this.removeUndefined(data);
        const newData = {
            id: `${prefix}_${Date.now()}`,
            state: state || 'active',
            ...cleanData,
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
            throw new Error(`${collectionName} ${id} no encontrado`);
        }

        const cleanData = this.removeUndefined(data);
        await ref.update({
            ...cleanData,
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
            throw new Error(`${collectionName} ${id} no encontrado`);
        }
        await ref.delete();
        return {
            message: 'Eliminado exitosamente'
        };
    }

    async softDelete(id, collectionName) {
        const ref = this
            .getCollection(collectionName)
            .doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new Error(`${collectionName} ${id} no encontrado`);
        }
        await ref.update({ state: 'inactive' });
        return {
            message: 'Eliminado exitosamente'
        };
    }

    async validUnique(key, value) {
        const ref = this.getCollection('users')
            .where(key, '==', value)
            .limit(1);
        const snapshot = await ref.get();
        return {
            item: key,
            valid: snapshot.empty,
            message: snapshot.empty ? `${key} es disponible` : `${key} ya está en uso`
        };
    }

    removeUndefined(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.removeUndefined(item));
        }

        if (
            obj instanceof Date ||
            obj instanceof admin.firestore.Timestamp ||
            obj instanceof admin.firestore.GeoPoint ||
            obj instanceof admin.firestore.DocumentReference
        ) {
            return obj;
        }

        if (obj && typeof obj === 'object') {
            return Object.fromEntries(
                Object.entries(obj)
                    .filter(([, value]) => value !== undefined)
                    .map(([key, value]) => [
                        key,
                        this.removeUndefined(value)
                    ])
            );
        }

        return obj;
    }
}

module.exports = new Repository();
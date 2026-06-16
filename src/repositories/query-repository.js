const { getDb } = require('../config/firebase.js');

class QueryRepository {

    getCollection(collectionName) {
        return getDb().collection(collectionName);
    }

    async getCredential(nickname, password) {
        const ref = this
            .getCollection('users')
            .where('nick_name', '==', nickname)
            .limit(1);
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    async validUnique(key, value) {
        const ref = this
            .getCollection('users')
            .where(key, '==', value)
            .limit(1);
        const snapshot = await ref.get();
        return {
            item: key,
            valid: snapshot.empty,
            message: snapshot.empty ? `${key} is available` : `${key} is already taken`
        };
    }

    async getCoursesByUserId(userId) {
        const ref = this
            .getCollection('students')
            .where('user_id', '==', userId);
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getStudentsByCourseId(courseId) {
        const ref = this
            .getCollection('students')
            .where('course_id', '==', courseId)
            .where('state', '==', 'active');
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getStudentsByAdviserId(adviserId) {
        const ref = this
            .getCollection('students')
            .where('adviser_id', '==', adviserId);
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getStudentByCourseIdAndUserId(courseId, userId) {
        const ref = this
            .getCollection('students')
            .where('course_id', '==', courseId)
            .where('user_id', '==', userId)
            .limit(1);
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    async getUsersByRole(role) {
        const ref = this
            .getCollection('users')
            .where('role', '==', role);
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getPeriod(month, year) {
        const ref = this
            .getCollection('periods')
            .where('month', '==', month)
            .where('year', '==', year)
            .limit(1);
        const snapshot = await ref.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}
module.exports = new QueryRepository();
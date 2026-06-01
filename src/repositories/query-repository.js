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

}

module.exports = new QueryRepository();
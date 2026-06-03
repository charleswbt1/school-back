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

    async isEmailValid(email) {
        const ref = this
            .getCollection('users')
            .where('email', '==', email)
            .limit(1);
        const snapshot = await ref.get();
        return {
            item: 'email',
            valid: snapshot.empty,
            message: snapshot.empty ? 'Email is available' : 'Email is already taken'
        };
    }

    async isNicknameValid(nick_name) {
        const ref = this
            .getCollection('users')
            .where('nick_name', '==', nick_name)
            .limit(1);
        const snapshot = await ref.get();
        return {
            item: 'nick_name',
            valid: snapshot.empty,
            message: snapshot.empty ? 'Nickname is available' : 'Nickname is already taken'
        };
    }

}

module.exports = new QueryRepository();
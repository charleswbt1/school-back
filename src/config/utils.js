const { getBucket } = require('./firebase.js');

class StorageUtil {
    static async uploadFile(file, folder = 'uploads') {
        try {
            if (!file) { return null; }

            const bucket = getBucket();
            const fileName = `${folder}/${Date.now()}-${file.originalname}`;
            const bucketFile = bucket.file(fileName);

            await bucketFile.save(
                file.buffer,
                {
                    metadata: {
                        contentType:
                            file.mimetype
                    }
                }
            );

            const [url] =
                await bucketFile.getSignedUrl({
                    action: 'read',
                    expires:
                        '03-01-2500'
                });

            return {
                fileName,
                url
            };

        } catch (error) {

            console.error(
                'Error uploading file:',
                error
            );

            throw error;
        }
    }

    static async deleteFile(
        fileName
    ) {

        try {

            const bucket = getBucket();

            await bucket
                .file(fileName)
                .delete();

            return true;

        } catch (error) {

            console.error(
                'Error deleting file:',
                error
            );

            throw error;
        }
    }

    static async getSignedUrl(
        fileName
    ) {

        try {

            const bucket = getBucket();

            const [url] =
                await bucket
                    .file(fileName)
                    .getSignedUrl({
                        action: 'read',
                        expires:
                            '03-01-2500'
                    });

            return url;

        } catch (error) {

            console.error(
                'Error generating signed url:',
                error
            );

            throw error;
        }
    }

    static formatDates(data) {
        return {
            ...data,
            createdAt: data.createdAt?.toDate?.().toISOString(),
            updatedAt: data.updatedAt?.toDate?.().toISOString()
        };
    }
}

module.exports = StorageUtil;
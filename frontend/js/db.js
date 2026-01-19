import { openDB } from 'idb';

const DB_NAME = 'virtual-staging-db';
const DB_VERSION = 1;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        // Store for Photo Editor sessions and history
        if (!db.objectStoreNames.contains('editor-sessions')) {
            const store = db.createObjectStore('editor-sessions', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp');
        }

        // Store for Virtual Staging results
        if (!db.objectStoreNames.contains('staging-results')) {
            const store = db.createObjectStore('staging-results', { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp');
        }
    },
});

export const db = {
    async getEditorSession() {
        // For simplicity in this version, we just get the most recent session or a fixed 'current' one
        // Enhancing to support multiple sessions would be a next step
        return (await dbPromise).get('editor-sessions', 'current');
    },

    async saveEditorSession(data) {
        return (await dbPromise).put('editor-sessions', { id: 'current', ...data, timestamp: Date.now() });
    },

    async getStagingResults() {
        return (await dbPromise).getAll('staging-results');
    },

    async saveStagingResult(result) {
        return (await dbPromise).put('staging-results', { ...result, timestamp: Date.now() });
    },

    async clearStagingResults() {
        return (await dbPromise).clear('staging-results');
    }
};

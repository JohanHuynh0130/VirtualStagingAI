import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, getDB } from '../database.js';
import dotenv from 'dotenv';
// Removed csv-parse dependency

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importFurniture() {
    const csvPath = process.argv[2] || path.join(__dirname, '../furniture.csv');

    if (!fs.existsSync(csvPath)) {
        console.error(`CSV file not found at ${csvPath}`);
        console.log("Please select a valid CSV file (FurnitureID, URL)");
        process.exit(1);
    }

    await initDB();
    const db = getDB();

    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

    let count = 0;
    for (const line of lines) {
        // format: FurnitureID, URL or FurnitureID - URL
        let parts = line.split(',');
        if (parts.length < 2) {
            parts = line.split('-'); // Try fallback separator
        }

        if (parts.length >= 2) {
            const externalId = parts[0].trim();
            const url = parts.slice(1).join('-').trim().replace(/,/g, ''); // Basic cleanup

            if (externalId && url) {
                try {
                    await db.run(
                        'INSERT OR REPLACE INTO furniture_sets (external_id, url, name) VALUES (?, ?, ?)',
                        externalId, url, `Set ${externalId}`
                    );
                    count++;
                } catch (e) {
                    console.error(`Failed to import ${externalId}:`, e.message);
                }
            }
        }
    }

    console.log(`Imported ${count} furniture sets.`);
}

importFurniture().catch(console.error);

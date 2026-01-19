import { initDB, getDB } from '../database.js';

async function listFurniture() {
    await initDB();
    const db = getDB();
    const sets = await db.all('SELECT * FROM furniture_sets');
    console.log(`Total sets: ${sets.length}`);
    sets.forEach(s => console.log(`${s.external_id} - ${s.url}`));
}

listFurniture().catch(console.error);

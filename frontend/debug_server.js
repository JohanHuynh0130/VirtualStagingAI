console.log("Debug: Starting...");
try {
    const fs = await import('fs');
    console.log("Debug: fs imported");
    const db = await import('./database.js');
    console.log("Debug: database imported");
    await db.initDB();
    console.log("Debug: DB initialized");
} catch (e) {
    console.error("Debug: Error caught:", e);
}

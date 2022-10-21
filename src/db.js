import { Low, JSONFile } from "lowdb";

// use JSON file for storage
const adapter = new JSONFile("db.json");
const db = new Low(adapter);

// initial db read
await db.read();

export default db;

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

let api = express.Router();
let db;

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);

  // Since I'm storing the data in a data folder I have to ensure this folder actually exists
  const dataDir = path.resolve("data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = await open({
    filename: "data/scores.db",
    driver: sqlite3.Database,
  });

  // Create the scores table if it doesn’t already exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      score INTEGER,
      game TEXT,
      date TEXT
    )
  `);

  console.log("SQLite ready (scores.db)");
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});
//Handles saving a new score
api.post("/scores", async (req, res) => {
  try {
    const { name, score, game } = req.body;
    // Check if needed values exist. Also, score of 0 can be stored.
    if (!name || score === undefined || score === null || !game) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const cleanName = String(name).toUpperCase().substring(0, 3); // Just in case, I clean the name again (3 letters all upper case)

    // Insert the values with standard SQL, ? prevent injections.
    await db.run(
      "INSERT INTO scores (name, score, game, date) VALUES (?, ?, ?, ?)",
      [cleanName, Number(score), String(game), new Date().toISOString()]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting score:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});
// Handles getting the score board for one game
api.get("/scores/:game", async (req, res) => {
  try {
    const { game } = req.params;
    // Select all scores from the game, Order by score value descending and select the first 10 scores.
    const rows = await db.all(
      "SELECT * FROM scores WHERE game = ? ORDER BY score DESC LIMIT 10",
      [game]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ error: "Database fetch failed" });
  }
});

/* Catch-all route to return a JSON error if endpoint not defined.
   Be sure to put all of your endpoints above this one, or they will not be called. */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
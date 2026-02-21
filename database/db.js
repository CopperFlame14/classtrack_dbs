const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'classroom_tracker.db');
let db = null;
let SQL = null;

// Initialize database
async function initDB() {
    if (db) return db;

    SQL = await initSqlJs();

    // Load existing database or create new one
    try {
        if (fs.existsSync(dbPath)) {
            const buffer = fs.readFileSync(dbPath);
            db = new SQL.Database(buffer);
        } else {
            db = new SQL.Database();
        }
    } catch (err) {
        db = new SQL.Database();
    }

    // ── MODULE 1: Block Management ──────────────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS blocks (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT
        )
    `);

    // ── MODULE 2: Department Management ────────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS departments (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT NOT NULL,
            block_id TEXT NOT NULL,
            FOREIGN KEY (block_id) REFERENCES blocks(id)
        )
    `);

    // ── MODULE 3: Classroom Management ─────────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS classrooms (
            id               TEXT PRIMARY KEY,
            block_id         TEXT NOT NULL,
            floor            INTEGER NOT NULL,
            capacity         INTEGER NOT NULL,
            status_override  TEXT,
            override_expires TEXT,
            FOREIGN KEY (block_id) REFERENCES blocks(id)
        )
    `);

    // ── MODULE 4: Time Slot Management ─────────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS time_slots (
            id         INTEGER PRIMARY KEY,
            start_time TEXT NOT NULL,
            end_time   TEXT NOT NULL,
            label      TEXT
        )
    `);

    // ── MODULE 9: Amenities Management ─────────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS amenities (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    `);

    // ── MODULE 5: Course Management ────────────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS courses (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            code          TEXT NOT NULL UNIQUE,
            name          TEXT NOT NULL,
            department_id INTEGER NOT NULL,
            FOREIGN KEY (department_id) REFERENCES departments(id)
        )
    `);

    // ── MODULE 6: Faculty Management ───────────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS faculty (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT NOT NULL,
            department_id INTEGER NOT NULL,
            FOREIGN KEY (department_id) REFERENCES departments(id)
        )
    `);

    // ── MODULE 7: Academic Timetable Management ────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS timetable (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id    TEXT    NOT NULL,
            slot_id    INTEGER NOT NULL,
            course_id  INTEGER NOT NULL,
            faculty_id INTEGER NOT NULL,
            day        TEXT    NOT NULL,
            FOREIGN KEY (room_id)    REFERENCES classrooms(id),
            FOREIGN KEY (slot_id)    REFERENCES time_slots(id),
            FOREIGN KEY (course_id)  REFERENCES courses(id),
            FOREIGN KEY (faculty_id) REFERENCES faculty(id)
        )
    `);

    // ── MODULE 8: Reservation Management ──────────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id    TEXT    NOT NULL,
            slot_id    INTEGER NOT NULL,
            date       TEXT    NOT NULL,
            purpose    TEXT,
            booked_by  TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES classrooms(id),
            FOREIGN KEY (slot_id) REFERENCES time_slots(id)
        )
    `);

    // ── MODULE 10: Classroom–Amenities Mapping ─────────────────────────────
    db.run(`
        CREATE TABLE IF NOT EXISTS classroom_amenities (
            classroom_id TEXT    NOT NULL,
            amenity_id   INTEGER NOT NULL,
            PRIMARY KEY (classroom_id, amenity_id),
            FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
            FOREIGN KEY (amenity_id)   REFERENCES amenities(id)
        )
    `);

    saveDB();
    return db;
}

// Save database to file
function saveDB() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// Helper methods to match better-sqlite3 API
function prepare(sql) {
    return {
        run: (...params) => {
            db.run(sql, params);
            saveDB();
            return { changes: db.getRowsModified(), lastInsertRowid: getLastInsertRowId() };
        },
        get: (...params) => {
            const stmt = db.prepare(sql);
            stmt.bind(params);
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                return row;
            }
            stmt.free();
            return undefined;
        },
        all: (...params) => {
            const results = [];
            const stmt = db.prepare(sql);
            stmt.bind(params);
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            return results;
        }
    };
}

function exec(sql) {
    db.exec(sql);
    saveDB();
}

function getLastInsertRowId() {
    const result = db.exec("SELECT last_insert_rowid() as id");
    return result[0]?.values[0]?.[0] || 0;
}

module.exports = {
    initDB,
    prepare,
    exec,
    saveDB,
    getDB: () => db
};

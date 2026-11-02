const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const DB_FILE = path.join(ROOT, "prisma", "test.db");

module.exports = async function globalTeardown() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const p = DB_FILE + suffix;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
};

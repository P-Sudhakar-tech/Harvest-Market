const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const DB_FILE = path.join(ROOT, "prisma", "test.db");

function removeDbFiles() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const p = DB_FILE + suffix;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

module.exports = async function globalSetup() {
  removeDbFiles();
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "inherit",
  });
};

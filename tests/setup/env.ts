// Runs before each test file's module registry is set up, so lib/db.ts's
// `new PrismaClient()` picks up the throwaway test database instead of dev.db.
process.env.DATABASE_URL = "file:./test.db";

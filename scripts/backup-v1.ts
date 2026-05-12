import { neon } from "@neondatabase/serverless";
import { writeFileSync } from "node:fs";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const sql = neon(process.env.DATABASE_URL);

  const items = await sql`SELECT * FROM items`;
  const profiles = await sql`SELECT * FROM profiles`;
  const users = await sql`SELECT * FROM "user"`;
  const sessions = await sql`SELECT * FROM session`;

  const backup = {
    backedUpAt: new Date().toISOString(),
    schemaVersion: "v1 (Phase 1)",
    counts: {
      items: items.length,
      profiles: profiles.length,
      users: users.length,
      sessions: sessions.length,
    },
    items,
    profiles,
    users,
    sessions,
  };

  const filename = `backup_v1_${new Date().toISOString().slice(0, 10)}.json`;
  writeFileSync(filename, JSON.stringify(backup, null, 2));
  console.log(`✅ ${filename}`);
  console.log(`  items: ${items.length}`);
  console.log(`  profiles: ${profiles.length}`);
  console.log(`  users: ${users.length}`);
  console.log(`  sessions: ${sessions.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

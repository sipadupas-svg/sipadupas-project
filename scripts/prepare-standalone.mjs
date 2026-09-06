import { cp, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneRoot = path.join(projectRoot, ".next", "standalone");

// 1. Static & public
await mkdir(path.join(standaloneRoot, ".next"), { recursive: true });
await cp(
  path.join(projectRoot, ".next", "static"),
  path.join(standaloneRoot, ".next", "static"),
  { recursive: true },
);
await cp(path.join(projectRoot, "public"), path.join(standaloneRoot, "public"), {
  recursive: true,
});

// 2. Prisma schema & client metadata (required for Prisma 6+ runtime)
const prismaSrc = path.join(projectRoot, "prisma");
if (existsSync(prismaSrc)) {
  await cp(prismaSrc, path.join(standaloneRoot, "prisma"), { recursive: true });
  console.log("✓ prisma/ copied");
}

// 3. Prisma engines & client (must be present at runtime)
const prismaClientModules = [
  ["node_modules/@prisma/client", "node_modules/@prisma/client"],
  ["node_modules/.prisma", "node_modules/.prisma"],
  ["node_modules/@prisma/engines", "node_modules/@prisma/engines"],
];
for (const [src, dest] of prismaClientModules) {
  const fullSrc = path.join(projectRoot, src);
  if (existsSync(fullSrc)) {
    const fullDest = path.join(standaloneRoot, dest);
    await cp(fullSrc, fullDest, { recursive: true });
    console.log(`✓ ${src} copied`);
  } else {
    console.warn(`! ${src} not found — Prisma may fail at runtime`);
  }
}

// 4. SQLite database directory (skip on Vercel — pakai PostgreSQL/Supabase)
const isVercel = process.env.VERCEL === "1";
const dbSrc = path.join(projectRoot, "db");
if (isVercel) {
  console.log("- Vercel build: skip db/ & .env copy");
} else if (existsSync(dbSrc)) {
  await cp(dbSrc, path.join(standaloneRoot, "db"), { recursive: true });
  console.log("✓ db/ copied");
} else {
  await mkdir(path.join(standaloneRoot, "db"), { recursive: true });
  console.log("✓ db/ directory created (empty)");
}

// 5. .env file (for runtime configuration) — skip on Vercel (env via dashboard)
const envSrc = path.join(projectRoot, ".env");
if (isVercel) {
  console.log("- Vercel build: .env not copied");
} else if (existsSync(envSrc)) {
  await copyFile(envSrc, path.join(standaloneRoot, ".env"));
  console.log("✓ .env copied");
}

console.log("\nStandalone assets prepared successfully.");

import { PrismaClient } from '@prisma/client';

const REF = 'aasaruvhvkzzxllpvzfz';
const PASS = process.env.SUPA_PASS;
const regions = [
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-south-1',
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'sa-east-1',
];

for (const region of regions) {
  const url = `postgresql://postgres.${REF}:${PASS}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=5`;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`MATCH: ${region}`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    const msg = String(e.message || e).slice(0, 120).replace(/\n/g, ' ');
    console.log(`FAIL: ${region} -> ${msg}`);
    await prisma.$disconnect().catch(() => {});
  }
}
console.log('NO_MATCH');

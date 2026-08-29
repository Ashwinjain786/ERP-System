import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/**
 * Repairs legacy demo rows and installs database-level library invariants.
 * This is deliberately idempotent so it can safely run on every container start.
 */
async function main() {
  const activeStatuses = ['issued', 'overdue'] as const;
  const active = await prisma.circulationRecord.findMany({
    where: { status: { in: [...activeStatuses] } },
    orderBy: [{ bookId: 'asc' }, { borrowerId: 'asc' }, { issueDate: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, bookId: true, borrowerId: true },
  });

  // A borrower can have at most one active loan for a given book. Preserve the
  // oldest row and close only duplicate legacy rows.
  const seenLoans = new Set<string>();
  for (const loan of active) {
    const key = `${loan.bookId}:${loan.borrowerId}`;
    if (seenLoans.has(key)) {
      await prisma.circulationRecord.update({
        where: { id: loan.id },
        data: { status: 'returned', returnDate: new Date(), fineAmount: 0 },
      });
    } else {
      seenLoans.add(key);
    }
  }

  // Keep one fine per circulation. Manual fines (without circulationId) remain untouched.
  const fines = await prisma.fineRecord.findMany({
    where: { circulationId: { not: null } },
    orderBy: [{ circulationId: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, circulationId: true },
  });
  const seenFines = new Set<string>();
  for (const fine of fines) {
    if (!fine.circulationId) continue;
    if (seenFines.has(fine.circulationId)) {
      await prisma.fineRecord.delete({ where: { id: fine.id } });
    } else {
      seenFines.add(fine.circulationId);
    }
  }

  // Reconcile available stock from the authoritative total and active loans.
  const books = await prisma.book.findMany({ select: { id: true, totalCopies: true } });
  for (const book of books) {
    const totalCopies = Math.max(0, book.totalCopies);
    const activeRows = await prisma.circulationRecord.findMany({
      where: { bookId: book.id, status: { in: [...activeStatuses] } },
      orderBy: [{ issueDate: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    });
    // If legacy data has more active loans than physical copies, close the
    // newest excess rows before rebuilding the available count.
    if (activeRows.length > totalCopies) {
      await prisma.circulationRecord.updateMany({
        where: { id: { in: activeRows.slice(totalCopies).map((row) => row.id) } },
        data: { status: 'returned', returnDate: new Date(), fineAmount: 0 },
      });
    }
    const activeCount = Math.min(activeRows.length, totalCopies);
    await prisma.book.update({
      where: { id: book.id },
      data: { totalCopies, availableCopies: totalCopies - activeCount },
    });
  }

  await prisma.$executeRawUnsafe(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'book_copy_counts_valid') THEN
        ALTER TABLE "Book" ADD CONSTRAINT book_copy_counts_valid
          CHECK ("totalCopies" >= 0 AND "availableCopies" >= 0 AND "availableCopies" <= "totalCopies");
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'circulation_dates_valid') THEN
        ALTER TABLE "CirculationRecord" ADD CONSTRAINT circulation_dates_valid
          CHECK ("dueDate" > "issueDate" AND ("returnDate" IS NULL OR "returnDate" >= "issueDate"));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fine_amount_valid') THEN
        ALTER TABLE "FineRecord" ADD CONSTRAINT fine_amount_valid CHECK ("amount" >= 0);
      END IF;
    END $$`);

  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS circulation_one_active_loan_per_borrower_book
      ON "CirculationRecord" ("bookId", "borrowerId")
      WHERE "status" IN ('issued', 'overdue')`);

  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS fine_one_per_circulation
      ON "FineRecord" ("circulationId")
      WHERE "circulationId" IS NOT NULL`);

  await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION enforce_fine_owner() RETURNS trigger AS $$
    BEGIN
      IF NEW."circulationId" IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM "CirculationRecord" c
        WHERE c."id" = NEW."circulationId" AND c."borrowerId" = NEW."userId"
      ) THEN
        RAISE EXCEPTION 'Fine userId must match circulation borrowerId';
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql`);

  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS fine_owner_matches_circulation ON "FineRecord"`);
  await prisma.$executeRawUnsafe(`CREATE TRIGGER fine_owner_matches_circulation
      BEFORE INSERT OR UPDATE OF "userId", "circulationId" ON "FineRecord"
      FOR EACH ROW EXECUTE FUNCTION enforce_fine_owner()`);

  console.log('Library integrity repair and constraints completed.');
}

main()
  .catch((error) => {
    console.error('Library integrity repair failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

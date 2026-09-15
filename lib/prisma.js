import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis;

function createPrismaClient() {
	const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
	if (!tursoUrl) return new PrismaClient();

	return new PrismaClient({
		adapter: new PrismaLibSQL({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN?.trim() }),
	});
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
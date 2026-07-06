import { PrismaClient } from "@prisma/client";

// Singleton de Prisma: evita agotar conexiones en desarrollo (hot reload)
// y en serverless (Vercel) reutiliza el cliente entre invocaciones.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

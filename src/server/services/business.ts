import { prisma } from "../db";

export interface BusinessInfo {
  id: string;
  name: string;
  logoUrl: string | null;
  units: string[];
  isDemo: boolean;
}

export async function getBusiness(businessId: string): Promise<BusinessInfo | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true, logoUrl: true, units: true, isDemo: true },
  });
  return business;
}

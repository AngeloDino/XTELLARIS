import { PrismaClient } from "@prisma/client";
import { resetDemoBusiness } from "../src/server/services/demo";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../src/server/demo-data";

const prisma = new PrismaClient();

async function main() {
  const businessId = await resetDemoBusiness(prisma);
  console.log(`✔ Negocio demo listo (id: ${businessId})`);
  console.log(`  Usuario demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log("");
  console.log("Para crear un negocio real:");
  console.log('  npm run create-business -- --business "Mi Tienda" --email dueno@correo.com --password "Secreta123" --name "Nombre Dueño"');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

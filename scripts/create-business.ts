/**
 * Crea un negocio y su usuario administrador desde consola.
 * Xtellaris no tiene registro self-service: las cuentas se crean aquí.
 *
 * Uso:
 *   npm run create-business -- --business "Mi Tienda" --email dueno@correo.com --password "Secreta123" --name "Nombre Dueño"
 *
 * Para agregar un usuario a un negocio existente, pasar --business con el
 * nombre exacto del negocio ya creado.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getArg(flag: string): string | undefined {
  const i = process.argv.indexOf(`--${flag}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const businessName = getArg("business");
  const email = getArg("email")?.toLowerCase();
  const password = getArg("password");
  const name = getArg("name") ?? "Administrador";

  if (!businessName || !email || !password) {
    console.error('Faltan argumentos. Uso:');
    console.error('  npm run create-business -- --business "Mi Tienda" --email dueno@correo.com --password "Secreta123" --name "Nombre Dueño"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.error(`Ya existe un usuario con el correo ${email}.`);
    process.exit(1);
  }

  let business = await prisma.business.findFirst({
    where: { name: businessName, isDemo: false },
  });
  if (business) {
    console.log(`Negocio existente encontrado: "${business.name}". Se agregará el usuario.`);
  } else {
    business = await prisma.business.create({ data: { name: businessName } });
    console.log(`✔ Negocio creado: "${business.name}" (id: ${business.id})`);
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      businessId: business.id,
    },
  });

  console.log(`✔ Usuario creado: ${user.email} (${user.name})`);
  console.log("Ya puede iniciar sesión en la app.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

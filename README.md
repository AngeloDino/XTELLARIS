# Xtellaris

Gestión de inventario y ventas para pequeños negocios colombianos (tiendas de
barrio, minimercados, ferreterías, droguerías). SaaS multi-tenant: un solo
deploy sirve a todos los clientes y cada usuario solo ve los datos de su
negocio. Un producto de **New Tech Industries**.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Vercel Postgres (Neon)** con **Prisma** como ORM
- **NextAuth (Auth.js)** — credenciales email/contraseña, sesiones JWT
- **Tailwind CSS**, mobile-first, instalable como **PWA**
- Validación con **Zod** en cliente y servidor

## Arquitectura

```
src/
├── app/                 # Rutas (App Router)
│   ├── (app)/           # Zona autenticada: dashboard, vender, productos…
│   ├── actions/         # Server Actions: validan con Zod y llaman servicios
│   ├── api/auth/        # NextAuth
│   └── login/
├── components/          # Componentes reutilizables (UI)
├── lib/                 # Compartido cliente/servidor: formatos, tipos, Zod
├── server/              # SOLO servidor
│   ├── db.ts            # Singleton de Prisma
│   ├── auth.ts          # Configuración NextAuth + requireSession()
│   └── services/        # Capa de datos: toda query filtra por businessId
prisma/
├── schema.prisma
└── seed.ts              # Crea/restaura el negocio demo
scripts/
├── create-business.ts   # Alta de negocios y usuarios (no hay registro público)
└── generate-icons.js    # Íconos PNG de la PWA
```

**Multi-tenant:** el `businessId` sale siempre de la sesión JWT en el servidor
(`requireSession()`); nunca se acepta uno enviado por el cliente. La capa de
servicios (`src/server/services`) es la única que toca la base de datos y cada
función exige el `businessId` como primer argumento.

**Dinero:** los precios se guardan como enteros en COP (sin decimales) y se
muestran con punto de miles: `$12.500`. El stock admite decimales para
unidades fraccionables (libra, kilo, litro).

**Modo demo:** el botón "Probar demo" del login entra a un negocio marcado
`isDemo` cuyos datos se restauran por completo en cada ingreso, así el demo
nunca afecta a clientes reales.

## Setup local

Requisitos: Node 18+ y una base Postgres (Neon gratis funciona perfecto).

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
copy .env.example .env        # (macOS/Linux: cp .env.example .env)
# Edite .env: DATABASE_URL y NEXTAUTH_SECRET (openssl rand -base64 32)

# 3. Crear las tablas y el negocio demo
npm run db:push
npm run db:seed

# 4. Arrancar
npm run dev
```

Abra http://localhost:3000 y toque **Probar demo**, o entre con el usuario
demo: `demo@xtellaris.co` / `demo1234`.

## Crear cuentas de clientes

No hay registro self-service: las cuentas las crea el administrador por consola.

```bash
npm run create-business -- --business "Tienda La Esquina" --email dueno@correo.com --password "Secreta123" --name "Don Pedro"
```

Si el negocio ya existe (mismo nombre), el comando agrega el usuario a ese
negocio en lugar de crear uno nuevo.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión Postgres (Neon/Vercel Postgres, con `sslmode=require`) |
| `NEXTAUTH_SECRET` | Secreto para firmar los JWT de sesión |
| `NEXTAUTH_URL` | URL pública en local (`http://localhost:3000`); en Vercel no hace falta |

## Deploy en Vercel

1. Suba el repositorio a GitHub e impórtelo en Vercel.
2. En el proyecto de Vercel: **Storage → Create Database → Postgres (Neon)**.
   Esto inyecta `DATABASE_URL` automáticamente.
3. Agregue `NEXTAUTH_SECRET` en **Settings → Environment Variables**.
4. Despliegue. El comando de build (`prisma generate && next build`) ya está
   configurado en `package.json`.
5. Una única vez, cree las tablas y el demo apuntando su `.env` local a la
   base de producción:
   ```bash
   npm run db:push && npm run db:seed
   ```
6. Cree los negocios de sus clientes con `npm run create-business` (también
   apuntando a la base de producción).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run db:push` | Sincroniza el esquema Prisma con la base |
| `npm run db:seed` | Crea/restaura el negocio demo |
| `npm run db:studio` | Prisma Studio (explorador de datos) |
| `npm run create-business` | Crea un negocio + usuario administrador |
| `npm run generate-icons` | Regenera los íconos PNG de la PWA |

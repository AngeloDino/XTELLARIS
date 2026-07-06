export { default } from "next-auth/middleware";

// Protege toda la app excepto login, endpoints de auth y archivos estáticos.
export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|icons|sw.js).*)",
  ],
};

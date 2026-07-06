import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    businessId: string;
    role: string;
    isDemo: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      businessId: string;
      role: string;
      isDemo: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    businessId: string;
    role: string;
    isDemo: boolean;
  }
}

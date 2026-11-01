export type ActionResult<T = undefined> = 
  | { ok: true; data?: T }
  | { ok: false; error: { code: string; message: string } };

export type ApiResponse<T = undefined> = 
  | { ok: true; data?: T }
  | { ok: false; error: { code: string; message: string } };

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  businessName: string;
};

// NextAuth module augmentation
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: SessionUser & DefaultSession["user"]
  }
}



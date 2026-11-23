// Tells TypeScript that `req.user` exists once authMiddleware has verified the login cookie,
// so controllers can write req.user without a cast like (req as any).user.

import type { User } from "./index";
import type { VisitorProfile } from "./visitors";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      /** Pengunjung aplikasi mobile yang sudah login (diisi requireVisitor / optionalVisitor). */
      visitor?: VisitorProfile;
    }
  }
}

export {};

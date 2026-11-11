// Tells TypeScript that `req.user` exists once authMiddleware has verified the login cookie,
// so controllers can write req.user without a cast like (req as any).user.

import type { User } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};

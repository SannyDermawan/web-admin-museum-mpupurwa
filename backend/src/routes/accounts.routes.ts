import { Router } from "express";
import {
  getAdminAccounts,
  getVisitorAccounts,
  patchAdminAccount,
  patchVisitorAccount,
  postAdminAccount,
  removeAdminAccount,
  removeVisitorAccount,
} from "../controllers/accounts.controller";

export const accountsRoutes = Router();

accountsRoutes.get("/visitors", getVisitorAccounts);
accountsRoutes.patch("/visitors/:id", patchVisitorAccount);
accountsRoutes.delete("/visitors/:id", removeVisitorAccount);

accountsRoutes.get("/admins", getAdminAccounts);
accountsRoutes.post("/admins", postAdminAccount);
accountsRoutes.patch("/admins/:id", patchAdminAccount);
accountsRoutes.delete("/admins/:id", removeAdminAccount);

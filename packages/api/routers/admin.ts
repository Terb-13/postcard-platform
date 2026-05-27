import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { isAdminRole } from "../lib/roles";
import { sendEmail, emailTemplates } from "../lib/email";

/**
 * Admin / Operations Router (ERP-like views)
 * Internal staff only. Uses Clerk roles for access control.
 */
export const adminRouter = router({

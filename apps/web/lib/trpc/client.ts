import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@postcard-platform/api"; // TODO: set up proper path alias later

export const trpc = createTRPCReact<AppRouter>();

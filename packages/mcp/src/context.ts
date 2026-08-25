import type { AppRouterCaller } from "./caller.ts";
import type { ResolvedApiKey } from "./auth.ts";

export type ToolRuntime = {
  auth: ResolvedApiKey;
  caller: AppRouterCaller;
};

export type RuntimeFactory = () => Promise<ToolRuntime>;

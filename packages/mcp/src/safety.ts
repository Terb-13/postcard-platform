import { fail } from "./result.ts";
import type { McpScope, ResolvedApiKey } from "./auth.ts";

export function hasScope(auth: ResolvedApiKey, scope: McpScope): boolean {
  return auth.scopes.includes(scope);
}

export function requireScope(auth: ResolvedApiKey, scope: McpScope) {
  if (hasScope(auth, scope)) return null;
  return fail(
    `API key "${auth.name}" is missing scope "${scope}". Granted: [${auth.scopes.join(", ")}]. Issue a key with that scope to continue.`,
    "SCOPE_DENIED"
  );
}

export function requireConfirm(confirm: boolean | undefined, action: string) {
  if (confirm === true) return null;
  return fail(
    `${action} is a live side-effect. Re-call with confirm=true after the user/agent reviews the estimate. Dry-run/read tools do not need confirm.`,
    "CONFIRM_REQUIRED"
  );
}

export function requireSpendRoom(auth: ResolvedApiKey, amountCents: number) {
  if (auth.spendCapCents <= 0) {
    return fail(
      `API key "${auth.name}" has spendCapCents=0. Paid actions are disabled. Issue a new key with a positive spend cap.`,
      "SPEND_CAP"
    );
  }
  if (amountCents > auth.remainingSpendCents) {
    return fail(
      `This action estimates ${amountCents} cents, but only ${auth.remainingSpendCents} cents remain on the key cap (${auth.spentCents}/${auth.spendCapCents} used).`,
      "SPEND_CAP"
    );
  }
  return null;
}

export function isDryRun(dryRun: boolean | undefined): boolean {
  return dryRun !== false;
}

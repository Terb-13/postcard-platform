import { TRPCError } from "@trpc/server";
import { CensusApiError, CensusConfigError } from "./census";

/** Map Census failures to tRPC errors with actionable messages */
export function mapCensusError(err: unknown): never {
  if (err instanceof CensusConfigError) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: err.message });
  }
  if (err instanceof CensusApiError) {
    throw new TRPCError({
      code: err.status === 429 ? "TOO_MANY_REQUESTS" : "BAD_GATEWAY",
      message: err.message,
      cause: err,
    });
  }
  if (err instanceof TRPCError) {
    throw err;
  }
  if (err instanceof Error) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: err.message,
      cause: err,
    });
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Unexpected error loading Census data",
  });
}

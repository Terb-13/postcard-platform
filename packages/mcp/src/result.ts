function jsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  return value;
}

export function toJson(value: unknown): string {
  return JSON.stringify(value, jsonReplacer, 2);
}

export function ok<T>(data: T, extra: Record<string, unknown> = {}) {
  const payload = { ok: true as const, ...extra, data };
  return {
    content: [{ type: "text" as const, text: toJson(payload) }],
    structuredContent: payload,
  };
}

export function fail(message: string, code = "TOOL_ERROR") {
  const payload = { ok: false as const, error: message, code };
  return {
    content: [{ type: "text" as const, text: toJson(payload) }],
    structuredContent: payload,
    isError: true as const,
  };
}

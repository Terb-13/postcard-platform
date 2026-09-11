import { describe, expect, it } from "vitest";
import { PRODUCT_CATALOG, resolveProduct } from "./catalog.ts";
import { TOOL_CATALOG } from "./tool-catalog.ts";
import { createPostcardMcpServer } from "./server.ts";

describe("agent-facing catalog", () => {
  it("resolves newmover to targeted-direct-mail / TARGETED", () => {
    const product = resolveProduct("newmover");
    expect(product?.slug).toBe("targeted-direct-mail");
    expect(product?.productType).toBe("TARGETED");
  });

  it("covers the four marketing products", () => {
    expect(PRODUCT_CATALOG.map((p) => p.slug).sort()).toEqual(
      ["discount-zones", "every-door-direct-mail", "saturation-mail", "targeted-direct-mail"].sort()
    );
  });
});

describe("registered tools", () => {
  it("registers every catalogued tool on the MCP server", () => {
    const server = createPostcardMcpServer(async () => {
      throw new Error("factory should not run during list");
    });
    const listed = server["_registeredTools"] as Record<string, { description?: string }> | undefined;
    const names = listed ? Object.keys(listed) : [];
    for (const tool of TOOL_CATALOG) {
      expect(names, `missing ${tool.name}`).toContain(tool.name);
    }
    expect(TOOL_CATALOG).toHaveLength(20);
  });
});

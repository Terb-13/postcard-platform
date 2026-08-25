import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const executeRaw = vi.fn();

vi.mock("@postcard-platform/db/client", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRaw(...args),
    $executeRaw: (...args: unknown[]) => executeRaw(...args),
  },
}));

import { releaseSpend, reserveSpend, SpendCapError } from "./auth.ts";

describe("reserveSpend", () => {
  beforeEach(() => {
    queryRaw.mockReset();
    executeRaw.mockReset();
  });

  it("increments when the conditional UPDATE returns a row", async () => {
    queryRaw.mockResolvedValue([{ spentCents: 25000, spendCapCents: 100000 }]);
    const reserved = await reserveSpend("key_1", 25000);
    expect(queryRaw).toHaveBeenCalledOnce();
    expect(reserved).toEqual({
      reservedCents: 25000,
      spentCents: 25000,
      remainingSpendCents: 75000,
    });
  });

  it("throws SpendCapError when a second reserve would exceed the cap", async () => {
    queryRaw.mockResolvedValueOnce([{ spentCents: 80000, spendCapCents: 100000 }]);
    queryRaw.mockResolvedValueOnce([]);

    await expect(reserveSpend("key_1", 80000)).resolves.toMatchObject({ reservedCents: 80000 });
    await expect(reserveSpend("key_1", 30000)).rejects.toBeInstanceOf(SpendCapError);
    expect(queryRaw).toHaveBeenCalledTimes(2);
  });

  it("does not increment for a zero amount", async () => {
    await expect(reserveSpend("key_1", 0)).resolves.toEqual({
      reservedCents: 0,
      spentCents: 0,
      remainingSpendCents: 0,
    });
    expect(queryRaw).not.toHaveBeenCalled();
  });
});

describe("releaseSpend", () => {
  beforeEach(() => {
    executeRaw.mockReset();
  });

  it("decrements spentCents after a failed checkout", async () => {
    executeRaw.mockResolvedValue(1);
    await releaseSpend("key_1", 25000);
    expect(executeRaw).toHaveBeenCalledOnce();
  });

  it("no-ops for a zero amount", async () => {
    await releaseSpend("key_1", 0);
    expect(executeRaw).not.toHaveBeenCalled();
  });
});

import { inr } from "@/lib/money";

describe("inr", () => {
  it("formats whole rupees", () => {
    expect(inr(10000)).toBe("₹100.00");
  });

  it("formats paise fractions", () => {
    expect(inr(12345)).toBe("₹123.45");
  });

  it("formats zero", () => {
    expect(inr(0)).toBe("₹0.00");
  });

  it("uses Indian digit grouping for large amounts", () => {
    expect(inr(15000000)).toBe("₹1,50,000.00");
  });
});

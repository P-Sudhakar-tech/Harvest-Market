import { validateBody, orderSchema, pincodeSchema, farmerVerifySchema, generateCsrfToken, verifyCsrfToken } from "@/lib/validation";

describe("validateBody", () => {
  it("returns data for valid input", () => {
    const result = validateBody(pincodeSchema, { pincode: "110001", deliveryFeePaise: 0, active: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.pincode).toBe("110001");
    }
  });

  it("returns error for invalid input", () => {
    const result = validateBody(pincodeSchema, { pincode: "abc", deliveryFeePaise: 0, active: true });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("pincode");
    }
  });
});

describe("orderSchema", () => {
  it("validates a complete order", () => {
    const result = validateBody(orderSchema, {
      customerName: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      address: "123 Main Street",
      deliveryPinCode: "110001",
      items: [{ productId: "prod_1", quantity: 2 }],
    });
    expect("error" in result).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = validateBody(orderSchema, { customerName: "John" });
    expect("error" in result).toBe(true);
  });

  it("rejects invalid PIN code format", () => {
    const result = validateBody(orderSchema, {
      customerName: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      address: "123 Main Street",
      deliveryPinCode: "abc",
      items: [{ productId: "prod_1", quantity: 1 }],
    });
    expect("error" in result).toBe(true);
  });
});

describe("farmerVerifySchema", () => {
  it("validates verified true", () => {
    const result = validateBody(farmerVerifySchema, { verified: true });
    expect("error" in result).toBe(false);
  });

  it("validates verified false", () => {
    const result = validateBody(farmerVerifySchema, { verified: false });
    expect("error" in result).toBe(false);
  });
});

describe("CSRF token", () => {
  it("generates a non-empty token", () => {
    const token = generateCsrfToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(0);
  });

  it("verifies matching tokens", () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token, token)).toBe(true);
  });

  it("rejects non-matching tokens", () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(verifyCsrfToken(token1, token2)).toBe(false);
  });

  it("rejects empty tokens", () => {
    expect(verifyCsrfToken("", "something")).toBe(false);
    expect(verifyCsrfToken("something", "")).toBe(false);
  });
});

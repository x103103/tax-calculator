const { calculateTax } = require('../calculators/tax-calculator');

describe('calculateTax', () => {
  it('applies formula: (profits - buyFees - sellFees) * 19%', () => {
    const result = calculateTax(1000, 50, 30);

    expect(result.taxableBase).toBe(920); // 1000 - 50 - 30
    expect(result.taxOwed).toBeCloseTo(174.80); // 920 * 0.19
  });

  it('uses default 19% tax rate', () => {
    const result = calculateTax(1000, 0, 0);

    expect(result.taxOwed).toBe(190);
  });

  it('allows custom tax rate', () => {
    const result = calculateTax(1000, 0, 0, 0.25);

    expect(result.taxOwed).toBe(250);
  });

  it('handles zero profits', () => {
    const result = calculateTax(0, 10, 5);

    expect(result.taxableBase).toBe(-15);
    expect(result.taxOwed).toBeCloseTo(-2.85); // Negative = refund/loss
  });

  it('handles zero fees', () => {
    const result = calculateTax(500, 0, 0);

    expect(result.taxableBase).toBe(500);
    expect(result.taxOwed).toBe(95);
  });

  it('handles negative taxable base (loss)', () => {
    const result = calculateTax(100, 80, 50); // Loss scenario

    expect(result.taxableBase).toBe(-30);
    expect(result.taxOwed).toBeCloseTo(-5.70);
  });

  it('handles all zero values', () => {
    const result = calculateTax(0, 0, 0);

    expect(result.taxableBase).toBe(0);
    expect(result.taxOwed).toBe(0);
  });

  it('handles large numbers', () => {
    const result = calculateTax(1000000, 5000, 3000);

    expect(result.taxableBase).toBe(992000);
    expect(result.taxOwed).toBeCloseTo(188480);
  });

  it('handles decimal values', () => {
    const result = calculateTax(1234.56, 12.34, 5.67);

    expect(result.taxableBase).toBeCloseTo(1216.55);
    expect(result.taxOwed).toBeCloseTo(231.1445);
  });
});

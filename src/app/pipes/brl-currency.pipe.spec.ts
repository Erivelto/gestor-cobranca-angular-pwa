import { BrlCurrencyPipe, formatBrl, parseBrl } from './brl-currency.pipe';

describe('BrlCurrencyPipe', () => {
  let pipe: BrlCurrencyPipe;

  beforeEach(() => {
    pipe = new BrlCurrencyPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format positive number', () => {
    const result = pipe.transform(1500.50);
    expect(result).toContain('1.500,50');
    expect(result).toContain('R$');
  });

  it('should format zero as R$ 0,00', () => {
    const result = pipe.transform(0);
    expect(result).toContain('0,00');
    expect(result).toContain('R$');
  });

  it('should return — for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should return — for undefined', () => {
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should return — for NaN string', () => {
    expect(pipe.transform('abc')).toBe('—');
  });

  it('should format negative number', () => {
    const result = pipe.transform(-250.99);
    expect(result).toContain('250,99');
  });

  it('should format string number', () => {
    const result = pipe.transform('1234.56');
    expect(result).toContain('1.234,56');
  });

  it('should format large number with thousand separators', () => {
    const result = pipe.transform(1000000);
    expect(result).toContain('1.000.000,00');
  });
});

describe('formatBrl', () => {
  it('should format number to BRL string', () => {
    const result = formatBrl(1500);
    expect(result).toContain('1.500,00');
    expect(result).toContain('R$');
  });

  it('should return — for null', () => {
    expect(formatBrl(null)).toBe('—');
  });

  it('should return — for undefined', () => {
    expect(formatBrl(undefined)).toBe('—');
  });

  it('should return — for NaN', () => {
    expect(formatBrl(NaN)).toBe('—');
  });
});

describe('parseBrl', () => {
  it('should parse "1.234,56" to 1234.56', () => {
    expect(parseBrl('1.234,56')).toBe(1234.56);
  });

  it('should parse "R$ 1.234,56" to 1234.56', () => {
    expect(parseBrl('R$ 1.234,56')).toBe(1234.56);
  });

  it('should parse number as-is', () => {
    expect(parseBrl(99.99)).toBe(99.99);
  });

  it('should return 0 for null', () => {
    expect(parseBrl(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(parseBrl(undefined)).toBe(0);
  });

  it('should return 0 for invalid string', () => {
    expect(parseBrl('abc')).toBe(0);
  });

  it('should parse "0,00" to 0', () => {
    expect(parseBrl('0,00')).toBe(0);
  });
});

import { TitleCasePtPipe } from './title-case.pipe';

describe('TitleCasePtPipe', () => {
  let pipe: TitleCasePtPipe;

  beforeEach(() => {
    pipe = new TitleCasePtPipe();
  });

  it('capitaliza primeira letra de cada palavra', () => {
    expect(pipe.transform('joao da silva')).toBe('Joao Da Silva');
  });

  it('converte ALL CAPS para title case', () => {
    expect(pipe.transform('JOÃO DA SILVA')).toBe('João Da Silva');
  });

  it('mistura maiúsculas e minúsculas', () => {
    expect(pipe.transform('gESTOR cOBRANÇA')).toBe('Gestor Cobrança');
  });

  it('retorna string vazia para null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('retorna string vazia para undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('retorna string vazia para string vazia', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('lida com acentos corretamente', () => {
    expect(pipe.transform('ângela de fátima')).toBe('Ângela De Fátima');
  });

  it('preserva palavra única', () => {
    expect(pipe.transform('CARLOS')).toBe('Carlos');
  });
});

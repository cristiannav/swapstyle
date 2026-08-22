import { configuration, parseOrigins } from './configuration';

describe('parseOrigins', () => {
  it('parsea un único origen', () => {
    expect(parseOrigins('https://a.com')).toEqual(['https://a.com']);
  });

  it('parsea una lista y limpia espacios', () => {
    expect(parseOrigins('https://a.com, https://b.vercel.app')).toEqual([
      'https://a.com',
      'https://b.vercel.app',
    ]);
  });

  it('saca la barra final para que los links no queden con doble barra', () => {
    expect(parseOrigins('https://a.com/')).toEqual(['https://a.com']);
  });

  it('cae al default de desarrollo si viene vacío', () => {
    expect(parseOrigins(undefined)).toEqual(['http://localhost:3000']);
    expect(parseOrigins('  ,  ')).toEqual(['http://localhost:3000']);
  });
});

describe('app.frontendUrl', () => {
  const original = process.env.FRONTEND_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = original;
  });

  /**
   * MailService interpola app.frontendUrl en los links de verificación y reset.
   * Si acá se colara la lista entera, el link quedaría
   * "https://a.com,https://b.com/reset-password?token=..." — una URL rota que
   * se lleva puesto un token de toma de cuenta.
   */
  it('es un único origen aunque FRONTEND_URL traiga una lista', () => {
    process.env.FRONTEND_URL = 'https://swapstyle.app,https://preview.vercel.app';
    const { app } = configuration();

    expect(app.frontendUrl).toBe('https://swapstyle.app');
    expect(app.frontendUrl).not.toContain(',');
    expect(() => new URL(`${app.frontendUrl}/reset-password?token=abc`)).not.toThrow();
    expect(new URL(`${app.frontendUrl}/reset-password?token=abc`).host).toBe('swapstyle.app');
  });

  it('corsOrigins sí conserva la lista completa', () => {
    process.env.FRONTEND_URL = 'https://swapstyle.app,https://preview.vercel.app';
    expect(configuration().app.corsOrigins).toEqual([
      'https://swapstyle.app',
      'https://preview.vercel.app',
    ]);
  });
});

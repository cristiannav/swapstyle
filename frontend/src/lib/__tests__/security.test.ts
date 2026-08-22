import { passwordSchema, safeImageUrl, usernameSchema } from '../security';

describe('passwordSchema', () => {
  it('acepta una password con minúscula, mayúscula y dígito', () => {
    expect(passwordSchema.safeParse('Abcd1234').success).toBe(true);
  });

  it.each(['abcd1234', 'ABCD1234', 'Abcdefgh', 'Ab1'])('rechaza %s', (pwd) => {
    expect(passwordSchema.safeParse(pwd).success).toBe(false);
  });
});

describe('usernameSchema', () => {
  it('acepta el formato que valida el backend', () => {
    expect(usernameSchema.safeParse('cris_nav_01').success).toBe(true);
  });

  // Estos pasaban en el form y después rebotaban con 400 desde la API.
  it.each(['CrisNav', 'cris.nav', 'cris nav', 'ab'])('rechaza %s', (name) => {
    expect(usernameSchema.safeParse(name).success).toBe(false);
  });
});

describe('safeImageUrl', () => {
  it('deja pasar http y https', () => {
    expect(safeImageUrl('https://cdn.test/a.jpg')).toBe('https://cdn.test/a.jpg');
    expect(safeImageUrl('http://cdn.test/a.jpg')).toBe('http://cdn.test/a.jpg');
  });

  it('resuelve rutas relativas contra el origen', () => {
    expect(safeImageUrl('/a.jpg')).toBe(`${window.location.origin}/a.jpg`);
  });

  it.each(['javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>', 'file:///etc/passwd'])(
    'bloquea %s',
    (url) => {
      expect(safeImageUrl(url)).toBeNull();
    },
  );

  it('trata vacío y undefined como sin imagen', () => {
    expect(safeImageUrl('')).toBeNull();
    expect(safeImageUrl(null)).toBeNull();
    expect(safeImageUrl(undefined)).toBeNull();
  });
});

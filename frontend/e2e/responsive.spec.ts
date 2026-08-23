import { expect, test } from '@playwright/test';

/**
 * Ninguna pantalla puede scrollear de costado. El caso que lo rompía era el
 * mazo de cartas decorativo del home: al rotarlas, la caja que ocupan es ~17%
 * más ancha que la carta, y en 1024 (donde la columna es angosta) se iba de la
 * pantalla. El desborde hacia la derecha es el que genera scroll, así que hay
 * que mirar los dos extremos y no sólo el teléfono.
 *
 * Sólo rutas públicas: las privadas necesitan sesión y backend arriba.
 */
const RUTAS = ['/', '/login', '/register', '/forgot-password'];

const PANTALLAS = [
  // El teléfono más angosto que sigue siendo realista (iPhone SE 1).
  { nombre: '320x568', width: 320, height: 568 },
  // Notebook chica: acá la grilla de 12 columnas ya está apretada.
  { nombre: '1024x768', width: 1024, height: 768 },
];

for (const pantalla of PANTALLAS) {
  test.describe(pantalla.nombre, () => {
    test.use({ viewport: { width: pantalla.width, height: pantalla.height } });

    for (const ruta of RUTAS) {
      test(`sin desborde horizontal en ${ruta}`, async ({ page }) => {
        await page.goto(ruta);
        const [ancho, viewport] = await page.evaluate(() => [
          document.documentElement.scrollWidth,
          window.innerWidth,
        ]);
        expect(ancho, `${ruta} scrollea de costado`).toBeLessThanOrEqual(viewport + 1);
      });
    }
  });
}

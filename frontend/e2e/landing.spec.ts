import { expect, test } from '@playwright/test';

test('home muestra el hero y los botones de auth', async ({ page }) => {
  await page.goto('/');
  // La marca es un link al home, no un heading. El h1 de la página es la
  // headline del hero — un solo h1 por página.
  await expect(page.getByRole('link', { name: 'SwapStyle' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: /Swipeá la prenda/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Crear cuenta' })).toBeVisible();
  // En mobile el "Iniciar sesión" del header se oculta (sm:inline-flex) y el
  // acceso queda en el "Ya tengo cuenta" del hero.
  await expect(
    page.getByRole('link', { name: /^(Iniciar sesión|Ya tengo cuenta)$/ }).first(),
  ).toBeVisible();
});

test('flujo de registro pide los campos requeridos', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByText('Mínimo 2 caracteres').first()).toBeVisible();
});

// Necesita la base con el seed (backend/scripts/seed.js).
// /api/auth/login acepta 5 intentos por minuto por IP y cada corrida usa dos.
test('login con un usuario del seed entra al feed y mantiene la sesión', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('sofia_garcia@swapstyle.test');
  await page.getByLabel('Contraseña').fill(process.env.SEED_PASSWORD ?? 'Abcd1234');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  const feed = page.getByRole('heading', { level: 1, name: /Encontrá tu próxima/ });
  await expect(feed).toBeVisible();

  // La URL ya dice /feed antes de que la app chequee la sesión, así que se
  // espera al contenido: si la sesión no se restaurara, terminaría en /login.
  await page.reload();
  await expect(feed).toBeVisible();
  await expect(page).toHaveURL(/\/feed$/);
});

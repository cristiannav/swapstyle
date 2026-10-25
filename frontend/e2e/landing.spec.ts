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

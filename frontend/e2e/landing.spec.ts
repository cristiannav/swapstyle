import { expect, test } from '@playwright/test';

test('home muestra el hero y los botones de auth', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'SwapStyle' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Crear cuenta' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Iniciar sesión' })).toBeVisible();
});

test('flujo de registro pide los campos requeridos', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByText('Mínimo 2 caracteres').first()).toBeVisible();
});

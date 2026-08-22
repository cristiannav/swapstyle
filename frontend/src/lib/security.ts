import { z } from 'zod';

/**
 * Reglas de validación que también existen en el backend. Duplicarlas acá es a
 * propósito: el server valida por seguridad, el cliente sólo para dar feedback
 * antes del submit. Si cambia una, tiene que cambiar la otra
 * (backend: modules/security/validators/is-strong-password.ts).
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres`)
  .max(PASSWORD_MAX, `Máximo ${PASSWORD_MAX} caracteres`)
  .regex(/[a-z]/, 'Incluí una minúscula')
  .regex(/[A-Z]/, 'Incluí una mayúscula')
  .regex(/[0-9]/, 'Incluí un número');

/** El backend sólo acepta [a-z0-9_]; el form aceptaba mayúsculas y puntos y
 *  después rebotaba con un 400 poco claro. */
export const usernameSchema = z
  .string()
  .min(3, 'Mínimo 3 caracteres')
  .max(40, 'Máximo 40 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guion bajo');

const SAFE_PROTOCOLS = ['http:', 'https:'];

/**
 * Las URLs de imagen las carga el usuario, así que llegan a `<img src>` sin
 * pasar por nosotros. Un `javascript:` no ejecuta en `src`, pero `data:` sí
 * puede servir SVG con script en otros contextos, y una URL relativa mal
 * formada rompe el layout. Allowlist de protocolos y listo.
 */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.origin);
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

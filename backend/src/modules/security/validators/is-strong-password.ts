import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';

/** Mínimo aceptable: 8-72 chars, con minúscula, mayúscula y dígito.
 *  El tope de 72 es el límite de bytes que consumen bcrypt/argon2 por password. */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

const RULES: Array<[RegExp, string]> = [
  [/[a-z]/, 'una minúscula'],
  [/[A-Z]/, 'una mayúscula'],
  [/[0-9]/, 'un número'],
];

export function checkPasswordStrength(value: unknown): string[] {
  if (typeof value !== 'string') return ['no es un texto válido'];

  const missing: string[] = [];
  if (value.length < PASSWORD_MIN) missing.push(`al menos ${PASSWORD_MIN} caracteres`);
  if (Buffer.byteLength(value, 'utf8') > PASSWORD_MAX) {
    missing.push(`como máximo ${PASSWORD_MAX} caracteres`);
  }
  for (const [re, label] of RULES) {
    if (!re.test(value)) missing.push(label);
  }
  return missing;
}

/**
 * La validación de fuerza vivía sólo en el zod del frontend, así que un POST
 * directo a la API aceptaba "aaaaaaaa". Esto la mueve al borde de confianza.
 */
export function IsStrongPassword(options?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => checkPasswordStrength(value).length === 0,
        defaultMessage: (args: ValidationArguments) =>
          `La contraseña necesita ${checkPasswordStrength(args.value).join(', ')}`,
      },
    });
  };
}

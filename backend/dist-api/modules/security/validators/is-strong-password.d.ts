import { type ValidationOptions } from 'class-validator';
export declare const PASSWORD_MIN = 8;
export declare const PASSWORD_MAX = 72;
export declare function checkPasswordStrength(value: unknown): string[];
export declare function IsStrongPassword(options?: ValidationOptions): (object: object, propertyName: string) => void;

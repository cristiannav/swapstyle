"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_MAX = exports.PASSWORD_MIN = void 0;
exports.checkPasswordStrength = checkPasswordStrength;
exports.IsStrongPassword = IsStrongPassword;
const class_validator_1 = require("class-validator");
exports.PASSWORD_MIN = 8;
exports.PASSWORD_MAX = 72;
const RULES = [
    [/[a-z]/, 'una minúscula'],
    [/[A-Z]/, 'una mayúscula'],
    [/[0-9]/, 'un número'],
];
function checkPasswordStrength(value) {
    if (typeof value !== 'string')
        return ['no es un texto válido'];
    const missing = [];
    if (value.length < exports.PASSWORD_MIN)
        missing.push(`al menos ${exports.PASSWORD_MIN} caracteres`);
    if (Buffer.byteLength(value, 'utf8') > exports.PASSWORD_MAX) {
        missing.push(`como máximo ${exports.PASSWORD_MAX} caracteres`);
    }
    for (const [re, label] of RULES) {
        if (!re.test(value))
            missing.push(label);
    }
    return missing;
}
function IsStrongPassword(options) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName,
            options,
            validator: {
                validate: (value) => checkPasswordStrength(value).length === 0,
                defaultMessage: (args) => `La contraseña necesita ${checkPasswordStrength(args.value).join(', ')}`,
            },
        });
    };
}
//# sourceMappingURL=is-strong-password.js.map
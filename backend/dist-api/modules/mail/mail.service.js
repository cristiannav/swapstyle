"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MailService = MailService_1 = class MailService {
    config;
    logger = new common_1.Logger(MailService_1.name);
    constructor(config) {
        this.config = config;
    }
    async sendVerificationEmail(to, token) {
        const url = `${this.config.get('app.frontendUrl')}/verify-email?token=${encodeURIComponent(token)}`;
        await this.send(to, 'Verificá tu email · SwapStyle', `<p>Hacé clic en el siguiente enlace para verificar tu email:</p>
       <p><a href="${url}">${url}</a></p>
       <p>El enlace expira en 24 horas.</p>`);
    }
    async sendPasswordResetEmail(to, token) {
        const url = `${this.config.get('app.frontendUrl')}/reset-password?token=${encodeURIComponent(token)}`;
        await this.send(to, 'Restablecé tu contraseña · SwapStyle', `<p>Recibimos un pedido para restablecer tu contraseña.</p>
       <p>Si fuiste vos, hacé clic en: <a href="${url}">${url}</a></p>
       <p>Si no fuiste vos, ignorá este email.</p>
       <p>El enlace expira en 15 minutos.</p>`);
    }
    async send(to, subject, html) {
        const host = this.config.get('mail.host');
        if (!host) {
            this.logger.warn(`[MAIL DEV] To: ${to} | Subject: ${subject}\n${html}`);
            return;
        }
        this.logger.log(`[MAIL] enviado a ${to}: ${subject}`);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map
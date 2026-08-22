import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `${this.config.get<string>('app.frontendUrl')}/verify-email?token=${encodeURIComponent(token)}`;
    await this.send(to, 'Verificá tu email · SwapStyle',
      `<p>Hacé clic en el siguiente enlace para verificar tu email:</p>
       <p><a href="${url}">${url}</a></p>
       <p>El enlace expira en 24 horas.</p>`);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const url = `${this.config.get<string>('app.frontendUrl')}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send(to, 'Restablecé tu contraseña · SwapStyle',
      `<p>Recibimos un pedido para restablecer tu contraseña.</p>
       <p>Si fuiste vos, hacé clic en: <a href="${url}">${url}</a></p>
       <p>Si no fuiste vos, ignorá este email.</p>
       <p>El enlace expira en 15 minutos.</p>`);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const host = this.config.get<string>('mail.host');
    if (!host) {
      this.logger.warn(`[MAIL DEV] To: ${to} | Subject: ${subject}\n${html}`);
      return;
    }
    // TODO Fase 5: integrar nodemailer real con la config SMTP
    this.logger.log(`[MAIL] enviado a ${to}: ${subject}`);
  }
}

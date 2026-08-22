import { Global, Module } from '@nestjs/common';
import { LoginThrottleService } from './login-throttle.service';
import { WsThrottleGuard } from './guards/ws-throttle.guard';

/** Piezas transversales de seguridad. Global para no re-importarlo en cada módulo. */
@Global()
@Module({
  providers: [LoginThrottleService, WsThrottleGuard],
  exports: [LoginThrottleService, WsThrottleGuard],
})
export class SecurityModule {}

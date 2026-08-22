import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  // Sin @Public() el JwtAuthGuard global devolvía 401 y cualquier liveness
  // probe (Docker, balanceador, monitoreo) leía el servicio como caído.
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

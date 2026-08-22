import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class WsThrottleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}

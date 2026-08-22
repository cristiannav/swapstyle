"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsThrottleGuard = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const WINDOW_MS = 10_000;
const MAX_EVENTS = 30;
let WsThrottleGuard = class WsThrottleGuard {
    canActivate(context) {
        const client = context.switchToWs().getClient();
        const now = Date.now();
        const state = (client.data.__rate ??= { hits: [] });
        state.hits = state.hits.filter((t) => now - t < WINDOW_MS);
        if (state.hits.length >= MAX_EVENTS) {
            throw new websockets_1.WsException('Demasiados mensajes. Bajá un cambio.');
        }
        state.hits.push(now);
        return true;
    }
};
exports.WsThrottleGuard = WsThrottleGuard;
exports.WsThrottleGuard = WsThrottleGuard = __decorate([
    (0, common_1.Injectable)()
], WsThrottleGuard);
//# sourceMappingURL=ws-throttle.guard.js.map
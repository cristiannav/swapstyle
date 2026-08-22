"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const bootstrap_1 = require("./bootstrap");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    (0, bootstrap_1.configureApp)(app);
    const port = app.get(config_1.ConfigService).get('app.port') ?? 3001;
    await app.listen(port);
    console.log(`[SwapStyle] Backend listening on http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map
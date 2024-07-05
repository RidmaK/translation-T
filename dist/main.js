"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const node_1 = require("@logtail/node");
const winston_1 = require("@logtail/winston");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
const logtail = new node_1.Logtail('ZYT7MfpWZNHEx7GGw2wrHGTU');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            transports: [
                new winston_1.LogtailTransport(logtail),
                new winston.transports.Console({
                    format: winston.format.simple(),
                }),
            ],
        }),
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT');
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map
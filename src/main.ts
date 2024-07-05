import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logtail = new Logtail('ZYT7MfpWZNHEx7GGw2wrHGTU');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new LogtailTransport(logtail),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    }),
  });
  const configService = app.get(ConfigService);
    const port = configService.get('PORT');
  await app.listen(port);
}
bootstrap();

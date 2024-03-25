import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import startMetricsExporter from './metric';

async function bootstrap() {
  await startMetricsExporter();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}


bootstrap();


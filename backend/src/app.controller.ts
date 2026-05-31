import { Controller, Get, NotFoundException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Throw a test error — only when SENTRY_DSN is set (verify in Sentry dashboard). */
  @Get('debug/sentry')
  sentryTest(): never {
    if (!process.env.SENTRY_DSN) {
      throw new NotFoundException();
    }
    throw new Error('Sentry test error (backend)');
  }
}

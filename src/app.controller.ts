import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { Sequelize } from 'sequelize-typescript';
import { signer } from './config/signer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db/health')
  async dbHealth() {
    try {
      await this.sequelize.authenticate();
      await this.sequelize.query('SELECT 1');
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'unknown' };
    }
  }

  @Get('signer')
  async signerAddress() {
    const address = await signer.getAddress();
    return { address };
  }
}

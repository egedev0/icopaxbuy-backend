import { Body, Controller, Get, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('countdown')
  async getCountdown() {
    let value = await this.settingsService.getValue('countdownEnd');
    if (!value) {
      const iso = new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString();
      await this.settingsService.setValue('countdownEnd', iso);
      value = iso;
    }
    return { countdownEnd: value };
  }

  @Post('countdown')
  async setCountdown(@Body() body: { countdownEnd: string }) {
    await this.settingsService.setValue('countdownEnd', body.countdownEnd);
    return { ok: true };
  }
}


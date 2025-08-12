import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { settingsProviders } from './settings.providers';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, ...settingsProviders],
  exports: [SettingsService]
})
export class SettingsModule {}


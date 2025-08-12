import { Inject, Injectable } from '@nestjs/common';
import { Setting } from './settings.model';

@Injectable()
export class SettingsService {
  constructor(
    @Inject('SETTINGS_REPOSITORY')
    private settings: typeof Setting
  ) {}

  async getValue(key: string): Promise<string | null> {
    const row = await this.settings.findByPk(key);
    return row?.value ?? null;
  }

  async setValue(key: string, value: string): Promise<void> {
    await this.settings.upsert({ key, value });
  }
}


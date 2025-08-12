import { Setting } from './settings.model';

export const settingsProviders = [
  {
    provide: 'SETTINGS_REPOSITORY',
    useValue: Setting
  }
];


import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initRum } from './app/core/rum';

initRum()
  .finally(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));

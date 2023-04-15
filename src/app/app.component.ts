import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private swUpdate: SwUpdate, private platform: Platform) {
    this.checkForUpdates();
    platform.ready().then(async () => {});
  }

  async checkForUpdates(): Promise<void> {
    if (await this.swUpdate.checkForUpdate()) {
      if (confirm('A new version is available. Update app?')) {
        try {
          await this.swUpdate.activateUpdate();
          confirm('App updated!');
          window.location.reload();
        } catch {
          console.log('FAILED to ACTIVATE new version!');
        }
      }
    }
  }
}

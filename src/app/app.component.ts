import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Platform } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { timer } from 'rxjs';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private splashScreen: SplashScreen, private swUpdate: SwUpdate, private platform: Platform) {
    this.hideSplashScreen();
    this.checkForUpdates();
    platform.ready().then(async () => {
    });
  }

  private hideSplashScreen() {
    timer(3000).subscribe(() => {
      this.splashScreen.hide();
    });

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

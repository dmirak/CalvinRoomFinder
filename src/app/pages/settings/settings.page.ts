import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public darkMode: boolean;
  public rotateMap: boolean;
  public accessibilityMode: boolean;

  private isInitialized = false;

  constructor(private storageService: StorageService) { }

  async ngOnInit() {
    await this.storageService.init();

    this.darkMode = await this.storageService.get('darkMode');
    this.rotateMap = await this.storageService.get('rotateMap');
    this.accessibilityMode = await this.storageService.get('accessibilityMode');

    // ionChange events seem to be running before ngOnInit can finish which
    // causes undefined to be stored for some inputs
    this.isInitialized = true;
  }

  saveSettings() {
    if (this.isInitialized) {
      this.storageService.set('darkMode', this.darkMode);
      this.storageService.set('rotateMap', this.rotateMap);
      this.storageService.set('accessibilityMode', this.accessibilityMode);
    }
  }

  darkModeChanged() {
    this.saveSettings();
  }

  rotateMapChanged() {
    this.saveSettings();
  }

  accessibilityModeChanged() {
    this.saveSettings();
  }


}

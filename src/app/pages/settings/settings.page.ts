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
  public metricMode: boolean;
  public userIconMode: string;

  private isInitialized = false;

  constructor(private storageService: StorageService) {}

  async ngOnInit() {
    await this.storageService.init();

    this.darkMode = await this.storageService.get('darkMode');
    this.rotateMap = await this.storageService.get('rotateMap');
    this.accessibilityMode = await this.storageService.get('accessibilityMode');
    this.metricMode = await this.storageService.get('metricMode');
    this.userIconMode = await this.storageService.get('userIconMode');

    // ionChange events seem to be running before ngOnInit can finish which
    // causes undefined to be stored for some inputs
    this.isInitialized = true;
  }

  saveSettings() {
    if (this.isInitialized) {
      this.storageService.set('darkMode', this.darkMode);
      this.storageService.set('rotateMap', this.rotateMap);
      this.storageService.set('accessibilityMode', this.accessibilityMode);
      this.storageService.set('metricMode', this.metricMode);
      this.storageService.set('userIconMode', this.userIconMode);
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

  metricModeChanged() {
    this.saveSettings();
  }

  userIconChanged(event) {
    this.userIconMode = event.detail.value;
    this.saveSettings();
  }
}

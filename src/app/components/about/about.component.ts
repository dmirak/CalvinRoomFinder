import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  darkMode: boolean;

  constructor(
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.storageService.get('darkMode').then((val) => {
      this.darkMode = val;
    });
  }

  close() {
    return this.modalCtrl.dismiss(null, 'dismiss');
  }
}

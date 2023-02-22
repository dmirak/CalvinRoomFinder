import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  constructor(private modalCtrl: ModalController) {}

  close() {
    return this.modalCtrl.dismiss(null, 'dismiss');
  }
}

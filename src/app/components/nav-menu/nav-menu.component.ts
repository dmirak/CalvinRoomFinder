import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-nav-menu-component',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
})
export class NavMenuComponent implements OnDestroy {

  @Input() distanceSubject: Subject<string>;
  distance: string;
  private subscription: Subscription;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.subscription = this.distanceSubject.subscribe((distance) => {
      this.distance = distance;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}

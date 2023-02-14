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
  @Input() durationSubject: Subject<string>;
  distance: string;
  duration: string;
  private distanceSubscription: Subscription;
  private durationSubscription: Subscription;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.distanceSubscription = this.distanceSubject.subscribe((distance) => {
      this.distance = distance;
    });
    this.durationSubscription = this.durationSubject.subscribe((duration) => {
      this.duration = duration;
    });
  }

  ngOnDestroy(): void {
    this.distanceSubscription.unsubscribe();
    this.durationSubscription.unsubscribe();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}

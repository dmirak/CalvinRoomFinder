import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-nav-menu-component',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss'],
})
export class NavMenuComponent implements OnDestroy {
  @Input() distanceSubject: Subject<string>;
  @Input() durationSubject: Subject<string>;
  @Input() destinationSubject: Subject<string>;
  @Input() floorSubject: Subject<string>;
  distance: string;
  duration: string;
  destination: string;
  floor: string;
  darkMode: boolean;
  private distanceSubscription: Subscription;
  private durationSubscription: Subscription;
  private destinationSubscription: Subscription;
  private floorSubscription: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.storageService.get('darkMode').then((val) => {
      this.darkMode = val;
    });
    this.distanceSubscription = this.distanceSubject.subscribe((distance) => {
      this.distance = distance;
    });
    this.durationSubscription = this.durationSubject.subscribe((duration) => {
      this.duration = duration;
    });
    this.destinationSubscription = this.destinationSubject.subscribe(
      (destination) => {
        this.destination = destination;
      }
    );
    this.floorSubscription = this.floorSubject.subscribe((floor) => {
      this.floor = floor;
    });
  }

  ngOnDestroy(): void {
    this.distanceSubscription.unsubscribe();
    this.durationSubscription.unsubscribe();
    this.destinationSubscription.unsubscribe();
    this.floorSubscription.unsubscribe();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}

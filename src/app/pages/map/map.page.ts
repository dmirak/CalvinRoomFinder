import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  map: any;

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  constructor() {}

  ionViewDidEnter() {
    this.showMap();
  }

  showMap() {
    const location = new google.maps.LatLng(42.93165, -85.58748);
    const options = {
      center: location,
      zoom: 17,
      disableDefaultUI: true,
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);
  }
}

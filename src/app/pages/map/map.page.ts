import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

declare const google: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;
  map: any;

  constructor() { }

  ionViewDidEnter() {
    this.showMap();

    const marker1 = new google.maps.Marker({
      position: {
        lat: 42.931033,
        lng: -85.588502,
      },
      map: this.map,
    });

    const marker2 = new google.maps.Marker({
      position: {
        lat: 42.931489,
        lng: -85.586713,
      },
      map: this.map,
    });
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

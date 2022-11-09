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
  isItemAvailable = false;
  items = [];
  roomid = [];

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

  initializeItems() {
    this.items = [
      { room: 'sb301', lat: 42.93119, lng: -85.58926 },
      { room: 'sb336', lat: 42, lng: -85 },
      { room: 'nh121', lat: 42.6, lng: -85.3 },
    ];
    this.roomid = this.items.map(({ room }) => room);
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();
    // set val to the value of the searchbar
    const val = ev.target.value;

    if (val && val.trim() !== '') {
      this.isItemAvailable = true;
      // eslint-disable-next-line arrow-body-style
      this.roomid = this.roomid.filter((item) => {
        return item.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    } else {
      this.isItemAvailable = false;
    }
  }

  createMarker() {
    const classroom = document.getElementById('location').textContent.trim();
    console.log(classroom);

    this.items.forEach((place) => {
      if (place.room == classroom) {
        const marker = new google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
        });
        marker.setMap(this.map);
        console.log('success');
      } else {
        console.log('failed');
      }
    });
  }
}

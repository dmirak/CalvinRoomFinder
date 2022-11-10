import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

declare var google: any;

export interface RoomInfo {
  name: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  map: any;
  isItemAvailable = false;
  markerCreated: boolean = false;

  public roomList: RoomInfo[] = [
    {
      name: 'sb301',
      lat: 42.93119,
      lng: -85.58926,
    },
    {
      name: 'sb201',
      lat: 42.93,
      lng: -85.58,
    },
    {
      name: 'hh334',
      lat: 42.91395,
      lng: -85.57342,
    },
  ];

  public selectedRoom: RoomInfo;

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

  getItems(ev: any) {
    // set val to the value of the searchbar
    const val = ev.target.value;

    if (val && val.trim() !== '') {
      this.isItemAvailable = true;
      // eslint-disable-next-line arrow-body-style
      // this.roomList.forEach((item) => {
      //   console.log(item.name.toUpperCase());
      //   return item.name.toUpperCase();
      // });
    } else {
      this.isItemAvailable = false;
    }
  }

  createMarker(room: RoomInfo): void {
    this.selectedRoom = room;
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    this.calcRoute(directionsService, directionsRenderer);

    directionsRenderer.setMap(this.map);

    console.log('Created marker for: ' + this.selectedRoom.name);
    this.isItemAvailable = false;
  }

  calcRoute(directionsService, directionsRenderer) {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        directionsService
          .route({
            origin: { lat: pos.lat, lng: pos.lng },

            destination: {
              lat: this.selectedRoom.lat,
              lng: this.selectedRoom.lng,
            },

            travelMode: google.maps.TravelMode.WALKING,
          })
          .then((response) => {
            directionsRenderer.setDirections(response);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    );
  }
}

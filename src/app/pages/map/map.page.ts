import { Component, ElementRef, ViewChild } from '@angular/core';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@awesome-cordova-plugins/device-orientation/ngx';

declare const google: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})



export class MapPage {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  map: any;
  userIcon = '../../../assets/user-icon.png';
  userMarker: any;
  userLocation = { lat: 0, lng: 0 };
  isItemAvailable = false;
  items = [];
  orientation: any;

  // constructor() { }
  constructor(private deviceOrientation: DeviceOrientation) { }

  ionViewDidEnter() {
    this.showMap();
  }

  async showMap() {
    await navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.userLocation = pos;
      }
    );
    const location = await new google.maps.LatLng(
      this.userLocation.lat,
      this.userLocation.lng
    );
    const options = {
      center: location,
      zoom: 18,
      disableDefaultUI: true,
    };
    this.map = await new google.maps.Map(this.mapRef.nativeElement, options);
    await this.setLocationCenter();

    navigator.geolocation.watchPosition((position) => {
      const previousCoords = this.userLocation;
      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const userDirection = this.getCurrentDirection(
        previousCoords,
        this.userLocation
      );
      if (!this.userMarker) {
        this.userMarker = new google.maps.Marker({
          icon: {
            fillColor: 'blue',
            fillOpacity: 1,
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            rotation: userDirection,
            scale: 7,
            strokeColor: 'white',
            strokeWeight: 2,
          },
          position: this.userLocation,
        });
      } else {
        this.userMarker.setMap(null);
        this.userMarker = new google.maps.Marker({
          icon: {
            fillColor: 'blue',
            fillOpacity: 1,
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            rotation: userDirection,
            scale: 7,
            strokeColor: 'white',
            strokeWeight: 2,
          },
          position: this.userLocation,
        });
      }

      this.userMarker.setMap(this.map);
    });
    //this.addUserMarker();

    // this.deviceOrientation.getCurrentHeading().then(
    //   (data: DeviceOrientationCompassHeading) => this.orientation = data,
    //   (error: any) => this.orientation = error
    // );

    // const subscription = this.deviceOrientation.watchHeading().subscribe(
    //   (data: DeviceOrientationCompassHeading) => this.orientation = data
    // );

    this.deviceOrientation.watchHeading().subscribe((res: DeviceOrientationCompassHeading) => {
      this.orientation = res;
    });
  }

  setLocationCenter() {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.map.setCenter(pos);
      }
    );
  }

  getCurrentDirection(previousCoords, currentCoords) {
    const diffLat = currentCoords.lat - previousCoords.lat;
    const diffLng = currentCoords.lng - previousCoords.lng;
    const anticlockwiseAngleFromEast = this.convertToDegrees(
      Math.atan2(diffLat, diffLng)
    );
    const clockwiseAngleFromNorth = 90 - anticlockwiseAngleFromEast;
    return clockwiseAngleFromNorth;
  }
  convertToDegrees(radian) {
    return (radian * 180) / Math.PI;
  }

  initializeItems() {
    this.items = ['SB104', 'SB302', 'HH108', 'NH101', 'Gamma 5'];
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() !== '') {
      this.isItemAvailable = true;
      // eslint-disable-next-line arrow-body-style
      this.items = this.items.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.isItemAvailable = false;
    }
  }


}


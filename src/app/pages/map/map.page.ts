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


  constructor() { }
  // constructor(private deviceOrientation: DeviceOrientation) { }

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
    //   (data: DeviceOrientationCompassHeading) => console.log(data),
    //   (error: any) => console.log(error)
    // );
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
}

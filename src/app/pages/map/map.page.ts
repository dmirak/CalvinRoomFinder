import { Component, ElementRef, ViewChild } from '@angular/core';
//import { DeviceOrientation, DeviceOrientationCompassHeading } from '@awesome-cordova-plugins/device-orientation/ngx';

declare const google: any;

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
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  map: any;
  userIcon = '../../../assets/user-icon.png';
  userMarker: any;
  userLocation = { lat: 0, lng: 0 };
  isItemAvailable = false;
  markerCreated = false;
  heading: number | undefined;
  userDirection = 0;
  errorMsg: string;

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

      // This will set userDirection based on change in coordinates
      // this.userDirection = this.getCurrentDirection(
      //   previousCoords,
      //   this.userLocation
      // );

      this.userDirection = this.heading ?? this.userDirection;

      if (!this.userMarker) {
        this.userMarker = new google.maps.Marker({
          icon: {
            fillColor: 'blue',
            fillOpacity: 1,
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            rotation: this.userDirection,
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
            rotation: this.userDirection,
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

    window.navigator.geolocation.watchPosition(position => {
      this.heading = position.coords.heading;
    },
      error => {
        this.errorMsg = error.message;
      },
      {
        enableHighAccuracy: true,
      }
    );
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
    directionsService
      .route({
        origin: { lat: this.userLocation.lat, lng: this.userLocation.lng },

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
}

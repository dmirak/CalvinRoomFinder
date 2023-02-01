import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
//import { DeviceOrientation, DeviceOrientationCompassHeading } from '@awesome-cordova-plugins/device-orientation/ngx';
import { ToastController } from '@ionic/angular';

declare const google: any;

interface LatLng {
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
  heading: any;
  userDirection = 0;
  errorMsg: string;
  selectedRoom: LatLng;
  tempServices: any;
  tempRenderer: any;
  pathAlreadyExist = false;
  routeIntervalID: any;
  distance: string;
  toast: any = null;

  public data: any = [];
  public roomList: any = [];

  constructor(private toastController: ToastController) {}

  ionViewDidEnter() {
    fetch('./assets/data/rooms.json')
      .then((res) => res.json())
      .then((json) => {
        this.data = json;
      });
    this.roomList = [...this.data];
    this.showMap();
  }

  async showMap() {
    window.navigator.geolocation.watchPosition(
      (position) => {
        this.heading = position.coords.heading;
      },
      (error) => {
        this.errorMsg = error.message;
      },
      {
        enableHighAccuracy: true,
      }
    );

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
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: location,
      zoom: 18,
      disableDefaultUI: true,
    };
    this.map = await new google.maps.Map(this.mapRef.nativeElement, options);
    this.setLocationCenter();

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

      //this.userDirection = this.heading ?? this.userDirection;

      if (!this.userMarker) {
        this.userMarker = new google.maps.Marker({
          icon: {
            fillColor: 'blue',
            fillOpacity: 1,
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            rotation: this.heading,
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
            rotation: this.heading,
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

  async presentToast() {
    if (this.toast === null) {
      this.toast = await this.toastController.create({
        message: this.distance,
        position: 'top',
        cssClass: 'custom-toast',
        buttons: [
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ],
      });
      await this.toast.present();

      await this.toast.onDidDismiss();
      console.log('dismissed');
      this.toast = null;
    }
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

  // getCurrentDirection(previousCoords, currentCoords) {
  //   const diffLat = currentCoords.lat - previousCoords.lat;
  //   const diffLng = currentCoords.lng - previousCoords.lng;
  //   const anticlockwiseAngleFromEast = this.convertToDegrees(
  //     Math.atan2(diffLat, diffLng)
  //   );
  //   const clockwiseAngleFromNorth = 90 - anticlockwiseAngleFromEast;
  //   return clockwiseAngleFromNorth;
  // }
  // convertToDegrees(radian) {
  //   return (radian * 180) / Math.PI;
  // }

  initializeRoomList() {}

  async getItems(ev: any) {
    //await this.initializeRoomList();
    // set val to the value of the searchbar
    const val = ev.target.value.toUpperCase();
    if (val && val.trim() !== '') {
      this.isItemAvailable = true;
      this.roomList = this.data.filter(
        (item) => item.roomNumber.indexOf(val) > -1
      );
    } else {
      this.isItemAvailable = false;
    }
  }

  createPath(room: any): void {
    this.selectedRoom = { lat: room.latitude, lng: room.longitude };
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
    });

    this.routeIntervalID = setInterval(() => {
      if (!this.pathAlreadyExist) {
        this.pathAlreadyExist = true;

        this.tempServices = directionsService;
        this.tempRenderer = directionsRenderer;

        this.calcRoute(this.tempServices, this.tempRenderer);
        this.calcDistance();
        this.tempRenderer.setMap(this.map);
        this.setLocationCenter();
        this.map.setHeading(this.heading);
      } else {
        this.tempRenderer.setMap(null);
        //clearInterval(this.routeIntervalID);

        this.tempServices = directionsService;
        this.tempRenderer = directionsRenderer;
        this.calcRoute(this.tempServices, this.tempRenderer);
        this.calcDistance();
        this.tempRenderer.setMap(this.map);
        this.setLocationCenter();
        this.map.setHeading(this.heading);
      }
    }, 1000);

    console.log('Created marker for: ' + room.roomNumber);
    (document.getElementById('search') as HTMLInputElement).value =
      room.roomNumber;
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

  async calcDistance() {
    const service = new google.maps.DistanceMatrixService();
    const user = new google.maps.Marker({
      lat: this.userLocation.lat,
      lng: this.userLocation.lng,
    });
    const destination = new google.maps.Marker({
      lat: this.selectedRoom.lat,
      lng: this.selectedRoom.lng,
    });

    const request = {
      origins: [user],
      destinations: [destination],
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC,
    };

    await service.getDistanceMatrix(request).then((response) => {
      this.distance = response['rows'][0]['elements'][0]['duration']['text'];
    });
    console.log(this.distance);
    this.presentToast();
  }
}

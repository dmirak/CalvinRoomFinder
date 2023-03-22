import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';

import { NavMenuComponent } from 'src/app/components/nav-menu/nav-menu.component';
import { AboutComponent } from 'src/app/components/about/about.component';

import { StorageService } from 'src/app/services/storage.service';

declare const google: any;

interface RoomInfo {
  number: string;
  lat: number;
  lng: number;
  floor: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss'],
})
export class MapPage {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  map: any;
  userIcon: string;
  userMarker: any;
  userLocation = { lat: 0, lng: 0 };
  isSearching: boolean = false;
  isShortNameAvailable: boolean = false;
  isFullNameAvailable: boolean = false;
  markerCreated: boolean = false;
  heading: any;
  userDirection = 0;
  errorMsg: string;
  selectedRoom: RoomInfo;
  tempServices: any;
  tempRenderer: any;
  isRouting = false;
  routeIntervalID: any;

  distance: string;
  distanceSubject = new Subject<string>();
  duration: string;
  durationSubject = new Subject<string>();
  destination: string;
  destinationSubject = new Subject<string>();
  floor: string;
  floorSubject = new Subject<string>();

  metricMode: boolean;

  public dataShortName: any = [];
  public dataFullName: any = [];
  public roomListShortName: any = [];
  public roomListFullName: any = [];

  constructor(
    private modalCtrl: ModalController,
    private storageService: StorageService
  ) {
    this.distanceSubject.next('');
    this.durationSubject.next('');
    this.destinationSubject.next('');
    this.floorSubject.next('');
  }

  ionViewDidEnter() {
    // Get the list of rooms with shorten names such as NH, SB, etc
    fetch('./assets/data/rooms.json')
      .then((res) => res.json())
      .then((json) => {
        this.dataShortName = json;
      });

    // Get the list of rooms with full name such as NORTH HALL, etc
    fetch('./assets/data/rooms2.json')
      .then((res) => res.json())
      .then((json) => {
        this.dataFullName = json;
      });

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

      if (!this.userMarker) {
        this.userMarker = new google.maps.Marker({
          icon: {
            fillColor: 'blue',
            fillOpacity: 1,
            path: google.maps.SymbolPath[this.getUserIconMode()],
            rotation: this.heading,
            scale: 5,
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
            path: google.maps.SymbolPath[this.getUserIconMode()],
            rotation: this.heading,
            scale: 5,
            strokeColor: 'white',
            strokeWeight: 2,
          },
          position: this.userLocation,
        });
      }

      this.userMarker.setMap(this.map);
    });
  }

  getUserIconMode(): string {
    this.storageService.get('userIconMode').then((val) => {
      this.userIcon = val;
    });
    if (this.userIcon === 'triangle') {
      return 'FORWARD_CLOSED_ARROW';
    } else if (this.userIcon === 'circle') {
      return 'CIRCLE';
    } else {
      return 'CIRCLE';
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

  async getItems(ev: any) {
    // set val to the value of the searchbar
    const val = ev.target.value.toUpperCase();
    if (val && val.trim() !== '') {
      this.isSearching = true;
      this.roomListShortName = this.dataShortName.filter(
        (item) => item.roomNumber.indexOf(val) > -1
      );
      if (this.roomListShortName.length === 0) {
        this.isShortNameAvailable = false;
        this.roomListFullName = this.dataFullName.filter(
          (item) => item.roomNumber.indexOf(val) > -1
        );
        if (this.roomListFullName.length === 0) {
          this.isFullNameAvailable = false;
        } else {
          this.isFullNameAvailable = true;
        }
      } else {
        this.isFullNameAvailable = false;
        this.isShortNameAvailable = true;
      }
    } else {
      this.isSearching = false;
      this.isShortNameAvailable = false;
      this.isFullNameAvailable = false;
    }
  }

  async createPath(room: any): Promise<void> {
    this.isSearching = false;
    this.isRouting = true;

    this.selectedRoom = {
      number: room.roomNumber,
      lat: room.latitude,
      lng: room.longitude,
      floor: room.altitude,
    };

    // this.roomName = room.roomNumber;
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
    });

    this.tempServices = directionsService;
    this.tempRenderer = directionsRenderer;

    this.createNavMenu();

    this.routeIntervalID = setInterval(() => {
      this.calcRoute(this.tempServices, this.tempRenderer);
      this.calcDistance();
      this.tempRenderer.setMap(this.map);
      this.setLocationCenter();
    }, 1000);
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

    const request = await {
      origins: [user],
      destinations: [destination],
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem[this.getUnitMode()],
    };

    await service.getDistanceMatrix(request).then((response) => {
      this.distance = response.rows[0].elements[0].distance.text;
      this.duration = response.rows[0].elements[0].duration.text;
      this.destination = this.selectedRoom.number;
      this.floor = this.selectedRoom.floor;
      this.distanceSubject.next(this.distance);
      this.durationSubject.next(this.duration);
      this.destinationSubject.next(this.destination);
      this.floorSubject.next(this.floor);
    });
  }

  getUnitMode(): string {
    this.storageService.get('metricMode').then((val) => {
      this.metricMode = val;
    });
    if (this.metricMode) {
      return 'METRIC';
    } else {
      return 'IMPERIAL';
    }
  }

  async createNavMenu() {
    const navMenu = await this.modalCtrl.create({
      component: NavMenuComponent,
      componentProps: {
        distanceSubject: this.distanceSubject,
        durationSubject: this.durationSubject,
        destinationSubject: this.destinationSubject,
        floorSubject: this.floorSubject,
      },
      initialBreakpoint: 0.3,
      breakpoints: [0.3],
      backdropDismiss: false,
      handle: false,
    });
    navMenu.present();

    navMenu.onDidDismiss().then((data) => {
      this.isRouting = false;
      this.tempRenderer.setMap(null);
      this.selectedRoom = null;
      clearInterval(this.routeIntervalID);
    });
  }

  async createAboutModal() {
    const aboutModal = await this.modalCtrl.create({
      component: AboutComponent,
    });
    aboutModal.present();
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';

import { NavMenuComponent } from 'src/app/components/nav-menu/nav-menu.component';
import { AboutComponent } from 'src/app/components/about/about.component';

import { StorageService } from 'src/app/services/storage.service';

declare const google: any;

interface RoomInfo {
  // eslint-disable-next-line id-blacklist
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
export class MapPage implements OnInit {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  map: any;
  userIcon: string;
  userMarker: any;
  userLocation = { lat: 0, lng: 0 };
  isSearching = false;
  isShortNameAvailable = false;
  isFullNameAvailable = false;
  markerCreated = false;
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
  isFollowMode = false;

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


  
  async ngOnInit() {
    await this.storageService.init();
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

  // initializes and displays map
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

    if (await this.storageService.get('darkMode')) {
      this.setDarkMode();
    }

    this.followHandler();
  }

  // queries storage for user icon if one is chosen
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

  // centers map camera on user's current location
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

  // gets list of room numbers when searchbar is opened
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

  // opens nav menu and begins routing interval
  async createPath(room: any): Promise<void> {
    this.isSearching = false;
    this.isRouting = true;
    this.followMode();
    this.createNavMenu();

    this.selectedRoom = {
      // eslint-disable-next-line id-blacklist
      number: room.roomNumber,
      lat: room.latitude,
      lng: room.longitude,
      floor: room.altitude,
    };

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      preserveViewport: true,
    });

    this.tempServices = directionsService;
    this.tempRenderer = directionsRenderer;

    this.routeIntervalID = setInterval(() => {
      this.calcRoute(this.tempServices, this.tempRenderer);
      this.calcDistance();
      this.tempRenderer.setMap(this.map);
    }, 1000);
  }

  // calculates shortest walking path on map
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

  // calculates distance and time to destination
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

  // queries storage for units set by user
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

  // presents navMenu modal component
  async createNavMenu() {
    const navMenu = await this.modalCtrl.create({
      component: NavMenuComponent,
      componentProps: {
        distanceSubject: this.distanceSubject,
        durationSubject: this.durationSubject,
        destinationSubject: this.destinationSubject,
        floorSubject: this.floorSubject,
      },
      initialBreakpoint: 0.25,
      breakpoints: [0.25],
      backdropDismiss: false,
      handle: false,
      backdropBreakpoint: 1,
    });
    navMenu.present();

    navMenu.onDidDismiss().then((data) => {
      this.isRouting = false;
      this.tempRenderer.setMap(null);
      this.selectedRoom = null;
      clearInterval(this.routeIntervalID);
    });
  }

  // presents about modal
  async createAboutModal() {
    const aboutModal = await this.modalCtrl.create({
      component: AboutComponent,
    });
    aboutModal.present();
  }

  // when in follow mode map camera will follow user's movements
  followMode() {
    this.isFollowMode = true;
    this.followHandler();

    const followIntervalID = setInterval(() => {
      this.setLocationCenter();
      if (!this.isFollowMode) {
        clearInterval(followIntervalID);
      }
    }, 1000);
  }

  // detecting touch inputs to leave follow mode
  followHandler() {
    google.maps.event.addListenerOnce(this.map, 'drag', () => {
      this.isFollowMode = false;
    });
  }

  // dark mode map styling
  setDarkMode() {
    this.map.setOptions({
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }],
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }],
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }],
        },
      ],
    });
  }
}

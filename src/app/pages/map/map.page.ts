import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';

import { NavMenuComponent } from 'src/app/components/nav-menu/nav-menu.component';
import { AboutComponent } from 'src/app/components/about/about.component';

import { StorageService } from 'src/app/services/storage.service';

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
export class MapPage implements OnInit {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  map: any;
  userIcon = '../../../assets/user-icon.png';
  userMarker: any;
  userLocation = { lat: 0, lng: 0 };
  isSearching = false;
  isShortNameAvailable = false;
  isFullNameAvailable = false;
  markerCreated = false;
  heading: any;
  userDirection = 0;
  errorMsg: string;
  selectedRoom: LatLng;
  roomName: string;
  tempServices: any;
  tempRenderer: any;
  isRouting = false;
  routeIntervalID: any;
  distance: string;
  distanceSubject = new Subject<string>();
  duration: string;
  durationSubject = new Subject<string>();
  noSearchResult: string[] = ['No results found'];
  followMode = false;

  public dataShortName: any = [];
  public dataFullName: any = [];
  public roomListShortName: any = [];
  public roomListFullName: any = [];

  constructor(private modalCtrl: ModalController, private storageService: StorageService) {
    this.distanceSubject.next('');
    this.durationSubject.next('');
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

    if (await this.storageService.get('darkMode')) {
      this.setDarkMode();
    }

    this.followHandler();
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
    this.createNavMenu();

    this.selectedRoom = { lat: room.latitude, lng: room.longitude };
    this.roomName = room.roomNumber;
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

    const request = {
      origins: [user],
      destinations: [destination],
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    };

    await service.getDistanceMatrix(request).then((response) => {
      this.distance = response.rows[0].elements[0].distance.text;
      this.duration = response.rows[0].elements[0].duration.text;
      this.distanceSubject.next(this.distance);
      this.durationSubject.next(this.duration);
    });
  }

  async createNavMenu() {
    const navMenu = await this.modalCtrl.create({
      component: NavMenuComponent,
      componentProps: {
        distanceSubject: this.distanceSubject,
        durationSubject: this.durationSubject,
      },
      initialBreakpoint: 0.25,
      breakpoints: [0.25],
      backdropDismiss: false,
      handle: false,
    });
    navMenu.present();

    navMenu.onDidDismiss().then((data) => {
      this.isRouting = false;
      this.tempRenderer.setMap(null);
      this.roomName = null;
      clearInterval(this.routeIntervalID);
    });
  }

  async createAboutModal() {
    const aboutModal = await this.modalCtrl.create({
      component: AboutComponent,
    });
    aboutModal.present();
  }

  followHandler() {
    if (this.followMode) {
      google.maps.event.addListener(this.map, 'drag', () => {
        console.log('Dragging...');
      });
    }
  }

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

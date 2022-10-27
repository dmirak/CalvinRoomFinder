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

  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  constructor() { }

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
    // const input = document.getElementById('pac-input');
    // const searchBox = new google.maps.places.searchBox(input);
    // this.map.addListener('bouds_changed', function () {
    //   searchBox.setBounds(this.map.getBounds());
    // });
    // const markers = [];
    // searchBox.addListener('places_changed', function () {

    // })
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


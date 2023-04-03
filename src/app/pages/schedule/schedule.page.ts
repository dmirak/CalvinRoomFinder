import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { ScheduleItem, Day } from 'src/assets/data/ScheduleItem';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {
  @ViewChild(IonModal) createEditModal: IonModal;
  schedule: ScheduleItem[];
  scheduleItem: ScheduleItem = {
    id: '',
    title: '',
    days: [],
    time: new Date(),
    repeating: false
  };
  dayEnumValues: Day[] = Object.values(Day);
  isSearching = false;
  dataShortName: any = [];
  dataFullName: any = [];
  roomListShortName: any = [];
  roomListFullName: any = [];
  isShortNameAvailable = false;
  isFullNameAvailable = false;
  days = [
    { name: 'Sunday', order: 0 },
    { name: 'Monday', order: 1 },
    { name: 'Tuesday', order: 2 },
    { name: 'Wednesday', order: 3 },
    { name: 'Thursday', order: 4 },
    { name: 'Friday', order: 5 },
    { name: 'Saturday', order: 6 },
  ];
  currentDay = new Date().getDay();

  constructor(private storageService: StorageService) { }

  async ngOnInit() {
    await this.storageService.init();
    this.schedule = await this.storageService.get('schedule');
    if (this.schedule === null) {
      this.schedule = [];
      this.storageService.set('schedule', this.schedule);
    }

    this.days.sort((a, b) => {
      if (a.order === this.currentDay) {
        return -1;
      } else if (b.order === this.currentDay) {
        return 1;
      } else {
        return a.order - b.order;
      }
    });

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

  selectRoom(room) {
    this.isSearching = false;
    this.scheduleItem.location = {
      roomNumber: room.roomNumber,
      latitude: room.latitude,
      longitude: room.longitude,
      altitude: room.altitude,
    };
  }

  closeCreateEdit() {
    this.createEditModal.dismiss();
    this.scheduleItem = {
      id: '',
      title: '',
      days: [],
      time: new Date(),
      repeating: false,
      location: null
    };
  }

  saveItem() {
    this.createEditModal.dismiss();
    if (this.scheduleItem.id === '') {
      this.scheduleItem.id = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    }
    this.schedule.push(this.scheduleItem);
    this.storageService.set('schedule', this.schedule);
    this.scheduleItem = {
      id: '',
      title: '',
      days: [],
      time: new Date(),
      repeating: false,
      location: null
    };
  }

  toggleDay(day: Day) {
    if (this.scheduleItem.days.includes(day)) {
      this.scheduleItem.days = this.scheduleItem.days.filter(d => d !== day);
    } else {
      this.scheduleItem.days.push(day);
    }
  }

  deleteItem(id?: string, day?: any) {
    if (id && day) {
      this.schedule.find(i => i.id === id).days = this.schedule.find(i => i.id === id).days.filter(d => d !== day.name);
      this.storageService.set('schedule', this.schedule);
    }
    else {
      this.createEditModal.dismiss();
      if (this.scheduleItem.id !== '') {
        this.schedule = this.schedule.filter(item => item.id !== this.scheduleItem.id);
        this.storageService.set('schedule', this.schedule);
      }
      this.scheduleItem = {
        id: '',
        title: '',
        days: [],
        time: new Date(),
        repeating: false,
        location: null
      };
    }
  }
}

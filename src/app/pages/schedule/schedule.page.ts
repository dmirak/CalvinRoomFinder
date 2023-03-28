import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {

  constructor() { }

  ngOnInit() {
    // need to request permissions somehow
    LocalNotifications.requestPermissions();

    LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'test',
          body: 'body',
          schedule: { at: new Date(Date.now()) },
        }
      ]
    });
  }

}

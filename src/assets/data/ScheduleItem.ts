/* eslint-disable @typescript-eslint/naming-convention */
import { Room } from './Room';

export interface ScheduleItem {
    id: string;
    title: string;
    days: Day[];
    time: Date;
    location?: Room;
    repeating: boolean;
}

export enum Day {
    Sunday = 'Sunday',
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
}

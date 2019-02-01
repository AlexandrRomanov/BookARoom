import { IMeeting } from "../CalendarEvent/IMeeting";
  export interface IRoomItem {
    name: string;
    address: string;
    day1: IMeeting[];
    day2: IMeeting[];
    day3: IMeeting[];
    day4: IMeeting[];
    day5: IMeeting[];
  }
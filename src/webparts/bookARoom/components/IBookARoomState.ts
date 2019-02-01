
import * as moment from 'moment';
import { IMeeting } from '../../../common/CalendarEvent/IMeeting';
import { IRoomItem } from '../../../common/RoomItem/IRoomItem';
export interface IBookARoomState {
  loading: boolean;
  error: string;
  rooms:IRoomItem[];
  showNewMeetinng:boolean;
  showMeetinngInfo:boolean;
  token:string;
  meetinng:IMeeting;
  meetinngInfo:any;
  lokations:any[];
  date: moment.Moment;
  currentWeek:string;
  MyEvents:IMeeting[];
}



import { IMeeting } from './IMeeting';
import { IRoomItem } from './IListItem';
import * as moment from 'moment';
export interface IUpcomingMeetingsState {
  loading: boolean;
  error: string;
  rooms:IRoomItem[];
  showNewMeetinng:boolean;
  token:string;
  meetinng:IMeeting;
  lokations:any[];
  date: moment.Moment;
  currentWeek:string;
}

export interface IEditMeetingsState {
  meeting:IMeeting;
}

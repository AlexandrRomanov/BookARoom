import { IMeeting } from './IMeeting';
import { IRoomItem } from './IListItem';

export interface IUpcomingMeetingsState {
  loading: boolean;
  error: string;
  upcomingMeetings: IMeeting[];
  signedIn: boolean;
  rooms:IRoomItem[];
  myMeetings: IMeeting[];
  newMeetinng:boolean;
  token:string;
}
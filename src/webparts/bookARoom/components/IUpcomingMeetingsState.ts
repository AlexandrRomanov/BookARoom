import { IMeeting } from './IMeeting';
import { IRoomItem } from './IListItem';

export interface IUpcomingMeetingsState {
  loading: boolean;
  error: string;
  rooms:IRoomItem[];
  showNewMeetinng:boolean;
  token:string;
  meetinng:any;
}
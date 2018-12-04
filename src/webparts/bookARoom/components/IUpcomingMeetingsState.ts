import { IMeeting } from './IMeeting';
import { IRoomItem } from './IListItem';

export interface IUpcomingMeetingsState {
  loading: boolean;
  error: string;
  rooms:IRoomItem[];
  showNewMeetinng:boolean;
  token:string;
  meetinng:any;
  lokations:any[];
}

export interface IEditMeetingsState {
  meeting:any;
}
export interface ITokenHandlerState {
  expiresTokenDate:Date;
  expires_in:number;
  token:string;
  onChangeToken: (token:string) => void;
}
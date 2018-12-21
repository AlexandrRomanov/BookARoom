import { IEvent } from "../../../api/events/IEvent";

export interface IMeeting {
    id?: string;
    originalId?: string;
    subject?: string;
    body?:string;
    start: Date;
    end: Date;
    webLink?: string;
    isAllDay?: boolean;
    location?: {
      key:string,
      title:string
    };
    organizer?: string;
    status?: string;
    event?:IEvent;
    isOwner?:boolean
    attendees:IUser[]
  }

  export interface IUser{
    primaryText:string
    Email: string
}
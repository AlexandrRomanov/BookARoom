import { IAttendees } from "./IAttendees";

export interface IEvent{
    id?: string;
    subject:string;
    webLink?: string;
    isAllDay?: boolean;
    showAs?: string;
    body:{
        contentType:string;
        content:string;
    };
    start:{
        dateTime:string;
        timeZone:string;
    };
    end:{
        dateTime:string;
        timeZone:string;
    };
    location:{
        displayName:string;
        LocationEmailAddress:string;
    };
    attendees?: IAttendees[];
    organizer?: IAttendees;
    
}
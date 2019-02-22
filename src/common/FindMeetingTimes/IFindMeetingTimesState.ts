import { IUser } from "../CalendarEvent/IMeeting";

export interface IFindMeetingTimesState{
    attendees:IUser[];
    lokations:any[];
    location:any;
    start:Date;
    end:Date;
    duration:number;
    id:number;
    emptySuggestionsReason:string;
    loading:boolean;
    findResult:any[];
    selectedItem:any;
}
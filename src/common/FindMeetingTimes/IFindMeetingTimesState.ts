import { IUser } from "../CalendarEvent/IMeeting";

export interface IFindMeetingTimesState{
    attendees:IUser[];
    location:any[];
    start:Date;
    end:Date;
    duration:number;
    id:number;
    emptySuggestionsReason:string;
    loading:boolean;
    findResult:any[];
    selectedItem:any;
    startTime:Date;
    endTime:Date;
    launchStartTime:Date;
    launchEndTime:Date;
    showWorkingHours:boolean;
    excludeLaunchTime:boolean;
    showAllResults:boolean;
    submitType:SubmitType;
    subject:string;
}
export enum SubmitType{
    Find,
    Save
}
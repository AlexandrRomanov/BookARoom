import { IMeeting } from "../CalendarEvent/IMeeting";

export interface IEditMeetingsState {
    meeting:IMeeting;
    HiddenFindMeetingTimes:boolean;
    startTime:Date;
    FindMeetingTimesEvent:any;
}
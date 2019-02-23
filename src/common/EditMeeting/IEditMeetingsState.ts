import { IMeeting } from "../CalendarEvent/IMeeting";

export interface IEditMeetingsState {
    meeting:IMeeting;
    startTime:Date;
}
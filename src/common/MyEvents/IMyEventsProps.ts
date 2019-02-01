import { IMeeting } from "../../../lib/common/CalendarEvent/IMeeting";

export interface IMyEventsProps{
    events:IMeeting[],
    editItem: (meeting:any) => void;
    viewItem: (meeting:any) => void;
}
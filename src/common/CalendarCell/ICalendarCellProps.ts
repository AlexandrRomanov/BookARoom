
import * as moment from 'moment';
import { IMeeting } from '../CalendarEvent/IMeeting';

export interface ICalendarCellProps {
    meetings: IMeeting[];
    editItem: (meeting:any) => void;
    viewItem: (meeting:any) => void;
    date:moment.Moment;
    dayofWeek:number;
    location:string;
  }
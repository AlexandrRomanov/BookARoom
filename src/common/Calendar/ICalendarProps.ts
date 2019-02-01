
import * as moment from 'moment';
import { IRoomItem } from '../RoomItem/IRoomItem';

export interface ICalendarProps {
    rooms: IRoomItem[];
    editItem: (meeting:any) => void;
    viewItem: (meeting:any) => void;
    date:moment.Moment;
  }
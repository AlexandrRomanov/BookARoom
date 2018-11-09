import { IListItem, IRoomItem } from './IListItem';
import { IListItemAction, IRoomItemAction } from './IListItemAction';
import { IMeeting } from '../../../../lib/webparts/bookARoom/components/IMeeting';

export interface IListItemProps {
  item: IListItem;
  actions?: IListItemAction[];
}
export interface IRoomItemProps {
  item: IRoomItem;
  actions?: IRoomItemAction[];
}

export interface IMeetingItemProps {
  item: IMeeting;
}
export interface ICalendarProps {
  rooms: IRoomItem[];
}
export interface IEditMeetingProps {
  hidden:boolean;
  meeting:any;
  onClose: () => void;
  onSave: (meeting:any) => void;
}

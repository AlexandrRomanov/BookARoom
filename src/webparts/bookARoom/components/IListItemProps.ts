import { IListItem, IRoomItem } from './IListItem';
import { IListItemAction, IRoomItemAction } from './IListItemAction';
import { IMeeting } from '../../../../lib/webparts/bookARoom/components/IMeeting';
import { WebPartContext } from '@microsoft/sp-webpart-base';

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
  editItem: (meeting:any) => void;
}
export interface ICalendarProps {
  rooms: IRoomItem[];
  editItem: (meeting:any) => void;
}
export interface IEditMeetingProps {
  hidden:boolean;
  meeting:any;
  lokations:any[],
  onClose: () => void;
  onSave: (meeting:any) => void;
  context:WebPartContext
}


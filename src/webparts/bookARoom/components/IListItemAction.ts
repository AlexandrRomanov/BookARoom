import { IMeeting } from './IMeeting';
import { IRoomItem } from './IListItem';

export interface IListItemAction {
  icon: string;
  item: IMeeting;
  action: () => void;
}
export interface IRoomItemAction {
  item:IRoomItem
  action: () => void;
}
import { IListItem, IRoomItem } from './IListItem';
import { IListItemAction, IRoomItemAction } from './IListItemAction';

export interface IListItemProps {
  item: IListItem;
  actions?: IListItemAction[];
}
export interface IRoomItemProps {
  item: IRoomItem;
  actions?: IRoomItemAction[];
}
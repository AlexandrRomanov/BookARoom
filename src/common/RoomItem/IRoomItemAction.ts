
import { IRoomItem } from './IRoomItem';

export interface IRoomItemAction {
  item:IRoomItem;
  action: () => void;
}
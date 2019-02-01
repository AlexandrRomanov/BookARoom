import {  IRoomItem } from './IRoomItem';
import { IRoomItemAction } from './IRoomItemAction';

import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IRoomItemProps {
  item: IRoomItem;
  actions?: IRoomItemAction[];
}






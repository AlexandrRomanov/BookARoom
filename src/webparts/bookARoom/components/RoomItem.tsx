import * as React from 'react';
import { IRoomItemProps } from './IListItemProps';
import { IRoomItem } from './IListItem';
import styles from './UpcomingMeetings.module.scss';
import { IRoomItemAction } from './IListItemAction';


export class RoomItem extends React.Component<IRoomItemProps, {}> {
  public render(): JSX.Element {
    const item: IRoomItem = this.props.item;
    const actions: JSX.Element[] = this.props.actions.map((action: IRoomItemAction, index: number): JSX.Element => {
      return (
        <div className={styles.listItemAction} onClick={() => { action.action(); return false; }} key={'room-' + index} role="button">{ item.name }</div>
      );
    });
    return (
      <div className={styles.listItem}>
        <div className={styles.listItemPrimaryText}>
          {actions}
        </div>
      </div>
    );
  }
}
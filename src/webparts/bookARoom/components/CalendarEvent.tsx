import * as React from 'react';
import {  IMeetingItemProps } from './IListItemProps';
import { IMeeting } from './IMeeting';
import * as moment from 'moment';
import { IListItemAction } from './IListItemAction';

export class CalendarEvent extends React.Component<IMeetingItemProps, {}> {
    public render(): JSX.Element {
      const item: IMeeting = this.props.item;
      return (
        <div>
              <div onClick={() => { if(!!this.props.editItem) this.props.editItem(item); return false; }}>{moment(item.start).format('hh:mm') +' - ' + moment(item.end).format('hh:mm')}</div>
              <div>{item.subject}</div>
            </div>
      );
    }
  }



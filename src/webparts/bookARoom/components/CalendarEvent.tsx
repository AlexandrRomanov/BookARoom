import * as React from 'react';
import {  IMeetingItemProps } from './IListItemProps';
import { IMeeting } from './IMeeting';
import * as moment from 'moment';

export class CalendarEvent extends React.Component<IMeetingItemProps, {}> {
    public render(): JSX.Element {
      const item: IMeeting = this.props.item;
      return (
        <div>
              <div>{moment(item.start).format('hh:mm') +' - ' + moment(item.end).format('hh:mm')}</div>
              <div>{item.subject}</div>
            </div>
      );
    }
  }
import * as React from 'react';
import { ICalendarProps } from './IListItemProps';
import { IMeeting } from './IMeeting';
import { IRoomItem } from '../../../../lib/webparts/bookARoom/components/IListItem';
import { CalendarEvent } from './CalendarEvent';

var ReactTable = require("react-table").default;
export class Calendar extends React.Component<ICalendarProps, {}> {
  public render(): JSX.Element {
    const rooms: IRoomItem[] = this.props.rooms;
    const columns = [{
      Header: '',
      accessor: 'name' 
    }, {
      Header: 'Monday',
      accessor: 'day1',
      Cell: props => !props.value? null : props.value.map((item: IMeeting): JSX.Element => {
        return <CalendarEvent item={item} />;
      })
    }, {
      Header: 'Tuesday',
      accessor: 'day2',
      Cell: props => !props.value? null : props.value.map((item: IMeeting): JSX.Element => {
        return <CalendarEvent item={item} />;
      })
    }, {
      Header: 'Wednesday',
      accessor: 'day3',
      Cell: props => !props.value? null : props.value.map((item: IMeeting): JSX.Element => {
        return <CalendarEvent item={item} />;
      })
    }, {
      Header: 'Thusday',
      acceaccessor: 'day4',
      Cell: props => !props.value? null : props.value.map((item: IMeeting): JSX.Element => {
        return <CalendarEvent item={item} />;
      })
    }, {
      Header: 'Friday',
      accessor: 'day5',
      Cell: props => !props.value? null : props.value.map((item: IMeeting): JSX.Element => {
        return <CalendarEvent item={item} />;
      })
    }
    ]
    return (
      !rooms.length? null :
      (<ReactTable 
        data={rooms} 
        columns={columns} 
        showPagination={false} 
        pageSize={rooms.length}
        />)
    );
  }
}
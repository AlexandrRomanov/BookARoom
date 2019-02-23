import * as React from 'react';

import { ICalendarProps } from './ICalendarProps';

import style from './Calendar.module.scss';
import { CalendarCell } from '../CalendarCell/CalendarCell';
import { IRoomItem } from '../RoomItem/IRoomItem';

var ReactTable = require("react-table").default;
export class Calendar extends React.Component<ICalendarProps, {}> {
  public render(): JSX.Element {
    const rooms: IRoomItem[] = this.props.rooms;
    const days: string[] = ['Monday','Tuesday','Wednesday','Thusday','Friday',];
    const columns:any[] = [{
      Header: '',
      accessor: 'name',
      style:{ 'white-space': 'unset'},
    }];
    days.forEach((day,index) => {
      columns.push({
        Header: day,
        dayNumber:index,
        accessor: `day${index+1}`,
        style:{ 'white-space': 'unset'},
        Cell: props => this.getCell(props)
      });
    });
    return (
      !rooms.length? null :
      (<ReactTable 
        data={rooms} 
        columns={columns} 
        showPagination={false} 
        pageSize={rooms.length}
        className={[style.Calendar].join(" ")}
        />)
    );
    
  }
  private getCell(props:any):JSX.Element{
    return  <CalendarCell meetings={props.value} 
            editItem={this.props.editItem}
            viewItem={this.props.viewItem}
            date = {this.props.date}
            dayofWeek = {props.column.dayNumber} 
            location = {props.original.address}
            ></CalendarCell>;
  }
}
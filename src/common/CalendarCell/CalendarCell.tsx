import React = require("react");
import { CalendarEvent } from "../../common/CalendarEvent/CalendarEvent";
import { ICalendarCellProps } from "./ICalendarCellProps";
import * as moment from 'moment';

import style from './CalendarCell.module.scss';
import { ICalendarCellState } from "./ICalendarCellState";
import { IMeeting } from "../CalendarEvent/IMeeting";

export class CalendarCell extends React.Component<ICalendarCellProps, ICalendarCellState> {
    constructor(){
        super();
        this.state={
            isHovered:false,
            hoverIndex:0
        }
    }
    public render(): JSX.Element {
        const btnClass = this.state.isHovered ? "isHovered" : "";
        return  (<div className={[btnClass, style.CalendarCell].join(" ")}
                        onMouseEnter={()=>{this.hoverEnter(this)}}
                        onMouseLeave={()=>{this.hoverLeave(this)}}>
                    {!this.props.meetings? null : this.props.meetings.map((item: IMeeting): JSX.Element => {
                    return <CalendarEvent item={item} 
                                            editItem={(item)=>{ this.props.editItem(item); }} 
                                            viewItem={(item)=>{ this.props.viewItem(item); }} 
                            />;
                    })}
                    <div className={style.AddEventContainer}>
                        {this.state.isHovered?<div className={style.AddEvent}
                            onClick={ ()=>{ this.addEvent(this) }} 
                            ><a href="#" className={style.AddEventHref}>+ Add Event</a></div> : null} 
                    </div>
                </div>)
    }

    private addEvent(that:any){
        let thisDate = that.props.date.clone();
        let date = thisDate.startOf('isoWeek').add(that.props.dayofWeek, 'days')
        
        console.log(that.props.lokation,that.props.dayofWeek,that.props.date)
        let tempId = "tempId-" + new Date().valueOf();
        let item = {
            id:tempId,
            start:date.toDate(),
            end:date.toDate(),
            location:{
              key:that.props.lokation,
              title:''
            },
            attendees:[]
          }
          console.log(item);
          debugger
        that.props.editItem(item);
    }

    private hoverLeave(that:any){
        that.setState((prevState: ICalendarCellState): ICalendarCellState => {
            prevState.isHovered = false;
            prevState.hoverIndex = prevState.hoverIndex+1;
            return prevState;
        });
    }    
    private hoverEnter(that:any){
        let hoverIndex = this.state.hoverIndex;
        setTimeout(()=>{
            that.setState((prevState: ICalendarCellState): ICalendarCellState => {
                if(hoverIndex==prevState.hoverIndex){
                    prevState.isHovered = true;
                }
                return prevState;
            });
        },300);
    }  
}
import React = require("react");
import { IMyEventsProps } from "./IMyEventsProps";
import { CalendarEvent } from "../CalendarEvent/CalendarEvent";
import { IMeeting } from "../CalendarEvent/IMeeting";

export class MyEvents extends React.Component<IMyEventsProps, {}> {
    public render(): JSX.Element {
        return <div>{!this.props.events? null : this.props.events.map((item: IMeeting): JSX.Element => {
            return <CalendarEvent item={item} 
                                    editItem={(_item)=>{ this.props.editItem(_item); }} 
                                    viewItem={(_item)=>{ this.props.viewItem(_item); }} 
                    />;
            })}</div>;
    }
}
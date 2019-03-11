import * as React from 'react';
import ITimeLineProps from './TimeLineProps'
import ITimeLineState from './TimeLineState'
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import * as moment from 'moment';

export class TimeLine extends React.Component<ITimeLineProps, ITimeLineState> {

    private groups = [];
    private items = [];  

    constructor(props: ITimeLineProps) {
        super(props);
        console.log(this.props)     
        this.formatData();   
    }
    
    public render(): JSX.Element {
        return (
            <div>
                <Timeline
                    groups={this.groups}
                    items={this.items}
                    visibleTimeStart ={moment().startOf('day').add(8, 'hour').valueOf()}
                    visibleTimeEnd={moment().startOf('day').add(18, 'hour').valueOf()}
                    sidebarContent={<div>Attendees</div>}
                />
            </div> 
        )
    }

    private formatData(): void {
        let users = this.props.data;
        users.map((user, index) => {
            let group = {id: index + 1,
                         title: user.scheduleId
                         }
            this.groups.push(group)
            user.scheduleItems.map((slot,jndex) => {
                if (slot.status == 'busy') {
                    let item = {
                        id: (index + 1) * (jndex + 10),
                        group: index + 1,
                        title: ' ',
                        start_time: moment(slot.start.dateTime),
                        end_time: moment(slot.end.dateTime),
                        canMove: false,
                        canResize: false,
                        canChangeGroup: false }
                    this.items.push(item)                                    
                }
            })
        });
        console.log(this.groups, this.items)
    }
}
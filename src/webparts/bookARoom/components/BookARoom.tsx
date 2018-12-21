import * as React from 'react';
import 'react-table/react-table.css'
import  './CalendarStyle.css';
import styles from './BookARoom.module.scss';
import { IUpcomingMeetingsProps } from './IUpcomingMeetingsProps';
import { IUpcomingMeetingsState } from './IUpcomingMeetingsState';
import '../../WebPartAuthenticationContext';
import * as moment from 'moment';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Calendar } from './Calendar';
import { EditMeeting } from './EditMeetinng';
import { TokenHandler } from '../../../api/TokenHandler/TokenHandler';
import { EventsApi } from '../../../api/events/api';
import {IMeeting} from './IMeeting'
import { WebPartContext } from '@microsoft/sp-webpart-base';

export default class BookARoom extends React.Component<IUpcomingMeetingsProps, IUpcomingMeetingsState> {
  eventsApi:EventsApi;
  _context:WebPartContext
  constructor(props: IUpcomingMeetingsProps) {
    super(props);
    this.eventsApi = new EventsApi(props.context);
    this._context = props.context;
    let date = moment();
    this.state = {
      loading: false,
      error: null,
      rooms:[],
      lokations:[],
      showNewMeetinng:false,
      meetinng:{
        start:new Date(),
        end:new Date(),
        location:{
          key:'',
          title:''
        },
        attendees:[]
        
      },
      token:null,
      date:date,
      currentWeek:this.getCurrentWeek(date)
    };
  }
 
  public componentDidUpdate(prevProps: IUpcomingMeetingsProps, prevState: IUpcomingMeetingsState, prevContext: any): void {
    if (!prevState.token && !!this.state.token) {
      this.changeDate();
    }
  }

  public render(): React.ReactElement<IUpcomingMeetingsProps> {
    const loading: JSX.Element = this.state.loading ? <div style={{ margin: '0 auto', width: '7em' }}><div className={styles.spinner}><div className={`${styles.spinnerCircle} ${styles.spinnerNormal}`}></div><div className={styles.spinnerLabel}>Loading...</div></div></div> : <div/>;
    const error: JSX.Element = this.state.error ? <div><strong>Error: </strong> {this.state.error}</div> : <div/>;
    
    return (
      <div className={styles.upcomingMeetings}>
      <TokenHandler 
        onChangeToken = {(token)=>{
          this.setState((prevState: IUpcomingMeetingsState): IUpcomingMeetingsState => {
            prevState.token = token;
            return prevState;
          });
        }}
      />
        <DefaultButton 
          text="<" 
          onClick={ this._PreviousWeek } 
        />
        {this.state.currentWeek}
        <DefaultButton 
          text=">" 
          onClick={ this._NextWeek } 
        />
        &nbsp;
        <DefaultButton 
          text="Add Meeting" 
          hidden={ !this.state.rooms.length } 
          onClick={ this._openDialog } 
        />
        <Calendar rooms={this.state.rooms} editItem={(item)=>{
          this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
            prevState.meetinng = item;
            prevState.showNewMeetinng = true;
            return prevState;
          });
          }}/>
        <EditMeeting
          hidden = { !this.state.showNewMeetinng}
          meeting = { this.state.meetinng }
          lokations = { this.state.lokations}
          onSave = { this.addNewMeeting }
          onClose = { this._closeDialog }
          context = {this._context}
        />
        {loading}
        {error}
      </div>
    );
  }
  private addNewMeeting = (meeteng:any): void => {
    this.eventsApi.AddEvent(this.state.token, meeteng);
    this._closeDialog()
  }
  private _openDialog = (): void => {
    this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      prevState.showNewMeetinng = true;
      return prevState;
    });
  };
  private _closeDialog = (): void => {
    this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      prevState.showNewMeetinng = false;
      prevState.meetinng = {
        start:new Date(),
        end:new Date(),
        location:{
          key:'',
          title:''
        },
        attendees:[]
      };
      return prevState;
    });
  };
  
private _PreviousWeek = (): void => {
  this.changeDate(-7);
}

private _NextWeek = (): void => {
  debugger
  this.changeDate(7);
}
private changeDate(addDays:number=0){
  this.setState((previousState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
    if(!!addDays)
      previousState.date = moment(previousState.date, "DD-MM-YYYY").add(addDays, 'days');
    previousState.currentWeek=this.getCurrentWeek(previousState.date);
    previousState.loading = true;
    previousState.lokations = [];
    previousState.rooms = [];
    this.loadCalendar(previousState.date);
    return previousState;
  });
  
}
private getCurrentWeek(date:moment.Moment):string{
  return `${date.startOf('isoWeek').format('MM/DD/YYYY')} - ${moment(date, "DD-MM-YYYY").add(4, 'days').format('MM/DD/YYYY')}`;
}
  private loadCalendar(date:moment.Moment): void {
    this.eventsApi.GetDashboardData(this.state.token, date)
    .then(({rooms,lokations,MyEvents}): void => {
      console.log(rooms,lokations,MyEvents)
      this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
        prevState.lokations = lokations;
        prevState.rooms = rooms;
        prevState.loading = false;
        return prevState;
      });
    }, (error: any): void => {
      this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
        prevState.loading = false;
        prevState.error = error;
        return prevState;
      });
    })
  }
 
  
  


}

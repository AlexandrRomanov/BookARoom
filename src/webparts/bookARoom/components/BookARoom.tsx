import * as React from 'react';
import 'react-table/react-table.css'
import styles from './UpcomingMeetings.module.scss';
import { IUpcomingMeetingsProps } from './IUpcomingMeetingsProps';
import { IUpcomingMeetingsState } from './IUpcomingMeetingsState';
import { ICalendarMeeting } from './ICalendarMeeting';
import { IMeeting } from './IMeeting';
import { HttpClient, HttpClientResponse } from '@microsoft/sp-http';
import '../../WebPartAuthenticationContext';
import * as moment from 'moment';
import { IRoomItem } from './IListItem';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Calendar } from './Calendar';
import { EditMeeting } from './EditMeetinng';

export default class BookARoom extends React.Component<IUpcomingMeetingsProps, IUpcomingMeetingsState> {
 // private authCtx: adal.AuthenticationContext;

  constructor(props: IUpcomingMeetingsProps, context?: any) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      rooms:[],
      showNewMeetinng:false,
      token:'',
      meetinng:{}
    };
  }
  
  
  public componentDidMount(): void {
    if (window !== window.top) {
      return;
    }
    if(window.location.href.split("#access_token=").length>1){
      this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
        prevState.token = window.location.href.split("#access_token=")[1].split("&")[0];
        return prevState;
      });
      
    }
    else{
      let _url ='https://dcgovict.sharepoint.com/sites/dhcf/it/SitePages/Book-a-Room.aspx';
      //let _url ='https://dcgovict.sharepoint.com/sites/dhcf/it/_layouts/15/workbench.aspx';
      let url = `https://login.windows.net/dc.gov/oauth2/v2.0/authorize?
                  response_type=token&
                  client_id=${encodeURI('3accf488-95f1-488e-bf1b-6c08a6af457d')}&
                  scope=${encodeURI('user.read user.readbasic.all calendars.read calendars.read.shared calendars.ReadWrite.shared calendars.readwrite')}&
                  redirect_uri=${encodeURI(_url)}`
    
      window.location.replace(url);
  }
  }

  public componentDidUpdate(prevProps: IUpcomingMeetingsProps, prevState: IUpcomingMeetingsState, prevContext: any): void {
    if (prevState.token !== this.state.token && !!this.state.token) {
      this.loadCalendar();
    }
  }

  public render(): React.ReactElement<IUpcomingMeetingsProps> {
    const loading: JSX.Element = this.state.loading ? <div style={{ margin: '0 auto', width: '7em' }}><div className={styles.spinner}><div className={`${styles.spinnerCircle} ${styles.spinnerNormal}`}></div><div className={styles.spinnerLabel}>Loading...</div></div></div> : <div/>;
    const error: JSX.Element = this.state.error ? <div><strong>Error: </strong> {this.state.error}</div> : <div/>;
    
    return (
      <div className={styles.upcomingMeetings}>
        <DefaultButton 
          text="Add Meeting" 
          hidden={ !this.state.rooms.length } 
          onClick={ this._openDialog } 
        />
        <Calendar rooms={this.state.rooms} />
        <EditMeeting
          hidden = { !this.state.showNewMeetinng}
          meeting = { this.state.meetinng }
          onSave = { this.addNewMeeting }
          onClose = { this._closeDialog }
        />
        {loading}
        {error}
      </div>
    );
  }
  private addNewMeeting = (meeteng:any): void => {
    //BookARoom.addEvent(this.state.token, this.props.httpClient, event) tmp
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
      return prevState;
    });
  };
  
  
  private loadCalendar(): void {
    this.setState((previousState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      previousState.loading = true;
      return previousState;
    });
        BookARoom.getRooms(this.state.token, this.props.httpClient)
        .then((upcomingMeetings: IRoomItem[]): void => {
          this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
            prevState.rooms = upcomingMeetings;
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
 
    private static addEvent(accessToken: string, httpClient: HttpClient, event:any): Promise<IRoomItem[]> {
    return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
      
      httpClient.post(`https://graph.microsoft.com/v1.0/me/calendar/events`, HttpClient.configurations.v1, {
        headers: {
          'Accept': 'application/json;odata.metadata=none',
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type':'application/json',
        },
        body:JSON.stringify(event)
      })
        .then((response: HttpClientResponse): Promise<{ value: any }> => {
          return response.json();
        })
        .then((result: { value: any }): void => {
          console.log(result)
        }, (error: any): void => {
          reject(error);
        });
    });
  }
  private static getRooms(accessToken: string, httpClient: HttpClient): Promise<IRoomItem[]> {

    const getEvents = file => new Promise((resolve, reject) => {
      BookARoom.getEvents(accessToken, httpClient, file.address)
        .then((upcomingMeetings: IMeeting[]): void => {
          upcomingMeetings.forEach((element:IMeeting) => {
            let day = 'day' + element.start.getDay();
            if(!!file[day])
              file[day].push(element);
            else
              file[day] = [element];
          });
          resolve(file);
        });
    });
  

    return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
      
      httpClient.get(`https://graph.microsoft.com/beta/me/findRooms(RoomList='DHCFRooms@dcgovict.onmicrosoft.com')`, HttpClient.configurations.v1, {
        headers: {
          'Accept': 'application/json;odata.metadata=none',
          'Authorization': 'Bearer ' + accessToken
        }
      })
        .then((response: HttpClientResponse): Promise<{ value: IRoomItem[] }> => {
          return response.json();
        })
        .then((todayMeetings: { value: IRoomItem[] }): void => {
          if(!todayMeetings)
           resolve([]);
          Promise.all(todayMeetings.value.map(getEvents))
          .then((aa:any)=>{
            resolve(aa);
          });
          
        }, (error: any): void => {
          reject(error);
        });
    });
  }


  private static  applyDate() {
    let starttime = moment().startOf('isoWeek').format('YYYY-MM-DD')+'T04:00:00.000Z'; //moment('12/12/2018')
    let endtime = moment().endOf('isoWeek').format('YYYY-MM-DD')+'T03:59:59.000Z';
    return `?startdatetime=${starttime}&enddatetime=${endtime}`;
}
  private static getEvents(accessToken: string, httpClient: HttpClient, room:string): Promise<IMeeting[]> {
    return new Promise<any>((resolve: (meetings: IMeeting[]) => void, reject: (error: any) => void): void => {
      var _timestring = BookARoom.applyDate();
      
      httpClient.get(`https://graph.microsoft.com/v1.0/users/${room}/calendarview${_timestring}`, HttpClient.configurations.v1, {
        headers: {
          'Accept': 'application/json;odata.metadata=none',
          'Authorization': 'Bearer ' + accessToken
        }
      })
        .then((response: HttpClientResponse): Promise<{ value: ICalendarMeeting[] }> => {
          return response.json();
        })
        .then((todayMeetings: { value: ICalendarMeeting[] }): void => {
          const upcomingMeetings: IMeeting[] = [];
          for (let i: number = 0; i < todayMeetings.value.length; i++) {
            const meeting: ICalendarMeeting = todayMeetings.value[i];
            upcomingMeetings.push(BookARoom.getMeeting(meeting));
          }
          resolve(upcomingMeetings);
        }, (error: any): void => {
          reject(error);
        });
    });
  }
  

  private static getMeeting(calendarMeeting: ICalendarMeeting): IMeeting {
    return {
      id: calendarMeeting.id,
      subject: calendarMeeting.subject,
      start: new Date(calendarMeeting.start.dateTime + 'Z'),
      end: new Date(calendarMeeting.end.dateTime + 'Z'),
      webLink: calendarMeeting.webLink,
      isAllDay: calendarMeeting.isAllDay,
      location: calendarMeeting.location.displayName,
      organizer: `${calendarMeeting.organizer.emailAddress.name} <${calendarMeeting.organizer.emailAddress.address}>`,
      status: calendarMeeting.showAs
    };
  }

}

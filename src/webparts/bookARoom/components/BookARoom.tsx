import * as React from 'react';
import styles from './UpcomingMeetings.module.scss';
import { IUpcomingMeetingsProps } from './IUpcomingMeetingsProps';
import { IUpcomingMeetingsState } from './IUpcomingMeetingsState';
import { ICalendarMeeting } from './ICalendarMeeting';
import { IMeeting } from './IMeeting';
import { escape } from '@microsoft/sp-lodash-subset';
import { HttpClient, HttpClientResponse } from '@microsoft/sp-http';
import * as AuthenticationContext from 'adal-angular';
import adalConfig from '../AdalConfig';
import { IAdalConfig } from '../../IAdalConfig';
import '../../WebPartAuthenticationContext';
import { ListItem } from './ListItem';
import * as moment from 'moment';

import { RoomItem } from './RoomItem';
import { IRoomItem } from './IListItem';

import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

export default class BookARoom extends React.Component<IUpcomingMeetingsProps, IUpcomingMeetingsState> {
  private authCtx: adal.AuthenticationContext;

  constructor(props: IUpcomingMeetingsProps, context?: any) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      upcomingMeetings: [],
      signedIn: false,
      rooms:[],
      myMeetings:[],
      newMeetinng:false,
      token:''
    };

    const config: IAdalConfig = adalConfig;
    config.popUp = true;
    config.webPartId = this.props.webPartId;
    config.callback = (error: any, token: string): void => {
      this.setState((previousState: IUpcomingMeetingsState, currentProps: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
        previousState.error = error;
        previousState.signedIn = !(!this.authCtx.getCachedUser());
        return previousState;
      });
    };

    this.authCtx = new AuthenticationContext(config);
    AuthenticationContext.prototype._singletonInstance = undefined;
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
      let url = `https://login.windows.net/dc.gov/oauth2/v2.0/authorize?
                  response_type=token&
                  client_id=${encodeURI('3accf488-95f1-488e-bf1b-6c08a6af457d')}&
                  scope=${encodeURI('user.read user.readbasic.all calendars.read calendars.read.shared calendars.ReadWrite.shared calendars.readwrite')}&
                  redirect_uri=${encodeURI('https://dcgovict.sharepoint.com/sites/dhcf/it/_layouts/15/workbench.aspx')}`
    
      window.location.replace(url);
    }
  }

  public componentDidUpdate(prevProps: IUpcomingMeetingsProps, prevState: IUpcomingMeetingsState, prevContext: any): void {
    if (prevState.token !== this.state.token) {
      this.loadUpcomingMeetings();
    }
  }

  public render(): React.ReactElement<IUpcomingMeetingsProps> {
    const login: JSX.Element = this.state.signedIn ? <div /> : <button className={`${styles.button} ${styles.buttonCompound}`} onClick={() => { this.signIn(); } }><span className={styles.buttonLabel}>Sign in</span><span className={styles.buttonDescription}>Sign in to see your upcoming meetings</span></button>;
    const loading: JSX.Element = this.state.loading ? <div style={{ margin: '0 auto', width: '7em' }}><div className={styles.spinner}><div className={`${styles.spinnerCircle} ${styles.spinnerNormal}`}></div><div className={styles.spinnerLabel}>Loading...</div></div></div> : <div/>;
    const error: JSX.Element = this.state.error ? <div><strong>Error: </strong> {this.state.error}</div> : <div/>;
    const meetingItems: JSX.Element[] = this.state.upcomingMeetings.map((item: IMeeting, index: number, meetings: IMeeting[]): JSX.Element => {
      return <ListItem key={index} item={
        {
          primaryText: item.subject,
          secondaryText: item.location,
          tertiaryText: item.organizer,
          metaText: moment(item.start).format('MM/DD/YYYY hh:mm') +' - ' + moment(item.end).format('hh:mm'),
          isUnread: item.status === 'busy'
        }
      }
        actions={[
          {
            icon: 'View',
            item: item,
            action: (): void => {
              console.log(item)
             // window.open(item.webLink, '_blank');
            }
          }
        ]} />;
    });
    const roomItems: JSX.Element[] = this.state.rooms.map((item: IRoomItem, index: number, meetings: IRoomItem[]): JSX.Element => {
      return <RoomItem key={index} item={
        {
          name: item.name,
          address: item.address
        }
      } 
      actions={[
        {
          item: item,
          action: (): void => {
            this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
              prevState.loading = true;
              prevState.upcomingMeetings = [];
              return prevState;
            });
            this.loadMeetings(item.address)
          }
        }
      ]}/>;
    });
    const myMeetingItems: JSX.Element[] = this.state.myMeetings.map((item: IMeeting, index: number, meetings: IMeeting[]): JSX.Element => {
      return <ListItem key={index} item={
        {
          primaryText: item.subject,
          secondaryText: item.location,
          tertiaryText: item.organizer,
          metaText: moment(item.start).format('MM/DD/YYYY hh:mm') +' - ' + moment(item.end).format('hh:mm'),
          isUnread: item.status === 'busy'
        }
      }
        actions={[
          {
            icon: 'View',
            item: item,
            action: (): void => {
              console.log(item)
             // window.open(item.webLink, '_blank');
            }
          }
        ]} />;
    });
    let meetings: JSX.Element = <div>
      {(roomItems.length>0)?
        <div className={'ms-font-xl ' + styles.webPartTitle}>Meetings&nbsp;&nbsp;&nbsp;
            <DefaultButton onClick={
              (_) => { 
                this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
                  prevState.newMeetinng = true;
                  return prevState;
                });
              }
            } text="Add Meeting" />
        </div>
        :null
      }
      {meetingItems}
    </div>;
    let rooms: JSX.Element = <div>
      {(roomItems.length>0)?
        <div className={'ms-font-xl ' + styles.webPartTitle}>Rooms</div>
        :null
      }
      {roomItems}
    </div>;
    let myMeetings: JSX.Element = <div>
      {(myMeetingItems.length>0)?
        <div className={'ms-font-xl ' + styles.webPartTitle}>My Meetings</div>
        :null
      }
      {myMeetingItems}
      </div>;
    if (this.state.upcomingMeetings.length === 0 &&
      this.state.signedIn &&
      !this.state.loading &&
      !this.state.error) {
      meetings = <div style={{ textAlign: 'center' }}>No upcoming meetings: ) </div>;
    }

    return (
      <div className={styles.upcomingMeetings}>
      

        <Dialog
          hidden={!this.state.newMeetinng}
          onDismiss={this._closeDialog}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Mew Meetinng',
            subText: 'test'
          }}
          modalProps={{
            titleAriaId: 'myLabelId',
            subtitleAriaId: 'mySubTextId',
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}
        >
          {null /** You can also include null values as the result of conditionals */}
          <DialogFooter>
            <PrimaryButton onClick={this._closeDialog} text="Save" />
            <DefaultButton onClick={this._closeDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
        {myMeetings}
        {rooms}
        {meetings}
        {loading}
        {error}
      </div>
    );
  }
  private _closeDialog = (): void => {
    this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      prevState.newMeetinng = false;
      return prevState;
    });
  };
  public signIn(): void {
    this.authCtx.login();
  }

  private static getDateTime(date: Date): string {
    return `${date.getHours()}:${BookARoom.getPaddedNumber(date.getMinutes())}`;
  }




  private loadMeetings(room:string): void {
    this.setState((previousState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      previousState.loading = true;
      return previousState;
    });
    
        BookARoom.getEvents(this.state.token, this.props.httpClient, room)
        .then((upcomingMeetings: IMeeting[]): void => {
          this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
            prevState.loading = false;
            prevState.upcomingMeetings = upcomingMeetings;
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
  private loadMyMeetings(): void {
    this.setState((previousState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      previousState.loading = true;
      return previousState;
    });
   
        BookARoom.getUpcomingMeetings(this.state.token, this.props.httpClient)
        .then((upcomingMeetings: IMeeting[]): void => {
          this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
            prevState.loading = false;
            prevState.myMeetings = upcomingMeetings;
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
  private loadUpcomingMeetings(): void {
    this.setState((previousState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      previousState.loading = true;
      return previousState;
    });
    
        BookARoom.getRooms(this.state.token, this.props.httpClient)
        .then((upcomingMeetings: IRoomItem[]): void => {
          this.loadMyMeetings();
          if(BookARoom.length>0)
            this.loadMeetings(upcomingMeetings[0].address);
          this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
            prevState.rooms = upcomingMeetings;
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
 
  /*
  private getGraphAccessToken(): Promise<string> {
    return new Promise<string>((resolve: (accessToken: string) => void, reject: (error: any) => void): void => {
      const graphResource: string = 'https://graph.microsoft.com';
      const accessToken: string = this.authCtx.getCachedToken(graphResource);
      if (accessToken) {
        resolve(accessToken);
        return;
      }

      if (this.authCtx.loginInProgress()) {
        reject('Login already in progress');
        return;
      }

      this.authCtx.acquireToken(graphResource, (error: string, token: string) => {
        if (error) {
            reject(error);
          return;*//*
        }

        if (token) {
          resolve(token);
        }
        else {
          reject('Couldn\'t retrieve access token');
        }
      });
    });
  }*/
  private static getRooms(accessToken: string, httpClient: HttpClient): Promise<IRoomItem[]> {
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
          console.log(todayMeetings)
          
          resolve(!!todayMeetings?todayMeetings.value:[]);
        }, (error: any): void => {
          reject(error);
        });
    });
  }
  private static  applyDate() {
    let starttime = moment().startOf('isoWeek').format('YYYY-MM-DD')+'T04:00:00.000Z';
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
          console.log(todayMeetings.value);
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
  private static getUpcomingMeetings(accessToken: string, httpClient: HttpClient): Promise<IMeeting[]> {
    return new Promise<IMeeting[]>((resolve: (upcomingMeetings: IMeeting[]) => void, reject: (error: any) => void): void => {
      const now: Date = new Date();
      const dateString: string = now.getUTCFullYear() + '-' + BookARoom.getPaddedNumber(now.getUTCMonth() + 1) + '-' + BookARoom.getPaddedNumber(now.getUTCDate());
      const startDate: string = dateString + 'T' + BookARoom.getPaddedNumber(now.getUTCHours()) + ':' + BookARoom.getPaddedNumber(now.getUTCMinutes()) + ':' + BookARoom.getPaddedNumber(now.getUTCSeconds()) + 'Z';
      const endDate: string = dateString + 'T23:59:59Z';
      let t = this.applyDate()
      httpClient.get(`https://graph.microsoft.com/v1.0/me/calendarView${t}&$orderby1=Start&$select=id,subject,start,end,webLink,isAllDay,location,organizer,showAs`, HttpClient.configurations.v1, {
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
            const meetingStartDate: Date = new Date(meeting.start.dateTime + 'Z');
            if (meetingStartDate.getDate() === now.getDate()) {
              upcomingMeetings.push(BookARoom.getMeeting(meeting));
            }
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

  private static getPaddedNumber(n: number): string {
    if (n < 10) {
      return '0' + n;
    }
    else {
      return n.toString();
    }
  }
}

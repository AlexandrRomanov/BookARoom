import { WebPartContext } from "@microsoft/sp-webpart-base";
import { HttpClient, HttpClientResponse } from "@microsoft/sp-http";
import { IRoomItem } from "../../webparts/bookARoom/components/IListItem";
import { IMeeting, IUser } from "../../webparts/bookARoom/components/IMeeting";
import * as moment from 'moment';
import { IEvent } from "./IEvent";
import { values } from "office-ui-fabric-react";
import { IAttendees } from "../../../lib/api/events/IAttendees";
const axios = require('axios');




export class EventsApi {
    rooms:any[] = null;
    myInfo:any = null;
    context:WebPartContext;
    httpClient:HttpClient;
    constructor(context:WebPartContext){
        this.context = context;
        this.httpClient = context.httpClient;
    }

    public AddEvent(accessToken: string, event:IMeeting): Promise<IRoomItem[]> {
        return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
            let timeZone = 'America/New_York';
            let attendees = this.usersToAttendees(event.attendees);
            attendees.push({
                emailAddress: {
                  address:event.location.key,
                  name: event.location.title
                },
                type: "required"
              });
            let data:IEvent = {
                subject:event.subject,
                body:{
                    contentType: "HTML",
                    content: event.body,
                },
                start:{
                    dateTime:moment(event.start).format('YYYY-MM-DDTHH:mm:SS'),
                    timeZone:timeZone
                },
                end:{
                    dateTime:moment(event.end).format('YYYY-MM-DDTHH:mm:SS'),
                    timeZone:timeZone
                },
                location:{
                    displayName:event.location.title,
                    LocationEmailAddress:event.location.key
                },
                attendees:attendees
            }
            console.log(event,data)
            debugger;
            
            if(event.id){
                this.editEvent(event, data, accessToken, resolve, reject);
            }
            else{
                this.addEvent(accessToken, data, resolve, reject);
            }
            
        });
      }
    private editEvent(event: IMeeting, data: IEvent, accessToken: string, resolve: (roms: any) => void, reject: (error: any) => void) {
        let url = `https://graph.microsoft.com/v1.0/me/calendar/events/${event.originalId}`;
        axios.patch(url, data, {
            headers: {
                'Accept': 'application/json;odata.metadata=none',
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                console.log(response);
                resolve(response);
            }, _ => {
                reject(_);
            });
    }

    private addEvent(accessToken: string, data: IEvent, resolve: (roms: any) => void, reject: (error: any) => void) {
        let url = 'https://graph.microsoft.com/v1.0/me/calendar/events';
        this.httpClient.post(url, HttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata.metadata=none',
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response: HttpClientResponse): Promise<{
                value: any;
            }> => {
                return response.json();
            })
            .then((result: {
                value: any;
            }): void => {
                console.log(result);
                resolve(result);
            }, (error: any): void => {
                reject(error);
            });
    }

    public  GetDashboardData(accessToken: string, date: moment.Moment): Promise<{rooms:IRoomItem[], lokations: any[], MyEvents:IMeeting[]}> {
        return new Promise<any>((resolve, reject): void => {
            var _timestring = this.applyDate(date);
            Promise.all([
                this.getEvents(accessToken,`https://graph.microsoft.com/v1.0/me/calendarview${_timestring}`),
                this.getAllEvents(accessToken,_timestring), 
                this.getMyProfile(accessToken)]).then((value)=>{
                    let MyEvents:IMeeting[] = value["0"];
                    let rooms:any[] = value["1"].rooms;
                    let lokations:any[] = value["1"].lokations;
                    let myInfo:any = value["2"];
                    MyEvents.forEach(element => {
                        console.log(element);
                        if(!!element.event && !!element.event.organizer && element.event.organizer.emailAddress &&
                            element.event.organizer.emailAddress.address == myInfo.mail)
                            element.isOwner = true;
                    });
                    console.log(myInfo)
                    rooms.forEach(element => {
                    for(let id =1;id<=5;id++){
                        if(element['day'+id] && element['day'+id].length){
                            element['day'+id].forEach(event => {
                                let a = MyEvents.filter(x=> x.organizer== event.organizer &&
                                    x.location.title == event.location.title &&
                                    moment(x.start).isSame(moment(event.start)) &&
                                    moment(x.end).isSame(moment(event.end)) 
                                );
                                if(a.length>0){
                                    event.originalId = a[0].id;
                                    event.isOwner = a[0].isOwner;
                                }
                            });
                        }
                    }
                });
                resolve({
                    rooms:rooms,
                    lokations:lokations,
                    MyEvents:MyEvents
                });
            },
            _=>{
                reject(_);
            })
        });
      }
      private getAllEvents(accessToken: string, timestring: string){
        const getEvents = file => new Promise((resolve, reject) => {
            this.getEvents(accessToken, `https://graph.microsoft.com/v1.0/users/${file.address}/calendarview${timestring}`)
              .then((upcomingMeetings: IMeeting[]): void => {
                upcomingMeetings.forEach((element:IMeeting) => {
                  let day = 'day' + element.start.getDay();
                  if(!!file[day])
                    file[day].push(element);
                  else
                    file[day] = [element];
                });
                resolve(file);
              },_=>{
                  reject(_);
              });
          });
        
      
          return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
              this.getRooms(accessToken).then(rooms=>{
                  Promise.all(rooms.map(getEvents))
                  .then((rooms:any[])=>{
                      let lokations = [];
                      rooms.forEach(x=> lokations.push({
                          key: x.address,
                          title: x.name
                      }));
                      resolve({
                          rooms:rooms,
                          lokations:lokations
                      });
                  });
              }, (error: any): void => {
                  reject(error);
              })
          });
      }
      private getRooms(accessToken: string): Promise<IRoomItem[]> {
        return new Promise<any>((resolve, reject): void => {
            if(!!this.rooms){
                console.log('!!!!');
                resolve(JSON.parse(JSON.stringify(this.rooms)));
            }
            else{
                this.httpClient.get(`https://graph.microsoft.com/beta/me/findRooms(RoomList='DHCFRooms@dcgovict.onmicrosoft.com')`, HttpClient.configurations.v1, {
                    headers: {
                    'Accept': 'application/json;odata.metadata=none',
                    'Authorization': 'Bearer ' + accessToken
                    }
                })
                .then((response: HttpClientResponse): Promise<{ value: IRoomItem[] }> => {
                  return response.json();
                })
                .then((todayMeetings: { value: IRoomItem[] }): void => {
                    this.rooms = [];
                    if(todayMeetings && todayMeetings.value)
                        this.rooms = todayMeetings.value;
                    resolve(JSON.parse(JSON.stringify(this.rooms)))
                }, (error: any): void => {
                    reject(error);
                });
            }
        })
      }
      private getMyProfile(accessToken: string): Promise<any> {
        return new Promise<any>((resolve, reject): void => {
            if(!!this.myInfo)
                resolve(this.myInfo);
            else{
                this.httpClient.get(`https://graph.microsoft.com/v1.0/me/`, HttpClient.configurations.v1, {
                    headers: {
                    'Accept': 'application/json;odata.metadata=none',
                    'Authorization': 'Bearer ' + accessToken
                    }
                })
                .then((response: HttpClientResponse): Promise<{ value:  any}> => {
                    return response.json();
                })
                .then((result: any ): void => {
                    this.myInfo = result;
                    resolve(result);
                }, (error: any): void => {
                    reject(error);
                });
            }
        });
      }

      private getEvents(accessToken: string, url:string): Promise<IMeeting[]> {
        return new Promise<any>((resolve: (meetings: IMeeting[]) => void, reject: (error: any) => void): void => {
          this.httpClient.get(url, HttpClient.configurations.v1, {
            headers: {
              'Accept': 'application/json;odata.metadata=none',
              'Authorization': 'Bearer ' + accessToken
            }
          })
            .then((response: HttpClientResponse): Promise<{ value: IEvent[] }> => {
              return response.json();
            })
            .then((events: { value: IEvent[] }): void => {
              const upcomingMeetings: IMeeting[] = [];
              for (let i: number = 0; i < events.value.length; i++) {
                const meeting: IEvent = events.value[i];
                upcomingMeetings.push(this.getMeeting(meeting));
              }
              resolve(upcomingMeetings);
            }, (error: any): void => {
              reject(error);
            });
        });
      }
      
      private applyDate(date: moment.Moment) {
        let starttime = date.startOf('isoWeek').format('YYYY-MM-DD')+'T04:00:00.000Z';
        let endtime = date.endOf('isoWeek').format('YYYY-MM-DD')+'T03:59:59.000Z';
        console.log(`?startdatetime=${starttime}&enddatetime=${endtime}`)
        return `?startdatetime=${starttime}&enddatetime=${endtime}`;
    }
    private getMeeting(event: IEvent): IMeeting {
        return {
          id: event.id,
          subject: event.subject,
          body:event.body.content,
          start: new Date(event.start.dateTime + 'Z'),
          end: new Date(event.end.dateTime + 'Z'),
          webLink: event.webLink,
          isAllDay: event.isAllDay,
          location: {
            key:'',
            title: event.location.displayName
          },
          organizer: `${event.organizer.emailAddress.name} <${event.organizer.emailAddress.address}>`,
          status: event.showAs,
          event:event,
          attendees:this.attendeesToUsers(event.attendees,event.organizer, event.location.displayName)
        };
      }
      private attendeesToUsers(attendees:IAttendees[],organizer:IAttendees, location:string):IUser[]{
        let result =[];
        let organizerName = !!organizer && !!organizer.emailAddress ? organizer.emailAddress.name :'';
        if(!!attendees && attendees.length){
            attendees.forEach(element => {
                if(!!element.emailAddress && organizerName !=element.emailAddress.name && location!=element.emailAddress.name)
                    result.push({
                        primaryText:element.emailAddress.name,
                        Email: element.emailAddress.address
                    })
            });
        }
        return result;
      }
      private usersToAttendees(attendees:IUser[]):IAttendees[]{
        let result =[];
        if(!!attendees && attendees.length){
            attendees.forEach(element => {
                if(!!element.Email)
                    result.push({
                        emailAddress: {
                            address: element.Email,
                            name:element.primaryText? element.primaryText:''
                          },
                          type: "required"
                    })
            });
        }
        return result;
      }

}
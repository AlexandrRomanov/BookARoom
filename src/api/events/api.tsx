import { WebPartContext } from "@microsoft/sp-webpart-base";
import { HttpClient, HttpClientResponse } from "@microsoft/sp-http";
import * as moment from 'moment';
import { IEvent } from "./IEvent";
import { values } from "office-ui-fabric-react";

import { IMeeting, IUser } from "../../common/CalendarEvent/IMeeting";
import { IRoomItem } from "../../common/RoomItem/IRoomItem";
import { IAttendees } from "./IAttendees";
const axios = require('axios');
const $ = require("jquery");




export class EventsApi {
    private findMeetingTimesUrl(currentUserEmail:string) { return 'https://graph.microsoft.com/v1.0/me/findMeetingTimes'; }
    private getUserInfoUrl(email:string) { return `https://graph.microsoft.com/v1.0/users/${email}/`; }
    private getCalendarviewUrl(email:string, timestring:string) { return `https://graph.microsoft.com/v1.0/users/${email}/calendarview${timestring}`; }
    private getCalendarviewUrl2(currentUserEmail:string) { return `https://graph.microsoft.com/v1.0/users/${currentUserEmail}/findMeetingTimes`; }
    private urls = {
        editEvent: 'https://graph.microsoft.com/v1.0/me/calendar/events/',
        addEvent: 'https://graph.microsoft.com/v1.0/me/calendar/events',
        calendarview: 'https://graph.microsoft.com/v1.0/me/calendarview',
        DHCFRooms: `https://graph.microsoft.com/beta/me/findRooms(RoomList='DHCFRooms@dcgovict.onmicrosoft.com')`,
        myProfile: `https://graph.microsoft.com/v1.0/me/`,
        findMeetingTimes: this.findMeetingTimesUrl,
        getUserInfo: this.getUserInfoUrl,
        getCalendarview: this.getCalendarviewUrl,

        findMeetingTimes2: this.getCalendarviewUrl2,
    };
    private rooms: any[] = null;
    private myInfo: any = null;
    private context: WebPartContext;
    private httpClient: HttpClient;
    constructor(context: WebPartContext) {
        this.context = context;
        this.httpClient = context.httpClient;
    }

    public static Durations = [
        {
            key: 'PT30M',
            title: '30m',
            time: 30
        },
        {
            key: 'PT1H',
            title: '1h',
            time: 60
        },
        {
            key: 'PT1H30M',
            title: '1h 30m',
            time: 90
        },
        {
            key: 'PT2H',
            title: '2h',
            time: 120
        },
        {
            key: 'PT2H30M',
            title: '2h 30m',
            time: 150
        }
    ];
    public static GetDurationsMarks() {
        let result = {};
        EventsApi.Durations.forEach((element, index) => {
            result[index] = element.title;
        });
        return result;
    }
    public static GetDurationIndexByTime(time: number) {
        let result = -1;
        EventsApi.Durations.forEach((element, index) => {
            if (element.time == time)
                result = index;
        });
        return result;
    }
    public static GetDurationByKey(key: string) {
        let result = null;
        let Durations = EventsApi.Durations.filter(x => x.key == key);
        if (!!Durations && Durations.length)
            result = Durations[0];
        return result;
    }

    public AddEvent(accessToken: string, event: IMeeting): Promise<IRoomItem[]> {
        return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
            let timeZone = 'America/New_York';
            let attendees = this.usersToAttendees(event.attendees);
            attendees.push({
                emailAddress: {
                    address: event.location.key,
                    name: event.location.title
                },
                type: "required"
            });
            let start = moment(event.start).format('YYYY-MM-DDTHH:mm:SS');
            let end = moment(event.start).add(EventsApi.Durations[event.duration].time, 'minutes').format('YYYY-MM-DDTHH:mm:SS');
            let data: IEvent = {
                subject: event.subject,
                body: {
                    contentType: "HTML",
                    content: event.body,
                },
                start: {
                    dateTime: start,
                    timeZone: timeZone
                },
                end: {
                    dateTime: end,
                    timeZone: timeZone
                },
                location: {
                    displayName: event.location.title,
                    LocationEmailAddress: event.location.key
                },
                attendees: attendees
            };
            //console.log(data);
            
            if (event.id) {
                this.editEvent(event, data, accessToken, resolve, reject);
            }
            else {
                this.addEvent(accessToken, data, resolve, reject);
            }

        });
    }

    private editEvent(event: IMeeting, data: IEvent, accessToken: string, resolve: (roms: any) => void, reject: (error: any) => void) {
        let url = `${this.urls.editEvent}${event.originalId}`;
        axios.patch(url, data, {
            headers: {
                'Accept': 'application/json;odata.metadata=none',
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                resolve(response);
            }, _ => {
                reject(_);
            });
    }

    private addEvent(accessToken: string, data: IEvent, resolve: (roms: any) => void, reject: (error: any) => void) {
        this.httpClient.post(this.urls.addEvent, HttpClient.configurations.v1, {
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
                resolve(result);
            }, (error: any): void => {
                reject(error);
            });
    }
    public FindMeetingTimes(accessToken: string, roomsData: any[]) {
        this.FindMeetingTimes2(roomsData).then(x=>{ console.log(x);});
        return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
            Promise.all(roomsData.map((room: any) => { return this.findMeetingTimes(accessToken, room, this.urls.findMeetingTimes(this.context.pageContext.user.email)); }))
                .then((result: any[]) => {
                    resolve(result);
                });

        });
    }
    public FindMeetingTimes2(roomsData: any[]) {
        return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
            this.test().then(t => {
                Promise.all(roomsData.map((data: any) => { return this.findMeetingTimes(t, data, this.urls.findMeetingTimes2(this.context.pageContext.user.email)); }))
                    .then((result: any[]) => {
                        resolve(result);
                    });
            });
        });
    }
    private test(): Promise<string> {
        return new Promise((resolve, reject) => {
            let that = this;
            $.ajax({
                "async": true,
                "crossDomain": true,
                "url": "https://cors-anywhere.herokuapp.com/https://login.windows.net/dc.gov/oauth2/v2.0/token",
                "type": "POST",
                "headers": {
                    "content-type": "application/x-www-form-urlencoded"
                },
                "data": {
                    "grant_type": "client_credentials",
                    "client_id": "e2a27625-d8aa-488b-a9e3-90be0a2e0268",
                    "client_secret": "u1[Vy2GJ!4]tC!nSIBHo%B0]",
                    "scope": "https://graph.microsoft.com/.default"
                },
                success: (response) => {
                    console.log(response);
                    resolve(response.access_token);
                }

            });

        });
    }

    private findMeetingTimes(accessToken: string, room: any, url:string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(url, HttpClient.configurations.v1, {
                headers: {
                    'Accept': 'application/json;odata.metadata=none',
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                    'Prefer': 'outlook.timezone="Eastern Standard Time"'
                },
                body: JSON.stringify(room.data)
            })
                .then((response: HttpClientResponse): Promise<{
                    value: any;
                }> => {
                    return response.json();
                })
                .then((result: {
                    value: any;
                }): void => {
                    resolve({
                        location:room.location,
                        result:result
                    });
                }, (error: any): void => {
                    reject(error);
                });
        });
    }
    public GetDashboardData(accessToken: string, date: moment.Moment): Promise<{ rooms: IRoomItem[], locations: any[], myEvents: IMeeting[] }> {
        return new Promise<any>((resolve, reject): void => {
            var _timestring = this.applyDate(date);
            Promise.all([
                this.getEvents(accessToken, `${this.urls.calendarview}${_timestring}`),
                this.getAllEvents(accessToken, _timestring),
                this.getMyProfile(accessToken)]).then((value) => {
                    let MyEvents: IMeeting[] = value["0"];
                    let rooms: any[] = value["1"].rooms;
                    let locations: any[] = value["1"].locations;
                    let myInfo: any = value["2"];
                    MyEvents.forEach(element => {
                        if (!!element.event && !!element.event.organizer && element.event.organizer.emailAddress &&
                            element.event.organizer.emailAddress.address == myInfo.mail)
                            element.isOwner = true;
                    });
                    rooms.forEach(element => {
                        for (let id = 1; id <= 5; id++) {
                            if (element['day' + id] && element['day' + id].length) {
                                element['day' + id].forEach(event => {
                                    let a = MyEvents.filter(x => x.organizer == event.organizer &&
                                        x.location.title == event.location.title &&
                                        moment(x.start).isSame(moment(event.start)) &&
                                        moment(x.end).isSame(moment(event.end))
                                    );
                                    if (a.length > 0) {
                                        event.originalId = a[0].id;
                                        event.isOwner = a[0].isOwner;
                                    }
                                });
                            }
                        }
                    });
                    resolve({
                        rooms: rooms,
                        locations: locations,
                        myEvents: MyEvents
                    });
                },
                    _ => {
                        reject(_);
                    });
        });
    }
    private getAllEvents(accessToken: string, timestring: string) {
        const getEvents = file => new Promise((resolve, reject) => {
            this.getEvents(accessToken, this.urls.getCalendarview(file.address, timestring))
                .then((upcomingMeetings: IMeeting[]): void => {
                    upcomingMeetings.forEach((element: IMeeting) => {
                        let day = 'day' + element.start.getDay();
                        if (!!file[day])
                            file[day].push(element);
                        else
                            file[day] = [element];
                    });
                    resolve(file);
                }, _ => {
                    reject(_);
                });
        });


        return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
            this.getRooms(accessToken).then(rooms => {
                Promise.all(rooms.map(getEvents))
                    .then((results: any[]) => {
                        let locations = [];
                        results.forEach(x => locations.push({
                            key: x.address,
                            title: x.name
                        }));
                        resolve({
                            rooms: results,
                            locations: locations
                        });
                    });
            }, (error: any): void => {
                reject(error);
            });
        });
    }

    private getRooms(accessToken: string): Promise<IRoomItem[]> {
        return new Promise<any>((resolve, reject): void => {
            if (!!this.rooms) {
                resolve(JSON.parse(JSON.stringify(this.rooms)));
            }
            else {
                this.httpClient.get(this.urls.DHCFRooms, HttpClient.configurations.v1, {
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
                        if (todayMeetings && todayMeetings.value)
                            this.rooms = todayMeetings.value;
                        resolve(JSON.parse(JSON.stringify(this.rooms)));
                    }, (error: any): void => {
                        reject(error);
                    });
            }
        });
    }
    private getMyProfile(accessToken: string): Promise<any> {
        return new Promise<any>((resolve, reject): void => {
            if (!!this.myInfo)
                resolve(this.myInfo);
            else {
                this.httpClient.get(this.urls.myProfile, HttpClient.configurations.v1, {
                    headers: {
                        'Accept': 'application/json;odata.metadata=none',
                        'Authorization': 'Bearer ' + accessToken
                    }
                })
                    .then((response: HttpClientResponse): Promise<{ value: any }> => {
                        return response.json();
                    })
                    .then((result: any): void => {
                        this.myInfo = result;
                        resolve(result);
                    }, (error: any): void => {
                        reject(error);
                    });
            }
        });
    }

    private getEvents(accessToken: string, url: string): Promise<IMeeting[]> {
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
        let thisDate = date.clone();
        let starttime = thisDate.startOf('isoWeek').format('YYYY-MM-DD') + 'T04:00:00.000Z';
        let endtime = thisDate.endOf('isoWeek').format('YYYY-MM-DD') + 'T03:59:59.000Z';
        return `?startdatetime=${starttime}&enddatetime=${endtime}`;
    }
    private getMeeting(event: IEvent): IMeeting {
        let start = new Date(event.start.dateTime + 'Z');
        let end = new Date(event.end.dateTime + 'Z');
        return {
            id: event.id,
            subject: event.subject,
            body: event.body.content,
            start: start,
            end: end,
            webLink: event.webLink,
            isAllDay: event.isAllDay,
            location: {
                key: '',
                title: event.location.displayName
            },
            organizer: `${event.organizer.emailAddress.name} <${event.organizer.emailAddress.address}>`,
            status: event.showAs,
            event: event,
            attendees: this.attendeesToUsers(event.attendees, event.organizer, event.location.displayName),
            duration: this.getDuration(start, end)
        };
    }
    private getDuration(start: Date, end: Date) {
        let time = moment(end).diff(moment(start)) / 60000;
        let duration = EventsApi.GetDurationIndexByTime(time);
        return duration;
    }
    private attendeesToUsers(attendees: IAttendees[], organizer: IAttendees, location: string): IUser[] {
        let result = [];
        let organizerName = !!organizer && !!organizer.emailAddress ? organizer.emailAddress.name : '';
        if (!!attendees && attendees.length) {
            attendees.forEach(element => {
                if (!!element.emailAddress && organizerName != element.emailAddress.name && location != element.emailAddress.name)
                    result.push({
                        primaryText: element.emailAddress.name,
                        Email: element.emailAddress.address
                    });
            });
        }
        return result;
    }
    private usersToAttendees(attendees: IUser[]): IAttendees[] {
        let result = [];
        if (!!attendees && attendees.length) {
            attendees.forEach(element => {
                if (!!element.Email)
                    result.push({
                        emailAddress: {
                            address: element.Email,
                            name: element.primaryText ? element.primaryText : ''
                        },
                        type: "required"
                    });
            });
        }
        return result;
    }
    public GetMeetingInfo(accessToken: string, meeting: any): Promise<any> {
        return Promise.all([
            this.getUserInfo(accessToken, this.geuUser(meeting.organizer)),
            this.getAllattendees(accessToken, meeting.attendees),
        ]).then(result => {
            return {
                meeting: meeting,
                organizer: result[0],
                attendees: result[1]
            };
        });
    }
    private geuUser(value: string) {
        let result: any = {};
        value = value ? value.replace('>', '') : '';
        let split = value.split('<');
        result.Email = split.length > 1 ? split[1].trim() : value.trim();
        result.primaryText = split[0].trim();
        return result;
    }
    private getAllattendees(accessToken: string, attendees: any[]) {
        return new Promise<any>((resolve: (roms: any) => void, reject: (error: any) => void): void => {
            Promise.all(attendees.map((item) => {
                return this.getUserInfo(accessToken, item);
            })).then((result: any[]) => {
                resolve(result);
            });

        });
    }

    private getUserInfo(accessToken: string, user: any): Promise<any> {
        return new Promise<any>((resolve: (meetings: any) => void): void => {
            this.httpClient.get(this.urls.getUserInfo(user.Email), HttpClient.configurations.v1, {
                headers: {
                    'Accept': 'application/json;odata.metadata=none',
                    'Authorization': 'Bearer ' + accessToken
                }
            }).then((response: HttpClientResponse): Promise<{ value: any }> => {
                return response.json();
            }).then((result: any): void => {
                if (result.error) {
                    console.error(result.error);
                    resolve({
                        external: true,
                        mail: user.Email,
                        displayName: user.primaryText
                    });
                }
                else
                    resolve(result);
            }, (error: any): void => {
                console.error(error);
                resolve({
                    external: true,
                    mail: user.Email,
                    displayName: user.primaryText
                });
            });
        });
    }
    public static CheckArray(arr: any) {
        return !!arr && arr.length;
    }
    public static ToDate(date:any) {
        if(!date)
            return null;
        let result = new Date(date);
        if(result.toString()=="Invalid Date")
            return null;
        return result;
    }
}
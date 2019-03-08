import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ValidatorForm, TextFieldValidator, DatePickerValidator } from '../../controls/validator';
import { DayOfWeek } from 'office-ui-fabric-react/lib/Calendar';
import TimePicker from '../TimePickerProps/TimePicker';
import { Dropdown } from 'office-ui-fabric-react';
import { PeoplePicker } from '../PeoplePicker';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IFindMeetingTimesProps } from './IFindMeetingTimesProps';
import { IFindMeetingTimesState, SubmitType } from './IFindMeetingTimesState';
import styles from './FindMeetingTimes.module.scss';
import { EventsApi } from '../../api/events/api';
import Slider from 'rc-slider';
import * as moment from 'moment';
import { FindItem } from './FindItem/FindItem';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IMeeting } from '../CalendarEvent/IMeeting';
import { TimeLine } from './TimeLine/TimeLine'


export class FindMeetingTimes extends React.Component<IFindMeetingTimesProps, IFindMeetingTimesState> {
  private _context: WebPartContext;
  private eventsApi: EventsApi;
  constructor(props: IFindMeetingTimesProps) {
    super(props);
    this._context = props.context;
    this.eventsApi = new EventsApi(props.context);
    this.state = this.getNewState();
  }
  private getNewState() {
    let date = new Date();
    date.setHours(9);
    date.setMinutes(0);
    let startTime = new Date(date.valueOf());
    let endTime = new Date(date.valueOf());
    endTime.setHours(18);
    let launchStartTime = new Date(date.valueOf());
    launchStartTime.setHours(12);
    let launchEndTime = new Date(date.valueOf());
    launchEndTime.setHours(13);
    return {
      attendees: [],
      location: [],
      start: date,
      end: moment(date).add(14, 'days').toDate(),
      duration: 0,
      id: null,
      emptySuggestionsReason: null,
      loading: false,
      findResult: [],
      selectedItem: null,
      startTime: startTime,
      endTime: endTime,
      launchStartTime: launchStartTime,
      launchEndTime: launchEndTime,
      showWorkingHours: false,
      excludeLaunchTime: true,
      showAllResults: false,
      submitType: SubmitType.Find,
      subject: null,
      timeline: []
    };
  }
  private save;
  public componentWillReceiveProps(nextProps: IFindMeetingTimesProps) {
    if (!nextProps.hidden && this.props.hidden) {
      this.setState(this.getNewState());
    }
  }
  /* public componentWillReceiveProps(nextProps: IFindMeetingTimesProps) {
     if (nextProps.locations.length && !this.state.locations.length) {
       let locations = [...nextProps.locations];
       locations.splice(0, 0, { key: "", title: "All Rooms" });
       this.setState({ locations: locations });
     }
 
   }*/
  private test(item: any) {
    this.setState((prevState) => {
      prevState.selectedItem = item;
      return prevState;
    });
  }

  public render(): JSX.Element {
    const hidden: boolean = this.props.hidden;
    const onClose = this.props.onClose;
    this.save = this.props.onSave;
    const loading: JSX.Element = this.state.loading ? <div style={{ margin: '0 auto', width: '7em' }}><div className={styles.spinner}><div className={`${styles.spinnerCircle} ${styles.spinnerNormal}`}></div><div className={styles.spinnerLabel}>Loading...</div></div></div> : <div />;
    const findResult: JSX.Element = EventsApi.CheckArray(this.state.findResult) ? <div className="ms-Grid-row">{
      this.state.findResult.map((item: any, index: number): JSX.Element => {
        return <FindItem
          className={!!this.state.selectedItem && this.state.selectedItem.ID == item.ID ? 'selected' : ''}
          onClick={() => { this.test(item); }}
          item={item}
          hidden={!this.state.showAllResults && index > 5}
        ></FindItem>;
      })
    }</div> : <div />;
    return (
      (<Dialog
        hidden={hidden}
        onDismiss={onClose}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Meeting Assistant',
        }}
        modalProps={{
          className:styles.FindMeetingTimes,
          titleAriaId: 'myLabelId',
          subtitleAriaId: 'mySubTextId',
          isBlocking: false,
          containerClassName: 'ms-dialogMainOverride'
        }}
      >
        <ValidatorForm onSubmit={this.onSubmit} >
          <div className="ms-Grid-row">
            <div className={["ms-Grid-col", "ms-sm6", styles.Location].join(" ")}>
              <TextFieldValidator
                id="subject"
                name='subject'
                label="Title"
                maxLength={80}
                value={this.state.subject}
                onChanged={this.handleChangeSubject()}
                validators={this.state.submitType == SubmitType.Save ? ['required'] : null}
                errorMessages={['this field is required']}
              />
              <Dropdown
                id="location"
                label="Location"
                multiSelect
                onChanged={this.handleChangeValue()}
                options={this.props.locations}
                onRenderTitle={(items: any[]) => this.onRenderTitle(items)}
                onRenderOption={this.onRenderOption}
              />
              <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm6">
                  <DatePickerValidator
                    label="Start Date"
                    name="start"
                    allowTextInput={true}
                    firstDayOfWeek={DayOfWeek.Sunday}
                    value={this.state.start}
                    isMonthPickerVisible={false}
                    onSelectDate={(newDate) =>
                      this.setState(prevState => {
                        prevState.start = newDate;
                      }
                      )}
                    errorMessages={['this field is required']}
                  />
                </div>
                <div className="ms-Grid-col ms-sm6">
                  <DatePickerValidator
                    label="End Date"
                    name="end"
                    allowTextInput={true}
                    firstDayOfWeek={DayOfWeek.Sunday}
                    value={this.state.end}
                    isMonthPickerVisible={false}
                    onSelectDate={(newDate) =>
                      this.setState(prevState => {
                        prevState.end = newDate;
                      }
                      )}
                    errorMessages={['this field is required']}
                  />
                </div>
              </div>
              <div className="ms-Grid-row">
                <div className={["ms-Grid-col", "ms-sm12", styles.margin, styles.pointer].join(" ")} onClick={() => {
                  this.setState(prevState => prevState.showWorkingHours = !prevState.showWorkingHours);
                }}>
                  {this.state.showWorkingHours ? "Hide working hours" : "Show working hours"}
                </div>
              </div>
              {!this.state.showWorkingHours ? null :
                <div>
                  <div className={["ms-Grid-row", styles.margin].join(" ")}>
                    <div className={["ms-Grid-col", "ms-sm1", styles.to].join(" ")}>
                      From
                </div>
                    <div className="ms-Grid-col ms-sm5">
                      <TimePicker
                        label={null}
                        date={this.state.startTime}
                        onChanged={(date) => { this.setState(prevState => prevState.startTime = date); }}>
                      </TimePicker>
                    </div>
                    <div className={["ms-Grid-col", "ms-sm1", styles.to].join(" ")}>
                      To
                </div>
                    <div className="ms-Grid-col ms-sm5">
                      <TimePicker
                        label={null}
                        date={this.state.endTime}
                        onChanged={(date) => { this.setState(prevState => prevState.endTime = date); }}>
                      </TimePicker>
                    </div>
                  </div>
                  <div className={["ms-Grid-row", styles.margin].join(" ")}>
                    <div className="ms-Grid-col ms-sm2">
                      <Toggle
                        checked={this.state.excludeLaunchTime}
                        onChanged={(checked: boolean) => {
                          this.setState({ excludeLaunchTime: !!checked });
                        }}
                      />
                    </div>
                    <div className={["ms-Grid-col", "ms-sm10", styles.excludeLaunchTime].join(" ")}>
                      Exclude launch time
                </div>
                  </div>
                  {!this.state.excludeLaunchTime ? null :
                    <div className="ms-Grid-row">
                      <div className={["ms-Grid-col", "ms-sm1", styles.to].join(" ")}>
                        From
                  </div>
                      <div className="ms-Grid-col ms-sm5">
                        <TimePicker
                          label={null}
                          date={this.state.launchStartTime}
                          onChanged={(date) => { this.setState(prevState => prevState.launchStartTime = date); }}>
                        </TimePicker>
                      </div>
                      <div className={["ms-Grid-col", "ms-sm1", styles.to].join(" ")}>
                        To
                  </div>
                      <div className="ms-Grid-col ms-sm5">
                        <TimePicker
                          label={null}
                          date={this.state.launchEndTime}
                          onChanged={(date) => { this.setState(prevState => prevState.launchEndTime = date); }}>
                        </TimePicker>
                      </div>
                    </div>
                  }


                </div>
              }
            </div>
            <div className="ms-Grid-col ms-sm6">
              <PeoplePicker
                label="Attendees"
                defaultSelectedPeople={this.state.attendees}
                selectPeople={this.onSelectUser}
                itemLimit={30}
                context={this._context}
              />
            </div>
          </div>


          <div className={styles.SliderDiv} >
            <p>Duration</p>
            <div className={styles.Slider}>
              <Slider min={0} max={EventsApi.Durations.length - 1} defaultValue={this.state.duration} onChange={(value) => {
                this.setState(prevState => {
                  prevState.duration = value;
                });
              }} marks={EventsApi.GetDurationsMarks()} step={null} />
            </div>
          </div>
          {loading}
          {findResult}
          {this.state.findResult.length <= 6 ? null :
            <div className="ms-Grid-row">
              <div className={["ms-Grid-col", "ms-sm12", styles.margin, styles.alignRight, styles.pointer].join(" ")} onClick={() => {
                this.setState(prevState => prevState.showAllResults = !prevState.showAllResults);
              }}>
                {this.state.showAllResults ? "Hide Results" : "Show All Results"}
              </div>
            </div>
          }
          {this.state.timeline.length < 1 ? null : <TimeLine data={this.state.timeline}></TimeLine>}
          <DialogFooter>
            {this.state.selectedItem ? <PrimaryButton type="submit" onClick={() => this.setState(prevState => prevState.submitType = SubmitType.Save)} text="Save" /> : null}
            <PrimaryButton type="submit" onClick={() => this.setState(prevState => prevState.submitType = SubmitType.Find)} text="Find" />
            <DefaultButton onClick={onClose} text="Cancel" />
          </DialogFooter>
        </ValidatorForm>

      </Dialog>)
    );
  }

  private handleChangeValue = () => value => {
    this.setState((prevState: IFindMeetingTimesState) => {
      let index = prevState.location.indexOf(value.key);
      if (value.selected && index == -1) {
        prevState.location.push(value.key);
      }
      else if (!value.selected && index != -1) {
        prevState.location.splice(index, 1);
      }
      return prevState;
    }
    );
  }

  public onRenderTitle = (items: any[]): JSX.Element => {
    return <span>{items.length ? items.map((item, index) => { return item.title + (index != items.length - 1 ? ", " : ''); }) : null}</span>;
  }
  public onRenderOption = (category) => {
    return category.title;
  }
  private index = 0;
  private addItem(array: any[], item: any) {
    if (item.confidence == 100) {
      let startTime = moment(EventsApi.ToDate(item.meetingTimeSlot.start.dateTime)).format('MM/DD/YYYY HH:mm');
      let start = moment(startTime);
      let filtered = array.filter(x => x.StartTime == startTime);
      item.ID = this.index;
      if (EventsApi.CheckArray(filtered)) {
        let find = filtered[0];
        find.Items.push(item);
      }
      else {
        array.push({
          ID: this.index,
          Start: start,
          StartTime: startTime,
          Items: [item]
        });
        this.index++;
      }
    }

  }
  private onSubmit = (): void => {
    if (this.state.submitType == SubmitType.Find)
      this._find();
    else
      this._save();
  }
  private _save = (): void => {
    let meeting: IMeeting = {
      start: this.state.selectedItem.Start.toDate(),
      end: this.state.selectedItem.Start.toDate(),
      attendees: this.state.attendees,
      subject: this.state.subject,
      location: this.state.selectedItem.room,
      duration: this.state.duration,
    };
    if (!!this.props.onSave)
      this.props.onSave(meeting);
  }
  private _find = (): void => {
    this.setState((prevState: IFindMeetingTimesState): IFindMeetingTimesState => {
      prevState.loading = true;
      prevState.findResult = [];
      prevState.selectedItem = null;
      return prevState;
    });
    let roomsData = this.getRoomsData();
    this.eventsApi.FindMeetingTimes(this.props.token, roomsData).then(res => {
      this.setState((prevState: IFindMeetingTimesState): IFindMeetingTimesState => {
        prevState.loading = false;
        return prevState;
      });
      let arr = [];
      if (EventsApi.CheckArray(res))
        res.forEach((element) => {
          if (EventsApi.CheckArray(element.result.meetingTimeSuggestions)) {
            element.result.meetingTimeSuggestions.forEach(item => {
              item.key = element.location.key;
              item.title = element.location.title;
              this.addItem(arr, item);
            });
          }
        });
      arr = arr.sort((a, b) => { return a.Start - b.Start; });
      this.setState((prevState: IFindMeetingTimesState): IFindMeetingTimesState => {
        prevState.findResult = arr;        
        return prevState;        
      });
      //console.log(this.state);      
      this.getUsersTimes(this.state.attendees);      
    });
  }

  private getUsersTimes(attendees) {
    let _users = attendees.map(attendee => attendee.Email)
    let request_time: any = {};
    request_time.start = moment().startOf('day').add(8, 'hour').format('YYYY-MM-DD[T]HH:mm:ss[.000Z]')
    request_time.end = moment().startOf('day').add(17, 'hour').format('YYYY-MM-DD[T]HH:mm:ss[.000Z]')
    this.eventsApi.FindUserTimes(this.props.token, _users, request_time).then(res=>{      
      this.setState((prevState: IFindMeetingTimesState): IFindMeetingTimesState => {
        prevState.timeline = res.value;
        return prevState;
      })          
    })
  };

  private getRoomsData() {
    let start = this.getDate('start');
    let end = this.getDate('end');
    let meetingDuration = this.getMeetingDuration();
    let timeslots = this.getTimeslots(start, end);
    let result = [];

    this.props.locations.forEach(element => {
      if (this.state.location.indexOf(element.key) > -1)
        result.push({
          location: element,
          data: this.getNewMeetingTimesData(timeslots, meetingDuration, this.getAttendees(element.key))
        });
    });



    return result;
  }
  private getAttendees(roomAddress: string) {
    let result = [];
    if (!!roomAddress)
      result.push(this.getNewAttendee(roomAddress));
    if (this.state.attendees.length) {
      this.state.attendees.forEach(element => {
        if (!!element.Email)
          result.push(this.getNewAttendee(element.Email));
      });
    }
    return result;
  }
  private getWorkPeriods() {
    let result = [];
    if (this.state.excludeLaunchTime) {
      result.push({
        start: { hour: this.state.startTime.getHours(), minute: this.state.startTime.getMinutes(), second: 0, millisecond: 0 },
        end: { hour: this.state.launchStartTime.getHours(), minute: this.state.launchStartTime.getMinutes(), second: 0, millisecond: 0 }
      });
      result.push({
        start: { hour: this.state.launchEndTime.getHours(), minute: this.state.launchEndTime.getMinutes(), second: 0, millisecond: 0 },
        end: { hour: this.state.endTime.getHours(), minute: this.state.endTime.getMinutes(), second: 0, millisecond: 0 }
      });
    }
    else {
      result.push({
        start: { hour: this.state.startTime.getHours(), minute: this.state.startTime.getMinutes(), second: 0, millisecond: 0 },
        end: { hour: this.state.endTime.getHours(), minute: this.state.endTime.getMinutes(), second: 0, millisecond: 0 }
      });
    }
    return result;
  }

  private getTimeslots(start: moment.Moment, end: moment.Moment) {
    let result = [];
    let daysCount = Math.round(moment(end.diff(start)).toDate().valueOf() / 86400000) + 1;
    for (let id = 0; id < daysCount; id++) {
      let _start = start.clone();
      _start.add(id, 'days');
      let weekday = _start.weekday();
      if (weekday != 6 && weekday != 0) {
        this.getWorkPeriods().forEach(element => {
          this.addTimeSlot(_start, result, element.start, element.end);
        });

      }
    }

    return result;
  }
  private now = moment(new Date());
  private addTimeSlot(start: moment.Moment, result: any[], startTime: moment.MomentSetObject, endTime: moment.MomentSetObject, ) {
    let _start = start.clone();
    _start.set(startTime);
    let _end = _start.clone();
    _end.set(endTime);
    if (this.now > _end)
      return;
    if (this.now > _start)
      _start = this.now.clone();
    result.push({
      "start": {
        "dateTime": _start.format('YYYY-MM-DDTHH:mm:SS'),
        "timeZone": "Eastern Standard Time"
      },
      "end": {
        "dateTime": _end.format('YYYY-MM-DDTHH:mm:SS'),
        "timeZone": "Eastern Standard Time"
      }
    });
  }

  private getNewMeetingTimesData(timeslots: any[], meetingDuration: string, attendees: any[] = [], maxCandidates: number = 6, returnSuggestionReasons: boolean = true) {
    return {
      "attendees": attendees,
      "timeConstraint": {
        "activityDomain": "unrestricted",
        "timeslots": timeslots
      },
      "meetingDuration": meetingDuration,
      "returnSuggestionReasons": returnSuggestionReasons,
      maxCandidates: 6
    };
  }
  private getNewAttendee(address: string, required: boolean = true) {
    return {
      "type": required ? "required" : "optional",
      "emailAddress": {
        "address": address
      }
    };
  }
  private getMeetingDuration() {
    return EventsApi.Durations[this.state.duration].key;
  }
  private getDate(key: string) {
    return moment(this.state[key]);
  }
  private onSelectUser = (user: any[]): void => {
    this.setState(prevState => {
      prevState.attendees = user;
      return {
        ...prevState
      };
    });
  }
  private handleChangeSubject = () => value => {
    this.setState((prevState: IFindMeetingTimesState) =>
      prevState.subject = value
    );
  }
}
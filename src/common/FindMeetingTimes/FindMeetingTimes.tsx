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
import { IFindMeetingTimesState } from './IFindMeetingTimesState';
import styles from './FindMeetingTimes.module.scss';
import { EventsApi } from '../../api/events/api';
import Slider from 'rc-slider';
import * as moment from 'moment';
import { FindItem } from './FindItem/FindItem';

export class FindMeetingTimes extends React.Component<IFindMeetingTimesProps, IFindMeetingTimesState> {
  private _context: WebPartContext;
  private eventsApi: EventsApi;
  constructor(props: IFindMeetingTimesProps) {
    super(props);
    this._context = props.context;
    let lokations = [...props.lokations];
    lokations.splice(0, 0, { key: '', title: 'All Rooms' });
    this.eventsApi = new EventsApi(props.context);
    this.state = {
      attendees: [],
      lokations: lokations,
      location: lokations[0],
      start: null,
      end: null,
      duration: null,
      id: null,
      emptySuggestionsReason: null,
      loading: false,
      findResult: [],
      selectedItem: null,
    };
  }

  private save;
  public componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (!!nextProps.event && nextProps.event.id !== this.state.id) {
      this.setState(prevState => {
        prevState.findResult = [];
        prevState.id = nextProps.event.id;
        prevState.duration = nextProps.event.duration;
        let key = nextProps.event.location.key ? nextProps.event.location.key : "";
        let locations = this.state.lokations.filter(x => x.key == key);
        prevState.location = locations.length ? locations[0] : this.state.lokations[0];
        prevState.attendees = nextProps.event.attendees;
        if (nextProps.event.startDate) {
          prevState.start = nextProps.event.startDate;
          let date = new Date(nextProps.event.startDate);
          date.setHours(18);
          date.setMinutes(0);
          prevState.end = date;
        }
        else {
          let date = new Date();
          date.setHours(9);
          date.setMinutes(0);
          prevState.start = date;
          prevState.end = moment(date).add(14, 'days').toDate();
        }
        return prevState;
      });
    }
  }
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
      this.state.findResult.map((item: any): JSX.Element => {
        return <FindItem className={!!this.state.selectedItem && this.state.selectedItem.ID == item.ID ? 'selected' : ''} onClick={() => { this.test(item); }} item={item}></FindItem>;
      })
    }</div> : <div />;
    return (
      (<Dialog
        hidden={hidden}
        onDismiss={onClose}
        className={styles.FindMeetingTimes}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Meeting Assistant',
        }}
        modalProps={{
          titleAriaId: 'myLabelId',
          subtitleAriaId: 'mySubTextId',
          isBlocking: false,
          containerClassName: 'ms-dialogMainOverride'
        }}
      >
        <ValidatorForm onSubmit={this._find} >
          <PeoplePicker
            label="Attendees"
            defaultSelectedPeople={this.state.attendees}
            selectPeople={this.onSelectUser}
            itemLimit={30}
            context={this._context}
          />
          <Dropdown
            id="location"
            label="Location"
            // multiSelect={true}
            selectedKey={this.state.location.key}
            onChanged={this.handleChangeValue('location')}
            options={this.state.lokations}
            onRenderTitle={(item: any) => <span> {item[0].title}</span>}
            onRenderOption={this.renderCategory}
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
          <DialogFooter>
            {this.state.selectedItem ? <PrimaryButton onClick={() => { this.onSave(); }} text="Save" /> : null}
            <PrimaryButton type="submit" text="Find" />
            <DefaultButton onClick={onClose} text="Cancel" />
          </DialogFooter>
        </ValidatorForm>
      </Dialog>)
    );
  }
  private onSave() {
    console.log(this.state.selectedItem,this.state.selectedItem)
  }
  private handleChangeValue = name => value => {
    //debugger
    this.setState((prevState) =>
      prevState[name] = value
    );
  }

  public renderCategory = (category) => {
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
  private _find = (): void => {
    this.setState((prevState: IFindMeetingTimesState): IFindMeetingTimesState => {
      prevState.loading = true;
      prevState.findResult = [];
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
      console.log(arr);
      this.setState((prevState: IFindMeetingTimesState): IFindMeetingTimesState => {
        prevState.findResult = arr;
        return prevState;
      });
      /*this.setState(prevState => {
        if (!!res.meetingTimeSuggestions && !!res.meetingTimeSuggestions.length) {
          prevState.result = res.meetingTimeSuggestions;
          prevState.emptySuggestionsReason = null;
        }
        else {
          prevState.result = [];
          prevState.emptySuggestionsReason = res.emptySuggestionsReason;
        }
        return prevState;
      });*/
    });
    // this.save({});
  }
  private getRoomsData() {
    let start = this.getDate('start');
    let end = this.getDate('end');
    let meetingDuration = this.getMeetingDuration();
    let timeslots = this.getTimeslots(start, end);
    let result = [];
    if (this.state.location.key)
      result.push({
        location: this.state.location,
        data: this.getNewMeetingTimesData(timeslots, meetingDuration, this.getAttendees(this.state.location.key))
      });
    else {
      this.state.lokations.forEach(element => {
        if (!!element.key)
          result.push({
            location: element,
            data: this.getNewMeetingTimesData(timeslots, meetingDuration, this.getAttendees(element.key))
          });
      });
    }


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
  private getTimeslots(start: moment.Moment, end: moment.Moment) {
    let result = [];
    let daysCount = Math.round(moment(end.diff(start)).toDate().valueOf() / 86400000) + 1;
    for (let id = 0; id < daysCount; id++) {
      let _start = start.clone();
      _start.add(id, 'days');
      let weekday = _start.weekday();
      if (weekday != 6 && weekday != 0) {
        _start.set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
        let _end = _start.clone();
        _end.set({ hour: 18, minute: 0, second: 0, millisecond: 0 });
        console.log(_start.format('YYYY-MM-DDTHH:mm:SS'), _end.format('YYYY-MM-DDTHH:mm:SS'));
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
    }

    return result;
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
}
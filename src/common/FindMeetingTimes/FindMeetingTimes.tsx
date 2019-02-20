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

export class FindMeetingTimes extends React.Component<IFindMeetingTimesProps, IFindMeetingTimesState> {
  _context: WebPartContext;
  eventsApi: EventsApi;
  constructor(props: IFindMeetingTimesProps) {
    super(props);
    this._context = props.context;
    let lokations = [...props.lokations];
    lokations.splice(0, 0, { key: '', title: 'All Rooms' });
    this.eventsApi = new EventsApi(props.context);
    this.state = {
      lokations: lokations,
      location: lokations[0],
      start: null,
      end: null,
      duration: null,
      id: null,
      result: [],
      emptySuggestionsReason: null,
    };
  }

  save;
  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (!!nextProps.event && nextProps.event.id !== this.state.id) {
      console.log(nextProps.event)
      this.setState(prevState => {
        prevState.result = [];
        prevState.id = nextProps.event.id;
        prevState.duration = nextProps.event.duration;
        let key = nextProps.event.location.key ? nextProps.event.location.key : "";
        let locations = this.state.lokations.filter(x => x.key == key);
        prevState.location = locations.length ? locations[0] : this.state.lokations[0];
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
  public render(): JSX.Element {
    const hidden: boolean = this.props.hidden;
    const onClose = this.props.onClose;
    this.save = this.props.onSave;
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
        <ValidatorForm onSubmit={this._saveDialog} >
          <Dropdown
            id="location"
            label="Location"
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
          {!this.state.result.length ? this.state.emptySuggestionsReason : <div>result: {this.state.result.length}</div>}
          <DialogFooter>
            <PrimaryButton type="submit" text="Find" />
            <DefaultButton onClick={onClose} text="Cancel" />
          </DialogFooter>
        </ValidatorForm>
      </Dialog>)
    );
  }
  private handleChangeValue = name => value => {
    this.setState((prevState) =>
      prevState[name] = value
    );
  }

  public renderCategory = (category) => {
    return category.title;
  }

  private _saveDialog = (): void => {
    let roomsData = this.getRoomsData();
    this.eventsApi.FindMeetingTimes(this.props.token, roomsData).then(res => {
      console.log(res);
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
    })
    // this.save({});
  };
  getRoomsData() {
    let start = this.getDate('start');
    let end = this.getDate('end');
    let meetingDuration = this.getMeetingDuration();
    let result = [];
    if (this.state.location.key)
      result.push(this.getNewMeetingTimesData(start, end,meetingDuration, [this.getNewAttendee(this.state.location.key)]));
    else {
      this.state.lokations.forEach(element => {
        if (!!element.key)
          result.push(this.getNewMeetingTimesData(start, end,meetingDuration, [this.getNewAttendee(element.key)]));
      });
    }


    return result;
  }
  
  private getNewMeetingTimesData(start:string,end:string,meetingDuration:string,attendees:any[]=[], maxCandidates:number = 6, returnSuggestionReasons:boolean = true){
    return {
      "attendees": attendees,
      "timeConstraint": {
        "activityDomain": "unrestricted",
        "timeslots": [
          {
            "start": {
              "dateTime": start,
              "timeZone": "Eastern Standard Time"
            },
            "end": {
              "dateTime": end,
              "timeZone": "Eastern Standard Time"
            }
          }
        ]
      },
      "meetingDuration": meetingDuration,
      "returnSuggestionReasons": returnSuggestionReasons,
      maxCandidates: 6
    }
  }
  private getNewAttendee(address:string, required:boolean=true){
    return {
      "type": required ? "required" : "optional",  
      "emailAddress": {
        "address": address
      }
    }
  }
  private getMeetingDuration() {
    return EventsApi.Durations[this.state.duration].key;
  }
  private getDate(key: string) {
    return moment(this.state[key]).format('YYYY-MM-DDThh:mm:ss');
  }
}
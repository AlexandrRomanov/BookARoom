import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ValidatorForm, TextFieldValidator, DatePickerValidator } from '../../controls/validator';
import { DayOfWeek } from 'office-ui-fabric-react/lib/Calendar';
import TimePicker from '../TimePickerProps/TimePicker';
import { Dropdown } from 'office-ui-fabric-react';
import { PeoplePicker } from '../PeoplePicker';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IEditMeetingsState } from './IEditMeetingsState';
import { IEditMeetingProps } from './IEditMeetingProps';
import Slider from 'rc-slider';
import styles from './EditMeeting.module.scss';
import { EventsApi } from '../../api/events/api';
import { FindMeetingTimes } from '../FindMeetingTimes/FindMeetingTimes';

export class EditMeeting extends React.Component<IEditMeetingProps, IEditMeetingsState> {
  _context: WebPartContext;
  constructor(props: IEditMeetingProps, context?: any) {
    super(props);
    this._context = props.context;
    this.state = {
      meeting: !!this.props.meeting ? this.props.meeting : {},
      HiddenFindMeetingTimes: true,
      startTime:null,
      FindMeetingTimesEvent:null,
    };
  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.meeting.id !== this.state.meeting.id) {
      let location = {};
      if (!nextProps.meeting.duration)
        nextProps.meeting.duration = 0;
      if (nextProps.meeting.location) {
        nextProps.lokations.forEach(element => {
          if (element.key == nextProps.meeting.location.key || element.title == nextProps.meeting.location.title)
            location = element;
        });
      }
      nextProps.meeting.location = location;
      if (!!nextProps.meeting.id && nextProps.meeting.id.indexOf("tempId-") === 0)
        nextProps.meeting.id = null;
      this.setState({ meeting: nextProps.meeting });
      if(!!nextProps.meeting.start)
        this.setState({ startTime: nextProps.meeting.id ? nextProps.meeting.start : null });
    }
  }
  save;
  public render(): JSX.Element {
    const hidden: boolean = this.props.hidden;
    const onClose = this.props.onClose;
    this.save = this.props.onSave;
    if (!this.props.meeting.duration)
      this.props.meeting.duration = 0;

    return (
      (<Dialog
        hidden={hidden}
        onDismiss={onClose}
        className={styles.EditMeeting}
        dialogContentProps={{
          type: DialogType.normal,
          title: this.state.meeting.id ? 'Edit Meeting' : 'New Meeting',
        }}
        modalProps={{
          titleAriaId: 'myLabelId',
          subtitleAriaId: 'mySubTextId',
          isBlocking: false,
          containerClassName: 'ms-dialogMainOverride'
        }}
      >
        <div className={styles.Content}>
          <ValidatorForm onSubmit={this._saveDialog} >
            <div className={["ms-Grid-row", styles.Row].join(" ")}>
              <div className="ms-Grid-col ms-sm5">
                <TextFieldValidator
                  id="subject"
                  name='subject'
                  label="Title"
                  maxLength={80}
                  value={this.state.meeting.subject}
                  onChanged={this.handleChangeTitle('subject')}
                  validators={['required']}
                  errorMessages={['this field is required']}
                />
                <Dropdown
                  id="location"
                  label="Location"
                  selectedKey={this.state.meeting.location.key}
                  onChanged={this.handleChangeTitle('location')}
                  options={this.props.lokations}
                  onRenderTitle={(item: any) => <span> {item[0].title}</span>}
                  onRenderOption={this.renderCategory}
                />
                <div className="ms-Grid-row">
                  <div className="ms-Grid-col ms-sm7">
                    <DatePickerValidator
                      label="Start Date"
                      name="start"
                      isRequired={false}
                      allowTextInput={true}
                      firstDayOfWeek={DayOfWeek.Sunday}
                      value={this.state.meeting.start}
                      isMonthPickerVisible={false}
                      onSelectDate={(newDate) =>
                        this.setState(prevState => {
                          prevState.meeting.start = newDate;
                        }
                        )}
                      validators={['required']}
                      errorMessages={['this field is required']}
                    />
                  </div>
                  <div className="ms-Grid-col ms-sm5">
                    {true ?
                      <TimePicker
                        label="Start Time"
                        date={this.state.startTime}
                        onChanged={(date) => { this.setState(prevState => prevState.startTime = date); }}>
                      </TimePicker> : null}
                  </div>
                </div>
                <div className={styles.SliderDiv} >
                  <p>Duration</p>
                  <div className={styles.Slider}>
                    <Slider min={0} max={EventsApi.Durations.length - 1} defaultValue={this.state.meeting.duration} onChange={(value) => {
                      this.setState(prevState => {
                        prevState.meeting.duration = value;
                      });
                    }} marks={EventsApi.GetDurationsMarks()} step={null} />
                  </div>
                </div>
                <div className={styles.SliderDiv}>
                {<a href="#" onClick={() => { this.onTest() }} >{this.state.meeting.location.key ? (this.state.startTime ? 'Check meeting location and time.' : 'Find meeting time.') : (this.state.startTime ? 'Find meeting location.' : 'Find meeting location and time.') }</a>}
                </div>
              </div>
              <div className="ms-Grid-col ms-sm7">
                <PeoplePicker
                  label="Attendees"
                  defaultSelectedPeople={this.state.meeting.attendees}
                  selectPeople={this.onSelectUser}
                  itemLimit={30}
                  context={this._context}
                />
              </div>
            </div>

            <DialogFooter>
              <PrimaryButton type="submit" text="Save" />
              <DefaultButton onClick={onClose} text="Cancel" />
            </DialogFooter>
          </ValidatorForm>
        </div>
        <FindMeetingTimes
          context={this._context}
          onClose={() => { this._closeInfoDialog() }}
          onSave={() => { this._closeInfoDialog() }}
          hidden={this.state.HiddenFindMeetingTimes}
          lokations={this.props.lokations}
          token={this.props.token}
          event={this.state.FindMeetingTimesEvent}>

        </FindMeetingTimes>
      </Dialog>)
    );
  }
  private _closeInfoDialog = (): void => {
    this.setState((prevState: IEditMeetingsState, props: IEditMeetingProps): IEditMeetingsState => {
      prevState.HiddenFindMeetingTimes = true;
      return prevState;
    });
  };
  private onTest() {
    this.setState((prevState: IEditMeetingsState, props: IEditMeetingProps): IEditMeetingsState => {
      prevState.HiddenFindMeetingTimes = false;
      prevState.FindMeetingTimesEvent = {
        location:this.state.meeting.location,
        startDate:this.state.startTime,
        duration:this.state.meeting.duration,
        id:Math.random()
      }
      return prevState;
    });
  }

  private onSelectUser = (user: any[]): void => {
    this.setState(prevState => {
      prevState.meeting.attendees = user
      return {
        ...prevState
      };
    });
  }
  private handleChangeTitle = name => value => {
    //var slugify = require('slugify');
    this.setState((prevState) =>
      prevState.meeting[name] = value// slugify(value, {remove: /[^a-zA-Z0-9\-\. ]/g})
    );
  }
  public renderCategory = (category) => {
    return category.title;
  }
  private handleDate = (meeting: any, name: string) => value => {
    /*
      this.setState(()=>
       meeting[name] = value
      );*/
  }
  private _saveDialog = (): void => {
    let date = this.state.startTime;
    if(!!date){
      this.state.meeting.start.setHours(date.getHours());
      this.state.meeting.start.setMinutes(date.getMinutes());
    }
    this.save(this.state.meeting);
    /*  BookARoom.addEvent(this.state.token, this.props.httpClient, event)
      this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
        prevState.newMeetinng = false;
        return prevState;
      });*/
  };
}
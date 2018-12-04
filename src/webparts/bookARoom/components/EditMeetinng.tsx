import * as React from 'react';
import { IEditMeetingProps } from './IListItemProps';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ValidatorForm, TextFieldValidator, DatePickerValidator } from '../../../controls/validator';
import { DayOfWeek } from 'office-ui-fabric-react/lib/Calendar';
import { IEditMeetingsState } from './IUpcomingMeetingsState';
import TimePicker from './TimePicker';
import { Dropdown } from 'office-ui-fabric-react';

export class EditMeeting extends React.Component<IEditMeetingProps, IEditMeetingsState> {
  constructor(props: IEditMeetingProps, context?: any) {
    super(props);
    this.state = {
      meeting:!!this.props.meeting ? this.props.meeting:{},
    };
  }
  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.meeting.id !== this.state.meeting.id) {
      this.setState({ meeting: nextProps.meeting });
    }
  }
  save;
  public render(): JSX.Element {
    const hidden: boolean = this.props.hidden;
    const onClose = this.props.onClose;
    this.save  = this.props.onSave;
    return (
      (<Dialog
        hidden={hidden}
        onDismiss={ onClose }
        dialogContentProps={{
          type: DialogType.normal,
          title: 'New Meetinng',
        }}
        modalProps={{
          titleAriaId: 'myLabelId',
          subtitleAriaId: 'mySubTextId',
          isBlocking: false,
          containerClassName: 'ms-dialogMainOverride'
        }}
      >
      <ValidatorForm onSubmit={this._saveDialog} >
                        <TextFieldValidator
                            id="Title"
                            name='Title'
                            label="Title"
                            maxLength={ 80 }
                            value={this.state.meeting.Title}
                            onChanged={ this.handleChangeTitle('Title') }
                            validators={['required']}
                            errorMessages={['this field is required']}
                        />
                         <Dropdown
                            id="Location"
                            label="Location"
                            selectedKey={this.state.meeting.Location.key}
                            onChanged={this.handleChangeTitle('Location')} 
                            options={ this.props.lokations }       
                            onRenderTitle={ (item:any) => <span> { item[0].title }</span>}
                            onRenderOption={this.renderCategory}          
                        />
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm7">
                            <DatePickerValidator
                                    label="Start Date"
                                    name="StartDate"
                                    isRequired={ false }
                                    allowTextInput={ true }
                                    firstDayOfWeek={ DayOfWeek.Sunday }
                                    value={this.state.meeting.EventDate}
                                    isMonthPickerVisible={false} 
                                    onSelectDate={(newDate) =>
                                      this.setState(prevState => {
                                        prevState.meeting.EventDate = newDate;
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
                                        date={this.state.meeting.EventDate} 
                                        onChanged={(date)=>{this.setState(prevState => prevState.meeting.EventDate = date);}}>
                                </TimePicker> : null}
                            </div>
                        </div>
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm7">
                            <DatePickerValidator
                                    label="End Date"
                                    name="EndDate"
                                    isRequired={ false }
                                    allowTextInput={ true }
                                    firstDayOfWeek={ DayOfWeek.Sunday }
                                    value={this.state.meeting.EndDate}
                                    isMonthPickerVisible={false} 
                                    onSelectDate={(newDate) =>
                                      this.setState(prevState => {
                                        prevState.meeting.EndDate = newDate;
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
                                        date={this.state.meeting.EndDate} 
                                        onChanged={(date)=>{this.setState(prevState => prevState.meeting.EndDate = date);}}>
                                </TimePicker> : null}
                            </div>
                        </div>
                        <TextField
                            id="Description"
                            label="Description"
                            multiline
                            autoAdjustHeight
                            value={this.state.meeting.Description}
                            onChanged={this.handleChangeTitle('Description')}
                        />
        <DialogFooter>
          <PrimaryButton type="submit" text="Save" />
          <DefaultButton onClick={ onClose } text="Cancel" />
        </DialogFooter>
        </ValidatorForm>
      </Dialog>)
    );
  }
  private handleChangeTitle = name => value => {
    //var slugify = require('slugify');
      this.setState((prevState)=>
      prevState.meeting[name] = value// slugify(value, {remove: /[^a-zA-Z0-9\-\. ]/g})
      );
    }
    public renderCategory =(category) => {
      return category.title;
    }
    private handleDate = (meeting:any, name:string)  => value => {
      /*
        this.setState(()=>
         meeting[name] = value
        );*/
      }
  private _saveDialog = (): void => {
    debugger;
    let event:any={
      "subject": this.state.meeting.test,
      "body": {
        "contentType": "HTML",
        "content": "<div>test</div>"
      },
      "start": {
          "dateTime": "2018-12-12T12:00:00",
          "timeZone": "America/New_York"
      },
      "end": {
          "dateTime": "2018-12-12T14:00:00",
          "timeZone": "America/New_York"
      },
      "location":{
          "displayName":"DHCF - The-Capital-9th-OCFO-938",
          "LocationEmailAddress":"DHCFCapital9thOCFO938@dc.gov"
      },
      "attendees": [
        {
          "emailAddress": {
            "address":"DHCFCapital9thOCFO938@dc.gov",
            "name": "DHCF - The-Capital-9th-OCFO-938"
          },
          "type": "required"
        }
      ]
      
    }
    this.save(event);
  /*  BookARoom.addEvent(this.state.token, this.props.httpClient, event)
    this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      prevState.newMeetinng = false;
      return prevState;
    });*/
  };
}
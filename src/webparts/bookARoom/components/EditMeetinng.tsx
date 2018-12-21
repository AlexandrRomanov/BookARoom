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
import { PeoplePicker } from '../../../common/PeoplePicker';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export class EditMeeting extends React.Component<IEditMeetingProps, IEditMeetingsState> {
  _context:WebPartContext;
  constructor(props: IEditMeetingProps, context?: any) {
    super(props);
    this._context = props.context;
    this.state = {
      meeting:!!this.props.meeting ? this.props.meeting:{},
    };
  }
  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.meeting.id !== this.state.meeting.id) {
      let location = {};
      if(nextProps.meeting.location){
        nextProps.lokations.forEach(element => {
          if(element.title == nextProps.meeting.location.title)
            location = element;
        });
      }
      nextProps.meeting.location = location;
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
          title: this.state.meeting.id? 'Edit Meetinng' : 'New Meetinng',
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
                            id="subject"
                            name='subject'
                            label="Title"
                            maxLength={ 80 }
                            value={this.state.meeting.subject}
                            onChanged={ this.handleChangeTitle('subject') }
                            validators={['required']}
                            errorMessages={['this field is required']}
                        />
                         <Dropdown
                            id="location"
                            label="Location"
                            selectedKey={this.state.meeting.location.key}
                            onChanged={this.handleChangeTitle('location')} 
                            options={ this.props.lokations }       
                            onRenderTitle={ (item:any) => <span> { item[0].title }</span>}
                            onRenderOption={this.renderCategory}          
                        />
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm7">
                            <DatePickerValidator
                                    label="Start Date"
                                    name="start"
                                    isRequired={ false }
                                    allowTextInput={ true }
                                    firstDayOfWeek={ DayOfWeek.Sunday }
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
                                        date={this.state.meeting.start} 
                                        onChanged={(date)=>{this.setState(prevState => prevState.meeting.start = date);}}>
                                </TimePicker> : null}
                            </div>
                        </div>
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm7">
                            <DatePickerValidator
                                    label="End Date"
                                    name="end"
                                    isRequired={ false }
                                    allowTextInput={ true }
                                    firstDayOfWeek={ DayOfWeek.Sunday }
                                    value={this.state.meeting.end}
                                    isMonthPickerVisible={false} 
                                    onSelectDate={(newDate) =>
                                      this.setState(prevState => {
                                        prevState.meeting.end = newDate;
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
                                        date={this.state.meeting.end} 
                                        onChanged={(date)=>{this.setState(prevState => prevState.meeting.end = date);}}>
                                </TimePicker> : null}
                            </div>
                        </div>
                        <PeoplePicker
                            label="Attendees"
                            defaultSelectedPeople={this.state.meeting.attendees}
                            selectPeople={this.onSelectUser}
                            itemLimit={30}
                            context={this._context}
                        />
                       
        <DialogFooter>
          <PrimaryButton type="submit" text="Save" />
          <DefaultButton onClick={ onClose } text="Cancel" />
        </DialogFooter>
        </ValidatorForm>
      </Dialog>)
    );
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
    this.save(this.state.meeting);
  /*  BookARoom.addEvent(this.state.token, this.props.httpClient, event)
    this.setState((prevState: IUpcomingMeetingsState, props: IUpcomingMeetingsProps): IUpcomingMeetingsState => {
      prevState.newMeetinng = false;
      return prevState;
    });*/
  };
}
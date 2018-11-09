import * as React from 'react';
import { IEditMeetingProps } from './IListItemProps';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

export class EditMeeting extends React.Component<IEditMeetingProps, {}> {
  meeting:any = {}
  save;
  public render(): JSX.Element {
    const hidden: boolean = this.props.hidden;
    this.meeting = this.props.meeting;
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
       <div>
         <TextField
          name='test'
          value={ this.meeting.test }
          onChanged={ this.handleChangeTitle }
         />
           
         </div>
        <DialogFooter>
          <PrimaryButton onClick={this._saveDialog} text="Save" />
          <DefaultButton onClick={ onClose } text="Cancel" />
        </DialogFooter>
      </Dialog>)
    );
  }
  private handleChangeTitle = value => {
    //var slugify = require('slugify');
      this.setState(()=>
       this.meeting["test"] = value// slugify(value, {remove: /[^a-zA-Z0-9\-\. ]/g})
      );
    }
  
  private _saveDialog = (): void => {
    debugger;
    let event:any={
      "subject": this.meeting.test,
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
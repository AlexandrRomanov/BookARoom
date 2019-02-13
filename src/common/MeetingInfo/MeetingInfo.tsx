import * as React from 'react';
import { IMeetingInfoProps } from './IMeetingInfoProps';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { IMeetingInfoState } from './IMeetingInfoState';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as moment from 'moment';

import style from './MeetingInfo.module.scss';

export class MeetingInfo extends React.Component<IMeetingInfoProps, IMeetingInfoState> {
  _context:WebPartContext;
  constructor(props: IMeetingInfoProps, context?: any) {
    super(props);
    this._context = props.context;
    this.state = {
      meeting:!!this.props.meeting ? this.props.meeting:{},
    };
  }
  public render(): React.ReactElement<IMeetingInfoProps>  {
    const hidden: boolean = this.props.hidden;
    const onClose = this.props.onClose;
    
    return (
      (<Dialog
        hidden={hidden}
        onDismiss={ onClose }
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Meeting Info'
        }}
        modalProps={{
          titleAriaId: 'myLabelId',
          subtitleAriaId: 'mySubTextId',
          isBlocking: false,
          containerClassName:  ['ms-dialogMainOverride', style.MeetingInfo].join(" ")
        }}
      >
       {this.props.meeting?
        (<div className={style.MeetingInfo}>
            <div className={["ms-Grid-row", style.InfoRow].join(" ")}>
              <div className="ms-Grid-col ms-sm4"><b>Title: </b></div>
              <div className="ms-Grid-col ms-sm8">{this.props.meeting.meeting.subject}</div>    
            </div>
            <div className={["ms-Grid-row", style.InfoRow].join(" ")}>
              <div className="ms-Grid-col ms-sm4"><b>Organizer: </b></div>
              <div className="ms-Grid-col ms-sm8">
                <div>
                  <img className={style.photo} 
                      src={`${this._context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${this.props.meeting.organizer.mail}`}/>
                </div>
                <div>
                  {this.getUserInfo(this.props.meeting.organizer)}
                </div>
              </div>    
            </div>
            <div className={["ms-Grid-row", style.InfoRow].join(" ")}>
              <div className="ms-Grid-col ms-sm4"><b>Attendees: </b></div>
              <div className={["ms-Grid-col","ms-sm8", style.attendees].join(" ")}>
                {this.props.meeting.attendees.map((item: any): JSX.Element => {
                  return  <div>{this.getUserInfo(item)}</div>;
                })}
              </div>    
            </div>
            <div className={["ms-Grid-row", style.InfoRow].join(" ")}>
              <div className="ms-Grid-col ms-sm4"><b>Room: </b></div>
              <div className="ms-Grid-col ms-sm8">{this.props.meeting.meeting.location.title}</div>    
            </div>
            <div className={["ms-Grid-row", style.InfoRow].join(" ")}>
              <div className="ms-Grid-col ms-sm4"><b>Time: </b></div>
              <div className="ms-Grid-col ms-sm8">{moment(this.props.meeting.meeting.start).format('MM/DD/YYYY HH:mm')+" - "+moment(this.props.meeting.meeting.end).format('HH:mm')}</div>    
            </div>
        </div>)
        :null}
      </Dialog>)
    );
  }

  
    public renderCategory =(category) => {
      return category.title;
    }
  
  private getUserInfo(user):JSX.Element{
    let result:JSX.Element = null;
    if(!!user){
      let name = user.displayName;
      if(!!user.surname && !!user.givenName)
        name = user.surname + ' ' + user.givenName;
      result = <span>
        <span>{name}</span>
        {!user.jobTitle?null:<span> - {user.jobTitle}</span>}
      </span>
    }
    return result;
  }
}
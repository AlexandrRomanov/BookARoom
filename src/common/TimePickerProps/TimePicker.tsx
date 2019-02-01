import * as React from 'react';
import * as moment from 'moment';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField, PrimaryButton} from 'office-ui-fabric-react/lib';
import fixStyle from '../../scss/fixForFabricInOldDesign.module.scss';
import { ITimePickerProps } from './ITimePickerProps';
import { ITimePickerState } from './ITimePickerState';




export default class TimePicker extends React.Component<ITimePickerProps, ITimePickerState> {
    constructor(props: ITimePickerProps) {
      super(props);
      this.state = {
        hours: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        minutes: ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'],
        half: ['AM', 'PM'],
        visibleTimePiker: false
      };
     
    }

    public closeTimePicker =(e) => {
        this.setState({visibleTimePiker: !this.state.visibleTimePiker});
    }

    public setHalf = (currentHalf: string, half:string) => {
        if(half && half !== currentHalf){
            let newDate = this.roundMinutes(this.props.date);
            switch(half) {
                case 'AM':
                    newDate = moment(newDate).add(-12, 'hours').toDate();
                    break;
                case 'PM':
                    newDate = moment(newDate).add(12, 'hours').toDate();
                    break;
            }
            this.props.onChanged(newDate);
        }
    }
    public setHour= (currentHalf: string, currentHour: string, hour:string) => {
        if(hour && hour !== currentHour){
            let newDate = this.roundMinutes(this.props.date);
            switch(currentHalf) {
                case 'AM':
                    newDate = parseInt(hour, 10) == 12 ? moment(newDate).hour(0).toDate() : moment(newDate).hour(parseInt(hour, 10)).toDate();
                    break;
                case 'PM':
                    newDate = parseInt(hour, 10) == 12 ? moment(newDate).hour(parseInt(hour, 10)).toDate() : moment(newDate).hour(parseInt(hour, 10)+12).toDate();
                    break;
            }
            this.props.onChanged(newDate);
        }
    }
    public setMinute= (currentMinute:string, minute:string) => {
        if(minute && minute !== currentMinute){
            let newDate = this.roundMinutes(this.props.date);
            newDate = moment(newDate).minute(parseInt(minute, 10)).toDate();
            this.props.onChanged(newDate);
        }
    }
    public roundMinutes(date: Date): Date {
        if(!date)
            return null;
        let coeff = 1000 * 60 * 5;
        let rounded = moment(Math.round(date.getTime() / coeff) * coeff).toDate();
        return rounded;
    }

    public render(): React.ReactElement<ITimePickerProps> {
        let currentTime = moment(this.props.date).format('hh : mm A');
        let currentHalf = moment(this.roundMinutes(this.props.date)).format('A');
        let currentHour = moment(this.roundMinutes(this.props.date)).format('hh');
        let currentMinute = moment(this.roundMinutes(this.props.date)).format('mm');
        return (
            <div>
                <TextField
                    label={this.props.label}
                    value={currentTime}
                    onFocus={this.closeTimePicker}
                    //onBlur={this.closeTimePicker}
                    onClick={this.closeTimePicker}
                    iconProps={ { iconName: 'Clock' } }
                />
                <Dialog
                    dialogContentProps={ {
                        type: DialogType.normal,
                        title: currentTime
                    } }
                    modalProps={ {
                        isBlocking: false,
                        containerClassName: 'ms-dialogMainOverride'
                    } }
                    className={['time-picker', fixStyle.fix].join(" ")}
                    isOpen={this.state.visibleTimePiker}
                    onDismiss={this.closeTimePicker}
                >
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm6">
                            <table>
                                <tr>
                                    {this.state.half.map(half => 
                                        <td colSpan={2}>
                                            <PrimaryButton style={{width: '100%'}} 
                                                className={currentHalf !== half ? 'time-picker-control': ''} 
                                                onClick={() => this.setHalf(currentHalf, half)}>{half}
                                            </PrimaryButton>
                                        </td>)}
                                </tr>
                                <tr>
                                    {this.state.hours.map((hour, index) => index <= 3 ? <td>
                                        <PrimaryButton className={currentHour !== hour ? 'time-picker-control': ''}
                                            onClick={() => this.setHour(currentHalf, currentHour, hour)}>{hour}</PrimaryButton>
                                    </td> : null)}
                                </tr>
                                <tr>
                                    {this.state.hours.map((hour, index) => index > 3 &&  index < 8 ? <td>
                                        <PrimaryButton className={currentHour !== hour ? 'time-picker-control': ''}
                                            onClick={() => this.setHour(currentHalf, currentHour, hour)}
                                            >{hour}
                                        </PrimaryButton>
                                    </td> : null)}
                                </tr>
                                <tr>
                                    {this.state.hours.map((hour, index) => index >= 8 &&  index < 12 ? <td>
                                        <PrimaryButton className={currentHour !== hour ? 'time-picker-control': ''}
                                            onClick={() => this.setHour(currentHalf, currentHour, hour)}
                                            >{hour}
                                        </PrimaryButton>
                                    </td> : null)}
                                </tr>
                            </table>
                        </div>
                        <div className="ms-Grid-col ms-sm6">
                            <table>
                                <tr><td colSpan={4}>Minutes</td></tr>
                                <tr>
                                    {this.state.minutes.map((minute, index) => index <= 3 ? <td>
                                        <PrimaryButton className={currentMinute !== minute ? 'time-picker-control': ''}
                                            onClick={() => this.setMinute(currentMinute, minute)}
                                            >{minute}
                                        </PrimaryButton>
                                    </td> : null)}
                                </tr>
                                <tr>
                                    {this.state.minutes.map((minute, index) => index > 3 &&  index < 8 ? <td>
                                        <PrimaryButton className={currentMinute !== minute ? 'time-picker-control': ''}
                                            onClick={() => this.setMinute(currentMinute, minute)}
                                            >{minute}</PrimaryButton>
                                    </td> : null)}
                                </tr>
                                <tr>
                                    {this.state.minutes.map((minute, index) => index >= 8 &&  index < 12 ? <td>
                                        <PrimaryButton className={currentMinute !== minute ? 'time-picker-control': ''}
                                            onClick={() => this.setMinute(currentMinute, minute)}
                                            >{minute}</PrimaryButton>
                                    </td> : null)}
                                </tr>
                            </table>
                        </div>
                        </div>
                    </div>
                    {/* <SpinButton label="Hour" defaultValue='1'
                        min={ 1 }
                        max={ 12 }
                        step={ 1 }
                    ></SpinButton>
                    <SpinButton label="Minute" defaultValue='0'
                        min={ 0 }
                        max={ 59 }
                        step={ 5 }
                    ></SpinButton> */}
                </Dialog>
            </div>);
    }
}
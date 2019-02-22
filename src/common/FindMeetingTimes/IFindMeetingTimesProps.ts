import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IFindMeetingTimesProps{
    context:WebPartContext;
    hidden:boolean;
    onClose: () => void;
    onSave: (result:any) => void;
    lokations:any[];
    token:any;
    event:any;
}
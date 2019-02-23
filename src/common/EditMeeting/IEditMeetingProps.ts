import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IEditMeetingProps {
    hidden:boolean;
    meeting:any;
    locations:any[];
    onClose: () => void;
    onSave: (meeting:any) => void;
    context:WebPartContext;
    token:any;
}
  
import WebPartContext from "@microsoft/sp-webpart-base/lib/core/WebPartContext";

export interface IMeetingInfoProps {
    hidden:boolean;
    meeting:any;
    onClose: () => void;
    context:WebPartContext;
  }
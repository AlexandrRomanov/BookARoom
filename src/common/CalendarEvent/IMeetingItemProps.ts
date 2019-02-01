import { IMeeting } from "./IMeeting";

export interface IMeetingItemProps {
    item: IMeeting;
    editItem: (meeting:any) => void;
    viewItem: (meeting:any) => void;
  }
import { IMeeting } from "../../../../lib/webparts/bookARoom/components/IMeeting";

export interface IListItem {
    primaryText: string;
    secondaryText?: string;
    tertiaryText?: string;
    metaText?: string;
    isUnread?: boolean;
    isSelectable?: boolean;
  }
  export interface IRoomItem {
    name: string;
    address: string;
    day1: IMeeting[];
    day2: IMeeting[];
    day3: IMeeting[];
    day4: IMeeting[];
    day5: IMeeting[];
  }
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
  }
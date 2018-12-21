import * as React from 'react';
import {  IMeetingItemProps } from './IListItemProps';
import { IMeeting } from './IMeeting';
import * as moment from 'moment';
import { IListItemAction } from './IListItemAction';
import { Link } from 'office-ui-fabric-react';
import styles from './CalendarEvent.module.scss';

export class CalendarEvent extends React.Component<IMeetingItemProps, {}> {
    public render(): JSX.Element {
      const item: IMeeting = this.props.item;
      return (
        <div>
              <div>
                {moment(item.start).format('hh:mm') +' - ' + moment(item.end).format('hh:mm')} 
                {(item.isOwner? 
                  <Link href="#" onClick={() => { if(!!this.props.editItem) this.props.editItem(item); return false; }} 
                  className={["ms-font-m", styles.editLink].join(" ")}><i className="ms-Icon ms-Icon--Edit"></i></Link>:null)}
              </div>
              <div>{item.subject}</div>
            </div>
      );
    }
  }



import * as React from 'react';

import { IMeeting } from './IMeeting';
import * as moment from 'moment';
import { Link } from 'office-ui-fabric-react';
import styles from './CalendarEvent.module.scss';
import { IMeetingItemProps } from './IMeetingItemProps';

export class CalendarEvent extends React.Component<IMeetingItemProps, {}> {
    public render(): React.ReactElement<IMeetingItemProps> {
      const item: IMeeting = this.props.item;
      return (
        <div className={styles.calendarEvent}>
          <div>
            {(<Link href="#" onClick={() => { if(!!this.props.viewItem) this.props.viewItem(item); return false; }} 
              className={["ms-font-m", styles.editLink].join(" ")}>{moment(item.start).format('hh:mm') +' - ' + moment(item.end).format('hh:mm')}</Link>)}
            &nbsp; 
            {(item.isOwner? 
              <Link href="#" onClick={() => { if(!!this.props.editItem) this.props.editItem(item); return false; }} 
            className={["ms-font-m", styles.editLink].join(" ")}><i className="ms-Icon ms-Icon--Edit"></i></Link>:null)}
          </div>
          <div>{item.subject}</div>
        </div>
            
      );
    }
  }



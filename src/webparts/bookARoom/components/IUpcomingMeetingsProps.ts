import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IUpcomingMeetingsProps {
    title: string;
    context: WebPartContext;
    webPartId: string;
}

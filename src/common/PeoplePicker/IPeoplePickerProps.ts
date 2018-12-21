import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IPeoplePickerProps {
    selectPeople: (people: IPersonaProps[]) => void;
    label: string;
    defaultSelectedPeople: any;
    itemLimit?: number;
    context:WebPartContext
}
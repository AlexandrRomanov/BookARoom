import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';

export interface IPeoplePickerState {
    peopleList: IPersonaProps[];
    currentSelectedItems: IPersonaProps[];
    serchText: string;
}
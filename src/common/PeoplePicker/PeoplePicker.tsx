import * as React from 'react';
import {
  BaseComponent,
  assign,
  autobind
} from 'office-ui-fabric-react/lib/Utilities';
import { IPersonaProps, Persona } from 'office-ui-fabric-react/lib/Persona';
import {
  CompactPeoplePicker,
  IBasePickerSuggestionsProps,
  IBasePicker,
  NormalPeoplePicker,
  ValidationState
} from 'office-ui-fabric-react/lib/Pickers';
import { Label } from 'office-ui-fabric-react/lib/Label';

import { IPeoplePickerProps } from './IPeoplePickerProps';
import { IPeoplePickerState } from './IPeoplePickerState';
import { Api } from './api';
import { reject } from 'q';

import style from './PeoplePicker.module.scss';

export interface IPeoplePickerExampleState {
  currentPicker?: number | string;
  delayResults?: boolean;
  peopleList: IPersonaProps[];
  mostRecentlyUsed: IPersonaProps[];
  currentSelectedItems?: IPersonaProps[];
}

const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested People',
  mostRecentlyUsedHeaderText: 'Suggested Contacts',
  noResultsFoundText: 'No results found',
  loadingText: 'Loading',
  showRemoveButtons: false,
  suggestionsAvailableAlertText: 'People Picker Suggestions available',
  suggestionsContainerAriaLabel: 'Suggested contacts'
};

const limitedSearchAdditionalProps: IBasePickerSuggestionsProps = {
  searchForMoreText: 'Load all Results',
  resultsMaximumNumber: 10,
  searchingText: 'Searching...'
};

const limitedSearchSuggestionProps: IBasePickerSuggestionsProps = assign(limitedSearchAdditionalProps, suggestionProps);
export class PeoplePicker extends React.Component<IPeoplePickerProps, IPeoplePickerState> {
  private _picker: IBasePicker<IPersonaProps>;
  private _api;
  constructor(props: IPeoplePickerProps, state: IPeoplePickerState) {
    super(props);
    this._api = new Api(props.context);
    this.state = {
      peopleList: [],
      currentSelectedItems: [],
      serchText: ''
    };
  }

  public render(): React.ReactElement<IPeoplePickerProps> {
    return (
      <div>
        {this.props.label ? <Label>{ this.props.label }</Label> : null}
        { this._renderListPicker() }
      </div>
    );
  }

  private _getTextFromItem(persona: IPersonaProps): string {
    return persona.primaryText as string;
  }
  private _renderListPicker() {
    return (
      <span className={style.PeoplePicker}>
        <CompactPeoplePicker
          onResolveSuggestions={ this._onFilterChanged }
          getTextFromItem={ this._getTextFromItem }
          className={ 'ms-PeoplePicker' }
          pickerSuggestionsProps={ suggestionProps }
          onRemoveSuggestion={ this._onRemoveSuggestion }
          onValidateInput={ this._validateInput }
          onChange={this.props.selectPeople}
          defaultSelectedItems={this.props.defaultSelectedPeople}
          inputProps={ {
            'aria-label': 'People Picker',
            'placeholder': ''//'Enter Project Manager'
          } }
          itemLimit={this.props.itemLimit}
        />
      </span>
    );
  }


  @autobind
  private _onItemsChange(items: any[]) {
    this.setState({
      currentSelectedItems: items
    });
  }

  @autobind
  private _onSetFocusButtonClicked() {
    if (this._picker) {
      this._picker.focusInput();
    }
  }

  @autobind
  private _renderFooterText(): JSX.Element {
    return <div>No additional results</div>;
  }

  @autobind
  private _onRemoveSuggestion(item: IPersonaProps): void {
    let { peopleList } = this.state;
    let indexPeopleList: number = peopleList.indexOf(item);

    if (indexPeopleList >= 0) {
      let newPeople: IPersonaProps[] = peopleList.slice(0, indexPeopleList).concat(peopleList.slice(indexPeopleList + 1));
      this.setState({ peopleList: newPeople });
    }
  }

  @autobind
  private _onFilterChanged(filterText: string, currentPersonas: IPersonaProps[], limitResults?: number): Promise<IPersonaProps[]> {
      return new Promise((resolve) => {
        //if (filterText) {
            this._api.getPeople(filterText).then((people: any[]) => {
                let filteredPersonas = people;
                filteredPersonas = filteredPersonas.map(user => {
                        let newPeople = user;
                        newPeople.primaryText = newPeople.Title;
                        newPeople.secondaryText = newPeople.Email;
                        return newPeople;
                    }
                );
                filteredPersonas = this._removeDuplicates(filteredPersonas, currentPersonas);                
                filteredPersonas = limitResults ? filteredPersonas.splice(0, limitResults) : filteredPersonas;
                resolve(filteredPersonas);     
            });
        
        //}
    });
  }

  @autobind
  private _listContainsPersona(persona: IPersonaProps, personas: IPersonaProps[]) {
    if (!personas || !personas.length || personas.length === 0) {
      return false;
    }
    return personas.filter(item => item.primaryText === persona.primaryText).length > 0;
  }


  private _removeDuplicates(personas: IPersonaProps[], possibleDupes: IPersonaProps[]) {
    return personas.filter(persona => !this._listContainsPersona(persona, possibleDupes));
  }

  @autobind
  private _validateInput(input: string) {
    if (input.indexOf('@') !== -1) {
      return ValidationState.valid;
    } else if (input.length > 1) {
      return ValidationState.warning;
    } else {
      return ValidationState.invalid;
    }
  }

  /**
   * Takes in the picker input and modifies it in whichever way
   * the caller wants, i.e. parsing entries copied from Outlook (sample
   * input: "Aaron Reid <aaron>").
   *
   * @param input The text entered into the picker.
   */
  private _onInputChange(input: string): string {
    const outlookRegEx = /<.*>/g;
    const emailAddress = outlookRegEx.exec(input);

    if (emailAddress && emailAddress[0]) {
      return emailAddress[0].substring(1, emailAddress[0].length - 1);
    }

    return input;
  }
}
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'BookARoomWebPartStrings';
import BookARoom from './components/BookARoom';
import { IBookARoomProps } from './components/IBookARoomProps';
import { IUpcomingMeetingsWebPartProps } from './IUpcomingMeetingsWebPartProps';

export interface IBookARoomWebPartProps {
  description: string;
}

export default class BookARoomWebPart extends BaseClientSideWebPart<IUpcomingMeetingsWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IUpcomingMeetingsWebPartProps> = React.createElement(
      BookARoom,
      {
        httpClient: this.context.httpClient,
        title: this.properties.title,
        webPartId: this.context.instanceId
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

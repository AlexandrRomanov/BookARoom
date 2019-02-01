import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBookARoomProps {
  title: string;
  context: WebPartContext;
  webPartId: string;
}

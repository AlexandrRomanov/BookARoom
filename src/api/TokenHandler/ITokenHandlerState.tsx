export interface ITokenHandlerState {
    expiresTokenDate:Date;
    expires_in:number;
    token:string;
    onChangeToken: (token:string) => void;
  }
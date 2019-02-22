export interface ITokenHandlerState {
    expiresTokenDate:Date;
    expires_in:number;
    token:string;
    token2:string;
    onChangeToken: (token:string) => void;
  }
import * as React from 'react';
import { ITokenHandlerProps } from './ITokenHandlerProps';
import { ITokenHandlerState } from './ITokenHandlerState';

export class TokenHandler extends React.Component<ITokenHandlerProps, ITokenHandlerState> {

    private config = {
        LocalStorage:'BookARoom token local storage value',
        access_token:'#access_token=',
        login_start_url:'https://login.windows.net/dc.gov/oauth2/v2.0/authorize?response_type=token',
        client_id:'3accf488-95f1-488e-bf1b-6c08a6af457d',
        scope:'user.read user.readbasic.all calendars.read calendars.read.shared calendars.ReadWrite.shared calendars.readwrite',
        target:'_blank',
        default_expires_in:3600000, //default value 60 minutes
        expires_in:'expires_in='
    };
  constructor(props: ITokenHandlerProps, context?: any) {
    super(props);

    this.state = {
        token:null,
        expiresTokenDate:null,
        expires_in:null,
        onChangeToken: props.onChangeToken
    };
  }

  public componentDidMount(): void {
    if (window !== window.top) {
      return;
    }
    this.getToken();
  }
  public render(): JSX.Element { return null; }
 
 
  private getToken(){
    let that = this;
    that.refreshToken(that);
    setInterval(function() {  
      that.refreshToken(that);
    }, 60000);
  }

  private refreshToken(that:this){
    if(that.chackExpiredToken(that.state.expiresTokenDate, that.state.expires_in)){
      let localStorage = that.getLocalStorage(that.config.LocalStorage);
      let expiresTokenDate = null;
      if(!!localStorage && !!localStorage.token && !!localStorage.expiresTokenDate && !!localStorage.expires_in)
        expiresTokenDate = new Date(localStorage.expiresTokenDate);
      if(!!localStorage && !that.chackExpiredToken(expiresTokenDate, localStorage.expires_in))
      {
        that.setToken(that, localStorage.token, expiresTokenDate, localStorage.expires_in);
      }
      else{
        let url = `${that.config.login_start_url}&client_id=${encodeURI(that.config.client_id)}&
                    scope=${encodeURI(that.config.scope)}&redirect_uri=${encodeURI(window.location.href)}`;
        let popUp = window.open(url, that.config.target);
        let interval = setInterval(function() {   
          if(!!popUp.location.href && popUp.location.href.indexOf(that.config.access_token)>-1){
            let split =popUp.location.href.split(that.config.access_token)[1].split("&");
            let token = split[0];
            let expires_in = that.config.default_expires_in;
            if(split.length>2 && !!split[2]){
              expires_in = parseInt(split[2].replace(that.config.expires_in,''))*1000;
            }
            let expiresTokenDate = new Date(new Date().valueOf()+expires_in); 
            let storageValue :any = {
              token:token,
              expiresTokenDate:expiresTokenDate,
              expires_in:expires_in
            };
            that.writeToLocalStorage(that.config.LocalStorage, storageValue);
            that.setToken(that, token, expiresTokenDate, expires_in);
            popUp.close();
            clearInterval(interval);
          }
        }, 100);
      }
    }
  }

  private chackExpiredToken(expiresTokenDate: Date, expires_in:number) {
    let expires = expires_in/12;
    return !expiresTokenDate || !!expiresTokenDate && (expiresTokenDate.valueOf() - new Date().valueOf() < expires);
  }

  private setToken(that: this, token: string, expiresTokenDate: Date, expires_in:number) {
    that.setState((prevState: ITokenHandlerState): ITokenHandlerState => {
        prevState.token = token;
        prevState.expiresTokenDate = expiresTokenDate;
        prevState.expires_in = expires_in;
        return prevState;
    });
    that.state.onChangeToken(token);
  }

  writeToLocalStorage(cname: string, value: any) {
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem(cname, JSON.stringify(value));
    }
  }

  getLocalStorage(cname: string) {
    if (typeof (Storage) !== "undefined") {
        if (localStorage.getItem(cname) != null) {
            return JSON.parse(localStorage.getItem(cname));
        } else {
            return null;
        }
    } else {
        return null;
    }
  }
}
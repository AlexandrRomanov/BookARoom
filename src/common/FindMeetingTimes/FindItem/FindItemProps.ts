export interface IFindItemProps{
    item:any;
    className:string;
    onClick: (item:any) => void;
    hidden?:boolean;
}
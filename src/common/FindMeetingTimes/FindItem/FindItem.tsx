import React = require("react");
import { IFindItemProps } from "./FindItemProps";
import { IFindItemState } from "./FindItemState";
import style from "./FindItem.module.scss";
import { Dropdown } from "office-ui-fabric-react/lib";

export class FindItem extends React.Component<IFindItemProps, IFindItemState> {
    constructor(props: IFindItemProps) {
        super(props);
        this.selectRoom(props.item.Items[0]);
        this.state = {
            selectedItem: props.item.Items[0]
        };
    }
    public render(): JSX.Element {
        return this.getTemplate();
    }
    private getTemplate(): JSX.Element {
        if (this.props.hidden)
            return null;
        return <div className={["ms-Grid-col", "ms-sm6", "ms-Grid-row", style.FindItem, this.props.className].join(" ")} onClick={() => { if (!!this.props.onClick) this.props.onClick(this.state.selectedItem); return false; }}>
            <div className={["ms-Grid-col ms-sm8"].join(" ")}>
                <div>{this.props.item.StartTime}</div>
                <div>{this.state.selectedItem.title}</div>
            </div>
            <div className={["ms-Grid-col ms-sm4"].join(" ")}>
                <Dropdown
                    id="location"
                    selectedKey={this.state.selectedItem.key}
                    onChanged={this.onChanged()}
                    options={this.props.item.Items}
                    onRenderTitle={(item: any) => <span>Room</span>}
                    onRenderOption={this.renderDropdown}
                />
            </div>
        </div>;
    }
    private renderDropdown = (item) => {
        return item.title;
    }
    private onChanged = () => value => {
        this.selectRoom(value);
        this.setState((prevState) => {
            prevState.selectedItem = value;
            return prevState;
        });
    }


    private selectRoom(value: any) {
        if (!!this.props.item)
            this.props.item.room = {
                title: value.title,
                key: value.key
            };
    }
}
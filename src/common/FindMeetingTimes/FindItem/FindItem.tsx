import React = require("react");
import { IFindItemProps } from "./FindItemProps";
import { IFindItemState } from "./FindItemState";
import style from "./FindItem.module.scss";
import { Dropdown } from "office-ui-fabric-react/lib";

export class FindItem extends React.Component<IFindItemProps, IFindItemState> {
    constructor(props: IFindItemProps) {
        super(props);
        this.state = {
            selectedItem: props.item.Items[0]
        };
    }
    public render(): JSX.Element {
        return <div className={["ms-Grid-col", "ms-sm6", "ms-Grid-row", style.FindItem, this.props.className].join(" ")} onClick={() => { if (!!this.props.onClick) this.props.onClick(this.state.selectedItem); return false; }}>
            <div className={["ms-Grid-col ms-sm8"].join(" ")}>
                <div>{this.props.item.StartTime}</div>
                <div>{this.state.selectedItem.title}</div>
            </div>
            <div className={["ms-Grid-col ms-sm4"].join(" ")}>
                <Dropdown
                    id="location"
                    selectedKey={this.state.selectedItem.key}
                    onChanged={this.handleChangeValue('selectedItem')}
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
    private handleChangeValue = name => value => {
        this.setState((prevState) => {
            prevState[name] = value;
            return prevState;
        });
    }
}
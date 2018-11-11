import * as React from 'react';
import {ValidatorComponent, IValidatorComponentProps} from './../ValidatorComponent';
import { Dropdown, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';
import { AnimationClassNames } from 'office-ui-fabric-react/lib/Styling';
import styles from './../styles.module.scss';
import componentStyles from './DropdownValidator.module.scss';

export class DropdownValidator extends ValidatorComponent {
    public props:IValidatorComponentProps&IDropdownProps;
    
    public render() {
        const { errorMessages, validators, requiredError, errorText, validatorListener, withRequiredValidator, ...rest } = this.props;
        const { isValid } = this.state;
        const errorMessage = (!isValid && this.getErrorMessage()) || errorText;
        return (
            <div className={ errorMessage ? componentStyles.invalid : null }>
                <Dropdown
                    {...rest}
                    selectedKey={rest.value}
                    required={ validators && validators.indexOf("required") >= 0 }
                    ref={(r) => { this.input = r; }}
                />
                { errorMessage ?
                    <p className={["ms-TextField-errorMessage", "custom", AnimationClassNames.slideDownIn20, styles.errorMessage].join(" ")}>{ errorMessage }</p>
                : null }
            </div>
        );
    }
}
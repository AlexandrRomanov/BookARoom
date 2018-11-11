import * as React from 'react';
import {ValidatorComponent, IValidatorComponentProps} from './../ValidatorComponent';
import { DatePicker, IDatePickerProps } from 'office-ui-fabric-react/lib/DatePicker';
import { AnimationClassNames } from 'office-ui-fabric-react/lib/Styling';
import styles from './../styles.module.scss';
import componentStyles from './DatePickerValidator.module.scss';

export class DatePickerValidator extends ValidatorComponent {
    public props:IValidatorComponentProps&IDatePickerProps;
    
    public render() {
        const { errorMessages, validators, requiredError, errorText, validatorListener, withRequiredValidator, ...rest } = this.props;
        const { isValid } = this.state;
        const errorMessage = (!isValid && this.getErrorMessage()) || errorText;
        return (
            <div className={ [styles.removeDefaultError, errorMessage && componentStyles.invalid].join(" ") }>
                <DatePicker
                    {...rest}
                    isRequired={ validators && validators.indexOf("required") >= 0}
                    ref={(r) => { this.input = r; }}
                />
                { errorMessage ?
                    <p className={["ms-TextField-errorMessage", "custom", AnimationClassNames.slideDownIn20, styles.errorMessage].join(" ")}>{ errorMessage }</p>
                : null }
            </div>
        );
    }
}
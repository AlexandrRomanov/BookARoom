import * as React from 'react';
import {ValidatorComponent, IValidatorComponentProps} from './../ValidatorComponent';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { AnimationClassNames } from 'office-ui-fabric-react/lib/Styling';
import styles from './../styles.module.scss';
import componentStyles from './TextFieldValidator.module.scss';

export class TextFieldValidator extends ValidatorComponent {
    public props:IValidatorComponentProps&ITextFieldProps;
    
    public render() {
        const { errorMessages, validators, requiredError, errorText, validatorListener, withRequiredValidator, ...rest } = this.props;
        const { isValid } = this.state;
        const errorMessage = (!isValid && this.getErrorMessage()) || errorText;
        return (
            <div className={ errorMessage ? componentStyles.invalid : null }>
                <TextField
                    {...rest}
                    required={ validators && validators.indexOf("required") >= 0 }
                    ref={(r) => { this.input = r; }}
                />
                { errorMessage ?
                    <p className={["ms-TextField-errorMessage", AnimationClassNames.slideDownIn20, styles.errorMessage].join(" ")}>{ errorMessage }</p>
                : null }
            </div>
        );
    }
}
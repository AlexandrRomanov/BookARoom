/* eslint-disable */
import * as React from 'react';
import PropTypes from 'prop-types';
/* eslint-enable */
import { ValidatorForm } from './ValidatorForm';
import { debounce } from './utils';


export interface IValidatorComponentProps {
    errorMessages?: PropTypes.array | PropTypes.string;
    validators?: PropTypes.array;
    name?: PropTypes.string;
    value?: PropTypes.any;
    validatorListener?: PropTypes.func;
    withRequiredValidator?: PropTypes.bool;
    requiredError?:any;
    errorText?:any;
}

export interface IValidatorComponentState {
    isValid:boolean;
    errorMessages:any;
    validators:any;
}

export class ValidatorComponent extends React.Component<IValidatorComponentProps, IValidatorComponentState> {
    public invalid:Array<any>;
    public form:any;
    public instantValidate:boolean;
    public debounceTime:any;
    public validateDebounced:any;
    public input:any;
    private static defaultProps = {
        errorMessages: 'error',
        validators: [],
        withRequiredValidator:true,
        validatorListener: () => {},
    };

    private static contextTypes = {
        form: React.PropTypes.object
    };

    constructor(props) {
        super(props);

        this.invalid = [];

        this.form = new ValidatorForm();

        this.state = {
            isValid: true,
            errorMessages: props.errorMessages,
            validators: props.validators,
        };

        this.validate = this.validate.bind(this);
        this.getErrorMessage = this.getErrorMessage.bind(this);
        this.makeInvalid = this.makeInvalid.bind(this);
        this.instantValidate = true;
        this.configure = this.configure.bind(this);
    }

    public componentWillMount() {
        this.configure();
    }

    public componentWillReceiveProps(nextProps) {
        if (this.instantValidate && nextProps.value !== this.props.value) {
            this.validateDebounced(nextProps.value, nextProps.withRequiredValidator);
        }
        if (nextProps.validators && nextProps.errorMessages &&
            (this.props.validators !== nextProps.validators || this.props.errorMessages !== nextProps.errorMessages)) {
            this.setState({ validators: nextProps.validators, errorMessages: nextProps.errorMessages });
        }
    }

    public shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState || this.props !== nextProps;
    }

    public componentWillUnmount() {
        this.context.form.detachFromForm(this);
    }

    public getErrorMessage() {
        const type = typeof this.state.errorMessages;

        if (type === 'string') {
            return this.state.errorMessages;
        } else if (type === 'object') {
            if (this.invalid.length > 0) {
                return this.state.errorMessages[this.invalid[0]];
            }
        }
        // eslint-disable-next-line
        console.log('unknown errorMessages type', this.state.errorMessages);
        return true;
    }

    private configure() {
        if (!this.props.name) {
            throw new Error('Form field requires a name property when used');
        }
        this.context.form.attachToForm(this);
        this.instantValidate = this.context.form.instantValidate;
        this.debounceTime = this.context.form.debounceTime;
        this.validateDebounced = debounce(this.validate, this.debounceTime);
    }

    private validate(value, includeRequired) {
        this.invalid = [];
        const result = [];
        let valid = true;
        if(this.context.form.isSubmit()){
            this.state.validators.map((validator, i) => {
                const obj = {};
                obj[i] = this.form.getValidator(validator, value, includeRequired);
                return result.push(obj);
            });
        }
        result.map(item =>
            Object.keys(item).map((key) => {
                if (!item[key]) {
                    valid = false;
                    this.invalid.push(key);
                }
                return key;
            }),
        );


        this.setState({ isValid: valid }, () => {
            this.props.validatorListener(this.state.isValid);
        });
    }

    private isValid() {
        return this.state.isValid;
    }

    private makeInvalid() {
        this.setState({ isValid: false });
    }
}

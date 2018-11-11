/* eslint-disable */
import * as React from 'react';
import PropTypes from 'prop-types';
/* eslint-enable */
import { validations as Rules} from './ValidationRules';



export interface IValidatorFormProps {
    onSubmit?: PropTypes.func.isRequired;
    instantValidate?: PropTypes.bool;
    children?: PropTypes.node;
    onError?: PropTypes.func;
    debounceTime?: PropTypes.number;
}

export class ValidatorForm extends React.Component<IValidatorFormProps, {}> {
    private childs:Array<any>;
    private instantValidate:any;
    private debounceTime:any;
    private errors:any;
    private _isSubmit:boolean;

    private static defaultProps = {
        onError: () => {},
        debounceTime: 0,
    };
    private static childContextTypes = {
        form: React.PropTypes.object
    };

    constructor(props = {}) {
        super(props);

        this.submit = this.submit.bind(this);
        this.walk = this.walk.bind(this);
        this.attachToForm = this.attachToForm.bind(this);
        this.detachFromForm = this.detachFromForm.bind(this);
        this.isSubmit = this.isSubmit.bind(this);
        this.childs = [];
        this._isSubmit = false;
    }

    public getChildContext() {
        return {
            form: {
                attachToForm: this.attachToForm,
                detachFromForm: this.detachFromForm,
                instantValidate: this.instantValidate,
                debounceTime: this.debounceTime,
                isSubmit: this.isSubmit
            },
        };
    }

    public componentWillMount() {
        this.childs = [];
        this.errors = [];
        this.instantValidate = this.props.instantValidate !== undefined ? this.props.instantValidate : true;
        this.debounceTime = this.props.debounceTime;
    }

    private isSubmit():boolean{
        return this._isSubmit;
    }

    private getValidator(validator, value, includeRequired) {
        let result = true;
        let name = validator;
        if (name !== 'required' || includeRequired) {
            let extra;
            const splitIdx = validator.indexOf(':');
            if (splitIdx !== -1) {
                name = validator.substring(0, splitIdx);
                extra = validator.substring(splitIdx + 1);
            }
            result = Rules[name](value, extra);
        }
        return result;
    }

    private attachToForm(component) {
        if (this.childs.indexOf(component) === -1) {
            this.childs.push(component);
        }
    }

    private detachFromForm(component) {
        const componentPos = this.childs.indexOf(component);
        if (componentPos !== -1) {
            this.childs = this.childs.slice(0, componentPos)
                .concat(this.childs.slice(componentPos + 1));
        }
    }

    private submit(event) {
        if (event) {
            event.preventDefault();
        }
        this._isSubmit = true;
        this.errors = [];
        const result = this.walk(this.childs);
        if (this.errors.length) {
            for(let i=0; i<this.childs.length; i++){
                const child = this.childs[i];
                if(child.invalid.length){
                    child.input.focus();
                    break;
                }
            }
            this.props.onError(this.errors);
        }
        if (result) {
            this.props.onSubmit(event);
        }
        return false;
    }

    private walk(children) {
        const self = this;
        let result = true;
        if (Array.isArray(children)) {
            children.forEach((input) => {
                if (!self.checkInput(input)) {
                    result = false;
                }
                return input;
            });
        } else {
            result = self.walk([children]);
        }
        return result;
    }

    private checkInput(input) {
        let result = true;
        const validators = input.props.validators;
        if (validators && !this.validate(input, true)) {
            result = false;
        }
        return result;
    }

    private validate(input, includeRequired) {
        const value = input.props.value;
        const validators = input.props.validators;
        const result = [];
        let valid = true;
        let validateResult = false;
        const component = this.find(this.childs, c => c.props.name === input.props.name);
        validators.map((validator) => {
            validateResult = this.getValidator(validator, value, includeRequired);
            result.push({ input, result: validateResult });
            component.validate(component.props.value, true);
            return validator;
        });
        result.map((item) => {
            if (!item.result) {
                valid = false;
                this.errors.push(item.input);
            }
            return item;
        });
        return valid;
    }

    private find(collection, fn) {
        for (let i = 0, l = collection.length; i < l; i++) {
            const item = collection[i];
            if (fn(item)) {
                return item;
            }
        }
        return null;
    }

    private resetValidations() {
        this.childs.map(child => child.setState({ isValid: true }));
    }
    private addValidationRule = (name, callback) => {
        Rules[name] = callback;
    }

    public render() {
        // eslint-disable-next-line
        const { onSubmit, instantValidate, onError, debounceTime, ...rest } = this.props;
        return (
            <form {...rest} noValidate onSubmit={this.submit}>
                {this.props.children}
            </form>
        );
    }
}
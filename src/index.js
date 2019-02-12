// @flow
import React, {useState} from 'react';
import type {ComponentType} from 'react';

type IntlMessageDescriptor = {
  id: string,
  defaultMessage: string,
  description: ?string,
};

type IntlMessage = {
  descriptor: IntlMessageDescriptor,
  values: ?{},
};

type FormElement = {
  type: string,
  Component: ComponentType<{value: any, error: string, onChange: any => void}>,
};

type Label = string | IntlMessage;
type ErrorMessage = string | IntlMessage;

type ValidationRule = {
  fn: (
    value: string,
    message: IntlMessage,
    args: {},
    state: {},
    _props: {},
    fieldName: string,
    validationArgs: {},
  ) => string,
  message: ?ErrorMessage,
  args: ?{},
  validateAnotherField: ?string,
};

type SelectValue = string | {value: string | number, label: string} | null;

type SchemaValue =
  | string
  | number
  | boolean
  | Array<string>
  | SelectValue
  | void;

type FieldMetadata = {
  name: string,
  defaultValue: SchemaValue,
  formElement: FormElement,
  label: ?Label,
  label2: ?Label,
  validationRules: ?Array<ValidationRule>,
  useSecondLabel: ?boolean,
  disabled: ?boolean,
  isVisible: ?boolean,
};

type Schema = {[string]: FieldMetadata};

// type InputType =
//   | 'TEXT_INPUT'
//   | 'SELECT_INPUT'
//   | 'MULTISELECT'
//   | 'CHECKBOX'
//   | 'RADIOGROUP';
//   | 'TEXT_AREA

type SetSchemaStateArgs = {
  fullFieldName: string,
  newValue: SchemaValue,
  skipValidation: boolean,
  onComplete: Function,
};

export const InputTypes = {
  TEXT: 'TEXT_INPUT',
  SELECT: 'SELECT_INPUT',
  MULTISELECT: 'MULTISELECT',
  CHECKBOX: 'CHECKBOX',
  RADIOGROUP: 'RADIOGROUP',
  TEXTAREA: 'TEXT_AREA',
  DATEPICKER: "DATEPICKER"
};

export default function useForm(
  schema: Schema,
  schemaValues: {[string]: any} = {}
) {
  let [formState, setFormState] = useState(() =>
    initFormData(schema, schemaValues)
  );

  function handleChange({event, fieldName, onComplete}) {
    const fieldState = formState[fieldName];
    const newValue = fieldState.handleInputValueChange(event);
    let changedFiledState = {
      ...fieldState,
      value: newValue,
    };

    changedFiledState.error = validateField(changedFiledState, formState);
    const newFormState = {...formState, [fieldName]: changedFiledState};
    setFormState(newFormState);
    checkIfFieldValidateAnotherField(fieldState, newFormState, setFormState);
    onComplete && onComplete(newValue);
  }

  function setSchemaStateValue({
    fullFieldName,
    newValue,
    skipValidation = false,
    onComplete,
  }: SetSchemaStateArgs) {
    if (!fullFieldName)
      throw new Error('setSchemaStateValue: fullFieldName param required');

    setFormState(prevState => {
      const fieldState = prevState[fullFieldName];
      let changedFiledState = {
        ...fieldState,
        value: newValue,
      };
      if (!skipValidation) {
        changedFiledState.error = validateField(changedFiledState, formState);
      }
      const newFormState = {...formState, [fullFieldName]: changedFiledState};
      if (!skipValidation) {
        checkIfFieldValidateAnotherField(
          fieldState,
          newFormState,
          setFormState
        );
      }

      return {...prevState, [fullFieldName]: changedFiledState};
    });
    onComplete && onComplete(newValue);
  }

  function validate() {
    let isValid = true;
    Object.keys(formState).forEach(fieldName => {
      const field = formState[fieldName];

      if (!field.validationRules) return;

      const fieldError = validateField(field, formState);

      if (isValid && fieldError !== '') {
        isValid = false;
      }

      setFormState(prevFormState => {
        return {
          ...prevFormState,
          [fieldName]: {...field, error: fieldError},
        };
      });
    });
    return isValid;
  }

  function prepareForServer() {
    let prepared = {};
    Object.keys(formState).forEach(fieldName => {
      const {value} = formState[fieldName];
      if (value === undefined || value === null || value === '') {
        prepared[fieldName] = null;
      } else {
        if (
          value &&
          typeof value === 'object' &&
          value.hasOwnProperty('value')
        ) {
          // select
          prepared[fieldName] = value.value;
        } else if(Array.isArray(value)){
          prepared[fieldName] = value.map(item =>
            item && typeof item === 'object' ? item.value : item
          );
        }
        else if (typeof value === 'string') {
          // text input
          prepared[fieldName] = value;
        } else {
          prepared[fieldName] = value;
        }
      }
    });
    return prepared;
  }

  function cloneStateValues() {
    let cloneValues = {};
    Object.keys(formState).forEach(fieldName => {
      const {value} = formState[fieldName];
      cloneValues[fieldName] = value;
    });
    return cloneValues;
  }

  function getSchemaStateValue(fieldName: string) {
    if (!fieldName)
      throw new Error('getSchemaStateValue: fieldName param required');
    return formState[fieldName].value;
  }

  let formData = {};
  Object.keys(schema).forEach(fieldName => {
    const {formElement, name, label, label2} = schema[fieldName];
    formData[fieldName] = {
      render: ({
        useSecondLabel,
        isVisible,
        disabled,
        ...additionalProps
      } = {}) => {
        if (
          typeof isVisible === 'boolean' &&
          isVisible !== formState[fieldName].isVisible
        ) {
          setFormState({
            ...formState,
            [fieldName]: {
              ...formState[fieldName],
              isVisible: isVisible,
              error: '',
            },
          });
        }
        
        return (
          formState[fieldName].isVisible && (
            <formElement.Component
              value={formState[fieldName].value}
              name={name}
              error={formState[fieldName].error}
              disabled={disabled}
              label={useSecondLabel ? label2 : label}
              {...additionalProps}
              onChange={event => {
                handleChange({
                  event,
                  fieldName,
                  onComplete: additionalProps.onChange,
                });
              }}
            />
          )
        );
      },
    };
  });

  return {
    formData,
    validate,
    prepareForServer,
    cloneStateValues,
    getSchemaStateValue,
    setSchemaStateValue,
  };
}

function initFormData(schema, schemaValues) {
  let formData = {};

  Object.keys(schema).forEach(fieldName => {
    let {
      defaultValue,
      formElement,
      validationRules = [],
      isVisible = true,
      disabled = false,
      useSecondLabel = false,
    } = schema[fieldName];
    formData[fieldName] = {
      value: getInitValue({
        initValue: schemaValues[fieldName],
        defaultValue,
        type: formElement.type,
      }),
      handleInputValueChange: ValueResolvers[formElement.type],
      error: '',
      validationRules,
      isVisible,
      disabled,
      useSecondLabel,
    };
  });

  return formData;
}

/**
 * init/defaultValue expected to be either undefined or boolean!
 *
 * @param initValue
 * @param defaultValue
 * @param type
 * @return {*}
 */
function getInitValue({initValue, defaultValue, type}) {
  if (type === InputTypes.CHECKBOX) {
    if (typeof initValue === 'boolean') return initValue;
    if (initValue !== undefined) {
      throw new Error(
        `Checkbox initialization failed. Invalid initValue (${JSON.stringify(
          initValue
        )})`
      );
    }

    if (typeof defaultValue === 'boolean') return defaultValue;
    if (defaultValue !== undefined) {
      throw new Error(
        `Checkbox initialization failed. Invalid defaultValue (${JSON.stringify(
          defaultValue
        )})`
      );
    }

    return false;
  }

  return initValue == null
    ? defaultValue === undefined
      ? ''
      : defaultValue
    : initValue;
}

function validateField(fieldState, formState) {
  for (let rule of fieldState.validationRules) {
    if (rule.validateAnotherField) return '';
    if (rule.args && rule.args.dependencyFieldName) {
      rule.args.dependencyFieldValue =
        formState[rule.args.dependencyFieldName].value;
    }
    let error = rule.fn(
      fieldState.value,
      rule.message,
      rule.args,
    );
    if (error) return error;
  }
  return '';
}

function checkIfFieldValidateAnotherField(
  fieldState,
  newFormState,
  setFormState
) {
  for (let rule of fieldState.validationRules) {
    if (rule.validateAnotherField) {
      const anotherFieldName = rule.validateAnotherField;
      const error = validateField(newFormState[anotherFieldName], newFormState);
      setFormState({
        ...newFormState,
        [anotherFieldName]: {...newFormState[anotherFieldName], error: error},
      });
    }
  }
}

const ValueResolvers = {
  [InputTypes.TEXT]: event => event.target.value,
  [InputTypes.SELECT]: event => event,
  [InputTypes.MULTISELECT]: event => event,
  [InputTypes.CHECKBOX]: event => event.target.checked,
  [InputTypes.RADIOGROUP]: event => event.target.checked,
  [InputTypes.TEXTAREA]: event => event.target.value,
  [InputTypes.DATEPICKER]: event => event.currentTarget.value,
};

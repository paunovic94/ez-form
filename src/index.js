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
    validationArgs: {}
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
  | void
  | {};

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

type ValuesMap = {[string]: SchemaValue};

type SetSchemaStateValueBulkArgs = {
  valuesMap: ValuesMap,
  skipValidation: boolean,
  onComplete: Function,
};

export function getIn(path: string | Array<string>, obj: {} = {}) {
  if (!path || path.length === 0) {
    throw new Error('getIn: path param is required');
  }

  if (typeof path === 'string') {
    path = path.split('.');
  }

  let res = obj;
  for (let key of path) {
    if (res == null) return;
    res = res[key];
  }
  return res;
}

/**
 * Trims off leading & trailing spaces
 *
 * @param {string} value
 * @return {*}
 */
export function trim(value: string) {
  if (typeof value === 'string') {
    value = value.replace(/^\s+/, '').replace(/\s+$/, '');
  }
  return value;
}

export const InputTypes = {
  TEXT: 'TEXT_INPUT',
  SELECT: 'SELECT_INPUT',
  MULTISELECT: 'MULTISELECT',
  CHECKBOX: 'CHECKBOX',
  RADIOGROUP: 'RADIOGROUP',
  TEXTAREA: 'TEXT_AREA',
  DATEPICKER: 'DATEPICKER',
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

      if (skipValidation) {
        changedFiledState.error = '';
      } else {
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

  function setSchemaStateValueBulk({
    valuesMap,
    skipValidation = false,
    onComplete,
  }: SetSchemaStateValueBulkArgs) {
    if (!valuesMap)
      throw new Error('setSchemaStateValueBulk: valuesMap param required');
    if (typeof valuesMap !== 'object')
      throw new Error('setSchemaStateValueBulk: invalid valuesMap');

    Object.entries(valuesMap).forEach(([key, value]) => {
      if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean' &&
        typeof value !== 'object'
      ) {
        throw new Error('setSchemaStateValueBulk: invalid value in valuesMap');
      }

      return setSchemaStateValue({
        fullFieldName: key,
        newValue: value,
        skipValidation,
        onComplete,
      });
    });
  }

  function validate(dependencyArgs: {}) {
    let isValid = true;
    Object.keys(formState).forEach(fieldName => {
      const field = formState[fieldName];

      if (!field.validationRules || field.validationRules.length === 0) return;

      const fieldError = validateField(field, formState, dependencyArgs);

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
        } else if (Array.isArray(value)) {
          prepared[fieldName] = value.map(item =>
            item && typeof item === 'object' ? item.value : item
          );
        } else if (typeof value === 'string') {
          // text input, text area
          prepared[fieldName] = trim(value);
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

        const checked =
          formElement.type === InputTypes.CHECKBOX
            ? formState[fieldName].value
            : undefined;

        return (
          formState[fieldName].isVisible && (
            <formElement.Component
              value={formState[fieldName].value}
              name={name}
              error={formState[fieldName].error}
              disabled={disabled}
              label={useSecondLabel ? label2 : label}
              checked={checked}
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
    setSchemaStateValueBulk,
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

function validateField(fieldState, formState, dependencyArgs = {}) {
  let fieldError = '';

  if (fieldState) {
    // we don't validate field which is not visible!
    if (!fieldState.isVisible) {
      return '';
    }

    for (let rule of fieldState.validationRules) {
      if (rule.validateAnotherField) return '';

      // Validation with dependency
      let dependencyField = rule.args && rule.args.dependencyField;
      let dependencyValue = rule.args && rule.args.dependencyValue;
      let dependencyInValidationArgs =
        rule.args && rule.args.dependencyInValidationArgs;

      // Skip to next rule
      if (dependencyInValidationArgs) {
      // if dependency value is defined in validation fn args and it is different than dependency value in state
        if (dependencyArgs[dependencyField] !== dependencyValue) {
          continue;
        }
      } else if (
        // if dependency value is defined in args but different than dependency value in state
        dependencyField &&
        dependencyValue !== undefined &&
        getIn('value', formState[dependencyField]) !== dependencyValue
      ) {
        continue;
      } else if (
        // if dependency value is not defined in args and different than dependency value in state doesn't exist
        dependencyField &&
        dependencyValue === undefined &&
        !getIn('value', formState[dependencyField])
      ) {
        continue;
      }

      let errorMessage = rule.fn(
        fieldState.value,
        rule.message,
        rule.args,
        formState
      );

      if (errorMessage) {
        // break on the first error
        fieldError = errorMessage;
        break;
      }
    }
  }
  return fieldError;
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
  [InputTypes.RADIOGROUP]: event => event.target.value,
  [InputTypes.TEXTAREA]: event => event.target.value,
  [InputTypes.DATEPICKER]: event => event.currentTarget.value,
};

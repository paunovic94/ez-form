import React, { useState } from 'react';
import type { ComponentType } from 'react';

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
  Component: ComponentType<{ value: any, error: string, onChange: any => void }>,
};

type Label = string | IntlMessage;
type ErrorMessage = string | IntlMessage;

type ValidationRule = {
  fn: ({
    value: string,
    message: IntlMessage,
    args: {},
    fieldName: string,
    state: {},
    validationArgs: {},
  }) => string,
  message: ?ErrorMessage,
  args: ?{},
  validateAnotherField: ?string,
};

type FieldMetadata = {
  defaultValue: string | number | boolean | Array<string> | void,
  formElement: FormElement,
  label: ?Label,
  label2: ?Label,
  validationRules: ?Array<ValidationRule>,
};

type Schema = { [string]: FieldMetadata };

export const InputTypes = {
  TEXT: 'TEXT_INPUT',
  SELECT: 'SELECT_INPUT',
  MULTISELECT: "MULTISELECT",
  CHECKBOX: "CHECKBOX"
};

export default function useForm(schema: Schema, schemaValues = {}) {
  let [formState, setFormState] = useState(() => initFormData(schema, schemaValues));

  function handleChange({ event, fieldName, onComplete }) {
    const fieldState = formState[fieldName];
    const newValue = fieldState.handleInputValueChange(event);
    let changedFiledState = {
      ...fieldState,
      value: newValue,
    };

    changedFiledState.error = validateField(changedFiledState, formState);
    const newFormState = { ...formState, [fieldName]: changedFiledState };
    setFormState(newFormState);
    checkIfFieldValidateAnotherField(fieldState, newFormState, setFormState);
    onComplete && onComplete(newValue);
  }

  function validate() {
    let isValid = true;
    Object.keys(formState).forEach(fieldName => {
      const field = formState[fieldName];

      if (!field.validationRules) return;

      const fieldError = validateField(field, formState);

      if (isValid && (fieldError !== '')) {
        isValid = false;
      }

      const newFormSchema = { ...formState, [fieldName]: {...field, error: fieldError} };
      setFormState(newFormSchema);
    });
    return isValid;
  }

  function prepareForServer() {
    let prepared = {};
    Object.keys(formState).forEach(fieldName => {
      const { value } = formState[fieldName];

      if (value === undefined || value === null || value === '') {
        prepared[fieldName] = null;
      } else {
        if (value && typeof value === 'object' && value.hasOwnProperty('value')) {
          // select
          prepared[fieldName] = value.value;
        } else if (typeof value === 'string') {
          // text input
          prepared[fieldName] = value;
        } else {
          prepared[fieldName] = value;
        }
      }
    });
    return prepared;
  }

  let formData = {};
  Object.keys(schema).forEach(fieldName => {
    const { formElement, name, label, label2 } = schema[fieldName];
    formData[fieldName] = {
      render: ({ useSecondLabel, isVisible, disabled, ...additionalProps } = {}) => {
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

  return { formData, validate, prepareForServer };
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
      value: schemaValues[fieldName]
        ? schemaValues[fieldName]
        : defaultValue === undefined
          ? ''
          : defaultValue,
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

function validateField(fieldState, formState) {
  for (let rule of fieldState.validationRules) {
    if (rule.validateAnotherField) return '';
    if (rule.args && rule.args.dependencyFieldName) {
      rule.args.dependencyFieldValue =
        formState[rule.args.dependencyFieldName].value;
    }
    let error = rule.fn({
      value: fieldState.value,
      args: rule.args,
      message: rule.message,
    });
    if (error) return error;
  }
  return '';
}

function checkIfFieldValidateAnotherField(fieldState, newFormState, setFormState) {
  for (let rule of fieldState.validationRules) {
    if (rule.validateAnotherField) {
      const anotherFieldName = rule.validateAnotherField;
      const error = validateField(newFormState[anotherFieldName], newFormState);
      setFormState({
        ...newFormState,
        [anotherFieldName]: { ...newFormState[anotherFieldName], error: error },
      });
    }
  }
}

const ValueResolvers = {
  [InputTypes.TEXT]: event => event.target.value,
  [InputTypes.SELECT]: event => event,
  [InputTypes.MULTISELECT]: event => {
    return event},
  [InputTypes.CHECKBOX]: event => event,
};

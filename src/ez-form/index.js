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
};

export default function useForm(schema: Schema) {
  let [formState, setFormState] = useState(() => initFormData(schema));

  function handleChange({ event, fieldName }) {
    const fieldState = formState[fieldName];
    const newValue = fieldState.handleInputValueChange(event);
    let changedFiledState = {
      ...fieldState,
      value: newValue,
    };

    changedFiledState.error = validateField(changedFiledState);
    const newFormState = { ...formState, [fieldName]: changedFiledState };
    setFormState(newFormState);
    checkIfFieldValidateAnotherField(fieldState, newFormState, setFormState);
  }

  let formData = {};
  Object.keys(schema).forEach(fieldName => {
    const { formElement, name } = schema[fieldName];
    formData[fieldName] = {
      render: additionalProps => (
        <formElement.Component
          value={formState[fieldName].value}
          name={name}
          error={formState[fieldName].error}
          {...additionalProps}
          onChange={event => {
            handleChange({
              event,
              fieldName,
            });
          }}
        />
      ),
    };
  });

  return formData;
}

function initFormData(schema) {
  let formData = {};

  Object.keys(schema).forEach(fieldName => {
    let { defaultValue, formElement, validationRules = [] } = schema[fieldName];

    formData[fieldName] = {
      value: defaultValue === undefined ? '' : defaultValue,
      handleInputValueChange: ValueResolvers[formElement.type],
      error: '',
      validationRules,
    };
  });

  return formData;
}

function validateField(fieldState) {
  for (let rule of fieldState.validationRules) {
    if (rule.validateAnotherField) return;
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
      const error = validateField(newFormState[anotherFieldName]);
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
};

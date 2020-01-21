// @flow
import React, {useReducer} from 'react';
import {addDynamicItem} from './dynamicSchema';
import type {
  Schema,
  SetSchemaStateArgs,
  SetSchemaStateValueBulkArgs,
} from './types';
import {getIn, trim} from './utils';
import {initFormState, reducer} from './reducer';

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
  const [formState, dispatch] = useReducer(
    reducer,
    {schema, schemaValues},
    initFormState
  );

  function handleChange({event, fieldName, subFieldName, index, onComplete}) {
    dispatch({
      type: 'VALUE_CHANGE',
      payload: {
        event,
        fieldName,
        subFieldName,
        index,
        onComplete,
      },
    });
  }

  function getSchemaStateValue(fieldName: string) {
    if (!fieldName)
      throw new Error('getSchemaStateValue: fieldName param required');
    return formState[fieldName].value;
  }

  function setSchemaStateValue({
    fullFieldName,
    newValue,
    skipValidation = false,
    onComplete,
  }: SetSchemaStateArgs) {
    if (!fullFieldName) {
      throw new Error('setSchemaStateValue: fullFieldName param required');
    }

    dispatch({
      type: 'SET_FIELD_VALUE',
      payload: {fullFieldName, newValue, skipValidation},
    });
    onComplete && onComplete(newValue);
  }

  function setSchemaStateValueBulk({
    valuesMap,
    skipValidation = false,
    onComplete,
  }: SetSchemaStateValueBulkArgs) {
    if (!valuesMap) {
      throw new Error('setSchemaStateValueBulk: valuesMap param required');
    }

    if (typeof valuesMap !== 'object') {
      throw new Error('setSchemaStateValueBulk: invalid valuesMap');
    }

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

  /**
   * We can't completely move this logic to reducer because isValid result is
   * needed immediately.
   *
   * @param dependencyArgs
   * @return {boolean}
   */
  function validate(dependencyArgs: {}) {
    let isValid = true;
    let errors = [];

    Object.keys(formState).forEach(fieldName => {
      const field = formState[fieldName];

      if (!field.validationRules || field.validationRules.length === 0) return;

      const fieldError = validateField(field, formState, dependencyArgs);

      if (isValid && fieldError !== '') {
        isValid = false;
      }

      errors.push({fieldName, fieldError});
    });

    dispatch({type: 'VALIDATION_ERRORS', payload: {errors}});

    return isValid;
  }

  let formData = {};
  Object.keys(schema).forEach(fieldName => {
    const schemaFieldData = schema[fieldName];
    if (schemaFieldData.dynamicSchema) {
      formData[fieldName] = formState[fieldName].value.map(
        (dynamicItemState, index) => {
          let dynamicFieldRenders = {};

          Object.entries(schemaFieldData.dynamicSchemaItem).forEach(
            ([subFieldName, subFieldSchemaData]) => {
              dynamicFieldRenders[subFieldName] = createFieldRender({
                fieldState: dynamicItemState[subFieldName],
                fieldSchemaData: subFieldSchemaData,
                dispatch,
                fieldName,
                index,
                subFieldName,
                handleChange,
              });

              // const {formElement, name, label, label2} = subFieldSchemaData;
              //   {
              //   render: ({
              //     useSecondLabel,
              //     isVisible,
              //     disabled,
              //     ...additionalProps
              //   } = {}) => {
              //     if (
              //       typeof isVisible === 'boolean' &&
              //       isVisible !== dynamicItemState.isVisible
              //     ) {
              //       dispatch({
              //         type: 'FIELD_VISIBILITY_CHANGED',
              //         payload: {
              //           fieldName,
              //           index,
              //           subFieldName,
              //           isVisible,
              //         },
              //       });
              //     }
              //
              //     const checked =
              //       formElement.type === InputTypes.CHECKBOX
              //         ? dynamicItemState.value
              //         : undefined;
              //
              //     return (
              //       dynamicItemState.isVisible && (
              //         <formElement.Component
              //           value={dynamicItemState.value}
              //           name={name || `${fieldName}_${subFieldName}`}
              //           error={dynamicItemState.error}
              //           disabled={disabled}
              //           label={useSecondLabel ? label2 : label}
              //           checked={checked}
              //           {...additionalProps}
              //           onChange={event => {
              //             handleChange({
              //               event,
              //               fieldName,
              //               index,
              //               subFieldName,
              //               onComplete: additionalProps.onChange,
              //             });
              //           }}
              //         />
              //       )
              //     );
              //   },
              // };
            }
          );

          return dynamicFieldRenders;
        }
      );
      return;
    }

    formData[fieldName] = createFieldRender({
      fieldState: formState[fieldName],
      fieldSchemaData: schemaFieldData,
      dispatch,
      fieldName,
      handleChange,
    });
  });

  return {
    formData,
    validate,
    prepareForServer: () => prepareForServer(formState),
    cloneStateValues: () => cloneStateValues(formState),
    getSchemaStateValue,
    setSchemaStateValue,
    setSchemaStateValueBulk,
    addDynamicItem: ({dynamicFieldName, initData}) => {
      dispatch({
        type: 'ADD_DYNAMIC_ITEM',
        payload: {
          fieldName: dynamicFieldName,
          fieldSchemaData: schema[dynamicFieldName],
          initData,
        },
      });
    },
  };
}

function createFieldRender({
  fieldState,
  fieldSchemaData,
  dispatch,
  fieldName,
  index,
  subFieldName,
  handleChange,
}) {
  const {formElement, name, label, label2} = fieldSchemaData;

  return {
    render: ({
      useSecondLabel,
      isVisible,
      disabled,
      ...additionalProps
    } = {}) => {
      if (
        typeof isVisible === 'boolean' &&
        isVisible !== fieldState.isVisible
      ) {
        dispatch({
          type: 'FIELD_VISIBILITY_CHANGED',
          payload: {
            fieldName,
            index,
            subFieldName,
            isVisible,
          },
        });
      }

      const checked =
        formElement.type === InputTypes.CHECKBOX ? fieldState.value : undefined;

      return (
        fieldState.isVisible && (
          <formElement.Component
            value={fieldState.value}
            name={
              name || (subFieldName ? `${fieldName}_${subFieldName}` : fieldName)
            }
            error={fieldState.error}
            disabled={disabled}
            label={useSecondLabel ? label2 : label}
            checked={checked}
            {...additionalProps}
            onChange={event =>
              handleChange({
                event,
                fieldName,
                subFieldName,
                index,
                onComplete: additionalProps.onChange,
              })
            }
          />
        )
      );
    },
  };
}

/**
 * init/defaultValue expected to be either undefined or boolean!
 *
 * @param initValue
 * @param defaultValue
 * @param type
 * @return {*}
 */
export function getInitValue({initValue, defaultValue, type}) {
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

export function validateField(fieldState, formState, dependencyArgs = {}) {
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

      let dependencyValueInFormState =
        getIn('value.value', formState[dependencyField]) ||
        getIn('value', formState[dependencyField]);

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
        dependencyValueInFormState !== dependencyValue
      ) {
        continue;
      } else if (
        // if dependency value is not defined in args and different than dependency value in state doesn't exist
        dependencyField &&
        dependencyValue === undefined &&
        !dependencyValueInFormState
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

function prepareForServer(formState) {
  let prepared = {};
  Object.keys(formState).forEach(fieldName => {
    const {value} = formState[fieldName];
    if (value === undefined || value === null || value === '') {
      prepared[fieldName] = null;
    } else {
      if (value && typeof value === 'object' && value.hasOwnProperty('value')) {
        // select
        prepared[fieldName] = value.value;
      } else if (Array.isArray(value)) {
        prepared[fieldName] = value.map(
          item => (item && typeof item === 'object' ? item.value : item)
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

function cloneStateValues(formState) {
  let cloneValues = {};
  Object.keys(formState).forEach(fieldName => {
    const {value} = formState[fieldName];
    cloneValues[fieldName] = value;
  });
  return cloneValues;
}

export const ValueResolvers = {
  [InputTypes.TEXT]: event => event.target.value,
  [InputTypes.SELECT]: event => event,
  [InputTypes.MULTISELECT]: event => event,
  [InputTypes.CHECKBOX]: event => event.target.checked,
  [InputTypes.RADIOGROUP]: event => event.target.value,
  [InputTypes.TEXTAREA]: event => event.currentTarget.value,
  [InputTypes.DATEPICKER]: event => event.currentTarget.value,
};

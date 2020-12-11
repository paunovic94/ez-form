// @flow
import React, {useReducer} from 'react';
import type {
  Action,
  AddDynamicItemArgs,
  FieldState,
  FormState,
  InitValuesMap,
  InputType,
  MultiSelectValue,
  RemoveDynamicItemArgs,
  Schema,
  SelectValue,
  SetSchemaStateArgs,
  SetSchemaStateValueBulkArgs,
  StandardFieldMetadata,
  StandardFieldState,
  SubFormState,
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

export default function useForm(schema: Schema, schemaValues: ?InitValuesMap) {
  const [formState, dispatch] = useReducer<any, any, any>(
    reducer,
    {schema, schemaValues},
    initFormState
  );

  function handleChange({
    newValue,
    fieldName,
    subFieldName,
    index,
    onComplete,
  }) {
    subFieldName
      ? dispatch({
          type: 'VALUE_CHANGE_DYNAMIC',
          payload: {
            newValue,
            fieldName,
            subFieldName,
            index,
            onComplete,
          },
        })
      : dispatch({
          type: 'VALUE_CHANGE_STANDARD',
          payload: {
            newValue,
            fieldName,
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
      type: 'VALUE_CHANGE_STANDARD',
      payload: {fieldName: fullFieldName, newValue, skipValidation, onComplete},
    });
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
  function validate(dependencyArgs: any) {
    let {isValid, errors} = validateState({
      formState,
      dependencyArgs,
      dynamicFieldName: undefined,
      index: undefined,
    });

    // find dynamic schema items
    Object.keys(formState).forEach(fieldName => {
      const fieldState = formState[fieldName];

      if (fieldState.isDynamic) {
        fieldState.value.forEach((subFormState, index) => {
          let {isValid: subFormIsValid, errors: subFormErrors} = validateState({
            formState: subFormState,
            index,
            dynamicFieldName: fieldName,
            dependencyArgs,
          });
          errors.push(...subFormErrors);
          if (isValid && subFormIsValid === false) {
            isValid = false;
          }
        });
      }
    });

    dispatch({type: 'VALIDATION_ERRORS', payload: {errors}});

    return isValid;
  }

  function validateState({
    formState,
    dynamicFieldName,
    index,
    dependencyArgs,
  }: {
    formState: FormState,
    dynamicFieldName: ?string,
    index: ?number,
    dependencyArgs: ?{[string]: any},
  }) {
    let isValid = true;
    let errors = [];

    Object.keys(formState).forEach(fieldName => {
      const fieldState = formState[fieldName];

      if (
        !fieldState.validationRules ||
        fieldState.validationRules.length === 0
      ) {
        return;
      }

      const fieldError = validateField(
        fieldState,
        formState,
        dependencyArgs || {}
      );

      if (isValid && fieldError !== '') {
        isValid = false;
      }

      if (dynamicFieldName) {
        errors.push({
          fieldName: dynamicFieldName,
          index,
          subFieldName: fieldName,
          fieldError,
        });
      } else {
        errors.push({fieldName, fieldError});
      }
    });

    return {errors, isValid};
  }

  let formData = {};
  Object.keys(schema).forEach(fieldName => {
    const schemaFieldData = schema[fieldName];
    if (schemaFieldData.dynamicSchemaItem) {
      formData[fieldName] = formState[fieldName].value.map(
        (dynamicItemState, index) => {
          let dynamicFieldRenders = {};

          Object.keys(schemaFieldData.dynamicSchemaItem).forEach(
            subFieldName => {
              let subFieldSchemaData =
                schemaFieldData.dynamicSchemaItem[subFieldName];
              dynamicFieldRenders[subFieldName] = createFieldRender({
                fieldState: dynamicItemState[subFieldName],
                fieldSchemaData: subFieldSchemaData,
                dispatch,
                fieldName,
                index,
                subFieldName,
                handleChange,
              });
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
      index: undefined,
      subFieldName: undefined,
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
    addDynamicItem: ({dynamicFieldName, initData}: AddDynamicItemArgs) => {
      dispatch({
        type: 'ADD_DYNAMIC_ITEM',
        payload: {
          fieldName: dynamicFieldName,
          fieldSchemaData: schema[dynamicFieldName],
          initData,
        },
      });
    },
    removeDynamicItem: ({dynamicFieldName, index}: RemoveDynamicItemArgs) => {
      dispatch({
        type: 'REMOVE_DYNAMIC_ITEM',
        payload: {
          fieldName: dynamicFieldName,
          index,
        },
      });
    },
  };
}

type CreateFieldRenderArgs = {
  fieldState: FieldState,
  fieldSchemaData: StandardFieldMetadata,
  dispatch: Action => void,
  fieldName: string,
  index: ?number,
  subFieldName: ?string,
  handleChange: ({
    newValue: any,
    fieldName: string,
    subFieldName: ?string,
    index: ?number,
    onComplete: ?(any) => void,
  }) => void,
};

function createFieldRender({
  fieldState,
  fieldSchemaData,
  dispatch,
  fieldName,
  index,
  subFieldName,
  handleChange,
}: CreateFieldRenderArgs) {
  const {formElement, label, label2, labelAsPlaceholder = true} = fieldSchemaData;

  return {
    render: ({
      useSecondLabel,
      isVisible,
      disabled,
      value: valueFromAdditionalProps,
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
        formElement.type === InputTypes.CHECKBOX
          ? valueFromAdditionalProps ?? fieldState.value
          : undefined;

      return (
        fieldState.isVisible && (
          <formElement.Component
            {...additionalProps}
            value={valueFromAdditionalProps ?? fieldState.value}
            name={
              subFieldName && typeof index === 'number'
                ? `${fieldName}_${subFieldName}_${index}`
                : fieldName
            }
            error={fieldState.error}
            disabled={disabled}
            label={useSecondLabel ? label2 : label}
            labelAsPlaceholder={labelAsPlaceholder}
            checked={checked}
            onChange={event =>
              handleChange({
                newValue: ValueResolvers[formElement.type](event),
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

type GetInitValueArgs = {
  initValue: any,
  defaultValue: any,
  type: InputType,
};

export function getInitValue({
  initValue,
  defaultValue,
  type,
}: GetInitValueArgs) {
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

export function validateField(
  fieldState: StandardFieldState,
  formState: FormState | SubFormState,
  dependencyArgs: {[string]: any}
): string {
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

      // required to satisfy flow types!
      let dependancyFieldState = dependencyField
        ? formState[dependencyField]
        : undefined;
      if (dependancyFieldState && dependancyFieldState.isDynamic) {
        throw new Error('validateField: dynamic field set as dependency');
      }

      let dependencyValueInFormState = dependencyField
        ? getIn('value.value', dependancyFieldState) ||
          getIn('value', dependancyFieldState)
        : undefined;

      // Skip to next rule
      if (dependencyInValidationArgs) {
        // if dependency value is defined in validation fn args and it is different than dependency value in state
        if (
          dependencyField &&
          dependencyArgs[dependencyField] !== dependencyValue
        ) {
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
    const {value, isDynamic} = formState[fieldName];
    if (isDynamic) {
      prepared[fieldName] = value.map(subFormState =>
        prepareForServer(subFormState)
      );
    } else if (value === undefined || value === null || value === '') {
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

/**
 * clone is very similar to prepareForServer. The only difference is that it doesn't
 * transform values at all, i.e. select/multiselect, trimming, etc
 * @param formState
 * @return {{}}
 */
function cloneStateValues(formState) {
  let cloneValues = {};
  Object.keys(formState).forEach(fieldName => {
    const {value, isDynamic} = formState[fieldName];
    cloneValues[fieldName] = isDynamic
      ? value.map(subFormState => cloneStateValues(subFormState))
      : value;
  });
  return cloneValues;
}

export const ValueResolvers = {
  [InputTypes.TEXT]: (event: SyntheticEvent<HTMLInputElement>) =>
    event.currentTarget.value,
  [InputTypes.SELECT]: (event: SelectValue) => event,
  [InputTypes.MULTISELECT]: (event: MultiSelectValue) => event,
  [InputTypes.CHECKBOX]: (event: SyntheticEvent<HTMLInputElement>) =>
    event.currentTarget.checked,
  [InputTypes.RADIOGROUP]: (event: SyntheticEvent<HTMLInputElement>) =>
    event.currentTarget.value,
  [InputTypes.TEXTAREA]: (event: SyntheticEvent<HTMLInputElement>) =>
    event.currentTarget.value,
  [InputTypes.DATEPICKER]: (event: SyntheticEvent<HTMLInputElement>) =>
    event.currentTarget.value,
};

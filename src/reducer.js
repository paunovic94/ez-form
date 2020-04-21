// @flow

import {getInitValue, validateField} from './index';
import type {
  Action,
  FieldState,
  FormState,
  ReducerInitArgs,
  StandardFieldMetadata,
  StandardFieldState,
  SubFormState,
} from './types';

export function initFormState({
  schema,
  schemaValues = {},
}: ReducerInitArgs): FormState {
  let formState = {};

  Object.keys(schema).forEach(fieldName => {
    let schemaFieldData = schema[fieldName];

    if (schemaFieldData.dynamicSchemaItem) {
      let dynamicFieldState = (formState[fieldName] = {
        isDynamic: true,
        value: [],
      });

      if (schemaValues[fieldName]) {
        schemaValues[fieldName].forEach(initData => {
          let newItemData = {};

          Object.keys(schemaFieldData.dynamicSchemaItem).forEach(
            subFieldName => {
              let subFieldSchemaData =
                schemaFieldData.dynamicSchemaItem[subFieldName];
              newItemData[subFieldName] = createFieldState({
                fieldSchemaData: subFieldSchemaData,
                initValue: initData[subFieldName],
              });
            }
          );

          dynamicFieldState.value.push(newItemData);
        });
      }
    } else {
      formState[fieldName] = createFieldState({
        fieldSchemaData: schemaFieldData,
        initValue: schemaValues[fieldName],
      });
    }
  });

  return formState;
}

type CreateFieldStateArgs = {
  fieldSchemaData: StandardFieldMetadata,
  initValue: any,
};

function createFieldState({fieldSchemaData, initValue}: CreateFieldStateArgs) {
  let {
    defaultValue,
    formElement,
    validationRules = [],
    isVisible = true,
  } = fieldSchemaData;

  return {
    value: getInitValue({
      initValue,
      defaultValue,
      type: formElement.type,
    }),
    error: '',
    validationRules,
    isVisible,
  };
}

/**
 *
 * @param fieldState
 * @param newFormOrSubFormState - it's either a "full" formState when checking standard field
 *   or it's a subFormState if checking dynamic one
 * @return {{[p: string]: StandardFieldState}}
 */
function checkIfFieldValidateAnotherField(
  fieldState: StandardFieldState,
  newFormOrSubFormState: FormState | SubFormState
): {[string]: StandardFieldState} {
  let ret = {};

  for (let rule of fieldState.validationRules) {
    if (rule.validateAnotherField) {
      const anotherFieldName = rule.validateAnotherField;
      const anotherFieldState = newFormOrSubFormState[anotherFieldName];

      if (anotherFieldState.isDynamic) {
        throw new Error(
          'checkIfFieldValidateAnotherField: another field is dynamic.'
        );
      }

      const error = validateField(anotherFieldState, newFormOrSubFormState, {});

      ret[anotherFieldName] = {
        ...newFormOrSubFormState[anotherFieldName],
        error: error,
      };
      // newFormOrSubFormState = {
      //   ...newFormOrSubFormState,
      //   [anotherFieldName]: {
      //     ...newFormOrSubFormState[anotherFieldName],
      //     error: error,
      //   },
      // };
    }
  }

  return ret;
  // return newFormOrSubFormState;
}

export function reducer(formState: FormState, action: Action): FormState {
  switch (action.type) {
    case 'VALUE_CHANGE_STANDARD': {
      const {newValue, fieldName, onComplete, skipValidation} = action.payload;

      const fieldState = formState[fieldName];
      // check if field name exists in schema and do nothing if not!!!
      if (!fieldState) return formState;

      let newFormState = {...formState};

      if (fieldState.isDynamic) return formState;

      // For both standard and dynamic field:
      // 1. update value
      // 2. update error
      // 3. check and validate anothe field if needed
      let changedFieldState = {
        ...fieldState,
        value: newValue,
      };
      newFormState[fieldName] = changedFieldState;

      let anotherFieldsState;

      if (skipValidation) {
        changedFieldState.error = '';
      } else {
        changedFieldState.error = validateField(
          changedFieldState,
          newFormState,
          {}
        );

        anotherFieldsState = checkIfFieldValidateAnotherField(
          changedFieldState,
          newFormState
        );
      }

      // onComplete must be called after TO ... otherwise, if another dispatch was
      // triggered in onComplete, reducer would be called 2 times but with the same
      // state, causing invalid state update as it is expected that the second action
      // triggers reducer with updated state from the previous action.
      //
      // Ideally, onComplete should be called in useEffect
      onComplete && setTimeout(() => onComplete(newValue), 0);

      return anotherFieldsState
        ? Object.assign(newFormState, anotherFieldsState)
        : newFormState;
    }
    case 'VALUE_CHANGE_DYNAMIC': {
      const {
        newValue,
        fieldName,
        subFieldName,
        index,
        onComplete,
      } = action.payload;

      const fieldState = formState[fieldName];
      let newFormState = {...formState};

      // For both standard and dynamic field:
      // 1. update value
      // 2. update error
      // 3. check and validate anothe field if needed
      let subFormState = {...fieldState.value[index]};
      let subFieldState = subFormState[subFieldName];
      let changedSubFieldState = {
        ...subFieldState,
        value: newValue,
      };
      subFormState[subFieldName] = changedSubFieldState;
      changedSubFieldState.error = validateField(
        changedSubFieldState,
        subFormState,
        {}
      );
      let anotherSubFieldsState = checkIfFieldValidateAnotherField(
        changedSubFieldState,
        subFormState
      );

      newFormState[fieldName] = {
        ...fieldState,
        value: fieldState.value.map(
          (item, itemIndex) =>
            itemIndex === index
              ? // subform could countain changes from another field validation!
                {
                  ...subFormState,
                  ...anotherSubFieldsState,
                  [subFieldName]: changedSubFieldState,
                }
              : item
        ),
      };

      onComplete && setTimeout(() => onComplete(newValue), 0);

      return newFormState;
    }
    case 'VALIDATION_ERRORS': {
      let errors = action.payload.errors;
      let updatedFormState = errors.reduce((acc, curr) => {
        return updateFieldProp({
          formState: acc,
          fieldName: curr.fieldName,
          index: curr.index,
          subFieldName: curr.subFieldName,
          updateValues: {
            error: curr.fieldError,
          },
        });
        // return {
        //   ...acc,
        //   [curr.fieldName]: {...acc[curr.fieldName], error: curr.fieldError},
        // };
      }, formState);

      return updatedFormState;
    }
    case 'FIELD_VISIBILITY_CHANGED': {
      let {fieldName, index, subFieldName, isVisible} = action.payload;
      return updateFieldProp({
        formState,
        fieldName,
        index,
        subFieldName,
        updateValues: {
          isVisible,
          error: '',
        },
      });
    }
    case 'ADD_DYNAMIC_ITEM': {
      let {fieldName, fieldSchemaData, initData} = action.payload;

      let newItemData = {};

      Object.keys(fieldSchemaData.dynamicSchemaItem).forEach(subFieldName => {
        let subFieldSchemaData =
          fieldSchemaData.dynamicSchemaItem[subFieldName];
        newItemData[subFieldName] = createFieldState({
          fieldSchemaData: subFieldSchemaData,
          initValue: initData[subFieldName],
        });
      });

      return {
        ...formState,
        [fieldName]: {
          isDynamic: true,
          value: [...formState[fieldName].value, newItemData],
        },
      };
    }
    case 'REMOVE_DYNAMIC_ITEM': {
      let {fieldName, index} = action.payload;

      return {
        ...formState,
        [fieldName]: {
          isDynamic: true,
          value: formState[fieldName].value.filter(
            (item, itemIndex) => itemIndex !== index
          ),
        },
      };
    }
    default:
      throw new Error('Reducer: unknown action type ' + action.type);
  }
}

type UpdateFieldPropArgs = {
  formState: FormState,
  fieldName: string,
  index: ?number,
  subFieldName: ?string,
  updateValues: {|
    value?: any,
    error?: string,
    isVisible?: boolean,
  |},
};
export function updateFieldProp({
  formState,
  fieldName,
  index,
  subFieldName,
  updateValues,
}: UpdateFieldPropArgs) {
  if (!subFieldName) {
    return {
      ...formState,
      [fieldName]: {
        ...formState[fieldName],
        ...updateValues,
      },
    };
  } else {
    // dynamic item
    return {
      ...formState,
      [fieldName]: {
        isDynamic: true,
        value: formState[fieldName].value.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [subFieldName]: {
                    ...item[subFieldName],
                    ...updateValues,
                  },
                }
              : item
        ),
      },
    };
  }
}

import {getInitValue, validateField} from './index';

export function initFormState({schema, schemaValues}) {
  let formState = {};

  Object.keys(schema).forEach(fieldName => {
    if (schema[fieldName].dynamicSchemaItem) {
      let dynamicFieldState = (formState[fieldName] = {value: []});

      if (schemaValues[fieldName]) {
        schemaValues[fieldName].forEach(initData => {
          let newItemData = {};

          Object.entries(schema[fieldName].dynamicSchemaItem).forEach(
            ([subFieldName, subFieldSchemaData]) => {
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
        fieldSchemaData: schema[fieldName],
        initValue: schemaValues[fieldName],
      });
    }
  });

  return formState;
}

function createFieldState({fieldSchemaData, initValue}) {
  let {
    defaultValue,
    formElement,
    validationRules = [],
    isVisible = true,
    disabled = false,
    useSecondLabel = false,
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
    disabled,
    useSecondLabel,
  };
}

function checkIfFieldValidateAnotherField(fieldState, newFormState) {
  for (let rule of fieldState.validationRules) {
    if (rule.validateAnotherField) {
      const anotherFieldName = rule.validateAnotherField;
      const error = validateField(newFormState[anotherFieldName], newFormState);
      newFormState = {
        ...newFormState,
        [anotherFieldName]: {...newFormState[anotherFieldName], error: error},
      };
    }
  }

  return newFormState;
}

export function reducer(formState, action) {
  switch (action.type) {
    case 'VALUE_CHANGE': {
      const {
        newValue,
        fieldName,
        subFieldName,
        index,
        onComplete,
      } = action.payload;
      const fieldState = subFieldName
        ? formState[fieldName]['value'][index][subFieldName]
        : formState[fieldName];

      let changedFiledState = {
        ...fieldState,
        value: newValue,
      };

      changedFiledState.error = validateField(
        changedFiledState,
        subFieldName ? formState[fieldName]['value'][index] : formState
      );
      const newFormState = subFieldName
        ? {
            ...formState,
            [fieldName]: {
              value: formState[fieldName].value.map(
                (subSchemaState, i) =>
                  i === index
                    ? {...subSchemaState, [subFieldName]: changedFiledState}
                    : subSchemaState
              ),
            },
          }
        : {...formState, [fieldName]: changedFiledState};
      let newFormStateWithOtherFieldsValidations = checkIfFieldValidateAnotherField(
        fieldState,
        newFormState
      );
      onComplete && onComplete(newValue);
      return newFormStateWithOtherFieldsValidations;
    }
    case 'SET_FIELD_VALUE': {
      const {fullFieldName, newValue, skipValidation} = action.payload;

      const fieldState = formState[fullFieldName];
      // todo: check if field name exists in schema and do nothing if not!!!
      let changedFiledState = {
        ...fieldState,
        value: newValue,
      };

      if (skipValidation) {
        changedFiledState.error = '';
      } else {
        changedFiledState.error = validateField(changedFiledState, formState);
      }

      let newFormState = {...formState, [fullFieldName]: changedFiledState};
      if (!skipValidation) {
        newFormState = checkIfFieldValidateAnotherField(
          fieldState,
          newFormState
        );
      }

      return {...formState, [fullFieldName]: changedFiledState};
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

      Object.entries(fieldSchemaData.dynamicSchemaItem).forEach(
        ([subFieldName, subFieldSchemaData]) => {
          newItemData[subFieldName] = createFieldState({
            fieldSchemaData: subFieldSchemaData,
            initValue: initData[subFieldName],
          });
        }
      );

      return {
        ...formState,
        [fieldName]: {
          value: [...formState[fieldName].value, newItemData],
        },
      };
    }
    case 'REMOVE_DYNAMIC_ITEM': {
      let {fieldName, index} = action.payload;

      return {
        ...formState,
        [fieldName]: {
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

export function updateFieldProp({
  formState,
  fieldName,
  index,
  subFieldName,
  updateValues,
}) {
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

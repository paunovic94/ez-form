import {getInitValue, ValueResolvers} from './index';

export function addDynamicItem({
  schema,
  setFormState,
  dynamicFieldName,
  initData,
}) {
  let newItemData = {};

  Object.entries(schema[dynamicFieldName].dynamicSchemaItem).forEach(
    ([subFieldName, subFieldSchemaData]) => {
      newItemData[subFieldName] = createFieldState({
        fieldSchemaData: subFieldSchemaData,
        initValue: initData[subFieldName],
      });
    }
  );

  setFormState(prevFormState => ({
    ...prevFormState,
    [dynamicFieldName]: {
      value: [...prevFormState[dynamicFieldName].value, newItemData],
    },
  }));
}

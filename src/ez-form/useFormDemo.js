import React, { useState, useMemo } from "react";

export const InputTypes = {
  TEXT: "TEXT_INPUT",
  SELECT: "SELECT_INPUT"
};

export default function useForm(schema) {
  // function passed to useState is the same as useMemo(() => fn(), []),
  // it is called only once during initialization
  let [formState, setFormState] = useState(() => initFormData(schema));

  function handleChange({ event, fieldName, cb }) {
    let fieldState = formState[fieldName];
    let newVal = fieldState.resolveValueFromChangeEvent(event);

    let newFieldState = { ...fieldState, value: newVal };

    newFieldState.error = validateField(newFieldState);

    setFormState({ ...formState, [fieldName]: newFieldState });
  }

  let formData = {};

  schema.forEach(({ fieldName, formElement }) => {
    let fieldState = formState[fieldName];
    formData[fieldName] = {
      render: additionalProps => (
        <formElement.Component
          value={fieldState.value}
          error={fieldState.error}
          {...additionalProps}
          onChange={e => {
            handleChange({
              event: e,
              fieldName,
              cb: newVal =>
                additionalProps.onChange && additionalProps.onChange(newVal)
            });
          }}
        />
      )
    };
  });

  return formData;
}

function initFormData(schema) {
  let formData = {};

  schema.forEach(schemaItem => {
    let {
      fieldName,
      defaultValue,
      formElement,
      validationRules = []
    } = schemaItem;

    formData[fieldName] = {
      value: defaultValue,
      error: "",
      validationRules,
      resolveValueFromChangeEvent: ValueResolvers[formElement.type]
    };
  });

  return formData;
}

function validateField(fieldState) {
  for (let rule of fieldState.validationRules) {
    let error = rule.fn(fieldState.value);

    if (error) return error;
  }

  return "";
}

const ValueResolvers = {
  [InputTypes.TEXT]: e => e.target.value,
  [InputTypes.SELECT]: e => e
};

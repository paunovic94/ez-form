import React, { useState } from "react";

export const InputTypes = {
  TEXT: "TEXT_INPUT",
  SELECT: "SELECT_INPUT"
};

export default function useForm(schema) {
  let formData = {};
  Object.keys(schema).forEach(fieldName => {
    const formElement = schema[fieldName].formElement;
    formData[fieldName] = {
      render: additionalProps => (
        <formElement.Component
          value={schema[fieldName].defaultValue}
          {...additionalProps}
        />
      )
    };
  });

  return formData
}

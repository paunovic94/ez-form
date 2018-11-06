// @flow
import React from "react";
import type { ComponentType } from "react";

type IntlMessageDescriptor = {
  id: string,
  defaultMessage: string,
  description: ?string
};

type IntlMessage = {
  descriptor: IntlMessageDescriptor,
  values: ?{}
};

type FormElement = {
  type: string,
  Component: ComponentType<{ value: any, error: string, onChange: any => void }>
};

type Label = string | IntlMessage;

type ValidationRule = {
  fn: ({
    value: string,
    message: IntlMessage,
    args: {},
    fieldName: string,
    state: {},
    validationArgs: {}
  }) => string
};

type FieldMetadata = {
  defaultValue: string | number | boolean | Array<string> | void,
  formElement: FormElement,
  label: ?Label,
  label2: ?Label,
  validationRules: ?Array<ValidationRule>
};

type Schema = { [string]: FieldMetadata };

export const InputTypes = {
  TEXT: "TEXT_INPUT",
  SELECT: "SELECT_INPUT"
};

export default function useForm(schema: Schema) {
  return {};
}

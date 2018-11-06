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

type FieldMetadata = {
  defaultValue: string | number | boolean | Array<string>,
  formElement: FormElement,
  label: string | IntlMessage,
  label2: string | IntlMessage
};

type Schema = { [string]: FieldMetadata };

export const InputTypes = {
  TEXT: "TEXT_INPUT",
  SELECT: "SELECT_INPUT"
};

export default function useForm(schema) {
  return {}
}

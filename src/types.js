// @flow

import {ComponentType} from "react";

export type IntlMessageDescriptor = {
  id: string,
  defaultMessage: string,
  description: ?string,
};

export type IntlMessage = {
  descriptor: IntlMessageDescriptor,
  values: ?{},
};

export type FormElement = {
  type: string,
  Component: ComponentType<{value: any, error: string, onChange: any => void}>,
};

export type Label = string | IntlMessage;
export type ErrorMessage = string | IntlMessage;

export type ValidationRule = {
  fn: (
    value: string,
    message: IntlMessage,
    args: {},
    state: {},
    _props: {},
    fieldName: string,
    validationArgs: {}
  ) => string,
  message: ?ErrorMessage,
  args: ?{},
  validateAnotherField: ?string,
};

export type SelectValue = string | {value: string | number, label: string} | null;

export type SchemaValue =
  | string
  | number
  | boolean
  | Array<string>
  | SelectValue
  | void
  | {};

// https://flow.org/en/docs/types/unions/#toc-disjoint-unions
export type StandardFieldMetadata = {|
  name: string,
  defaultValue: SchemaValue,
  formElement: FormElement,
  label: ?Label,
  label2: ?Label,
  validationRules: ?Array<ValidationRule>,
  useSecondLabel: ?boolean,
  disabled: ?boolean,
  isVisible: ?boolean,
|};
export type DynamicFieldMetadata = {|
  dynamicSchemaItem: StandardFieldMetadata,
|};
export type FieldMetadata = StandardFieldMetadata | DynamicFieldMetadata;

export type Schema = {[string]: FieldMetadata};

// export type InputType =
//   | 'TEXT_INPUT'
//   | 'SELECT_INPUT'
//   | 'MULTISELECT'
//   | 'CHECKBOX'
//   | 'RADIOGROUP';
//   | 'TEXT_AREA

export type SetSchemaStateArgs = {
  fullFieldName: string,
  newValue: SchemaValue,
  skipValidation: boolean,
  onComplete: Function,
};

export type ValuesMap = {[string]: SchemaValue};

export type SetSchemaStateValueBulkArgs = {
  valuesMap: ValuesMap,
  skipValidation: boolean,
  onComplete: Function,
};

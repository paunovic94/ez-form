// @flow

import type {ComponentType} from 'react';

export type IntlMessageDescriptor = {
  id: string,
  defaultMessage: string,
  description: ?string,
};

export type IntlMessage = {
  descriptor: IntlMessageDescriptor,
  values: ?{},
};

export type InputType =
  | 'TEXT_INPUT'
  | 'SELECT_INPUT'
  | 'MULTISELECT'
  | 'CHECKBOX'
  | 'RADIOGROUP'
  | 'TEXT_AREA';

export type FormElement = {
  type: InputType,
  Component: ComponentType<{value: any, error: string, onChange: any => void}>,
};

export type Label = string | IntlMessage;
export type ErrorMessage = string | IntlMessage;

export type ValidationRule = {
  fn: (value: string, message: ?ErrorMessage, args: ?{}, state: ?{}) => string,
  message: ?ErrorMessage,
  args: ?{
    dependencyField?: string,
    dependencyValue?: any,
    dependencyInValidationArgs?: boolean,
  },
  validateAnotherField: ?string,
};

export type SelectValue =
  | string
  | {value: string | number, label: string}
  | null;

export type MultiSelectValue =
  | Array<string>
  | Array<{value: string | number, label: string}>;

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
  defaultValue: SchemaValue,
  formElement: FormElement,
  label: ?Label,
  label2: ?Label,
  validationRules: ?Array<ValidationRule>,
  isVisible: ?boolean,
|};
export type DynamicFieldMetadata = {|
  dynamicSchemaItem: {[string]: StandardFieldMetadata},
|};
export type FieldMetadata = StandardFieldMetadata | DynamicFieldMetadata;

export type Schema = {[string]: FieldMetadata};

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

export type StandardFieldState = {|
  value: any,
  error: string,
  validationRules: Array<ValidationRule>,
  isVisible: boolean,
|};

type DynamicFieldState = {|
  isDynamic: true,
  value: Array<{[string]: StandardFieldState}>,
|};

export type FieldState = StandardFieldState | DynamicFieldState;

export type FormState = {[string]: FieldState};
export type SubFormState = {[string]: StandardFieldState};

export type Action =
  | {|
      type: 'VALUE_CHANGE_STANDARD',
      payload: {|
        newValue: any,
        fieldName: string,
        skipValidation: ?boolean,
        onComplete: any => void,
      |},
    |}
  | {|
      type: 'VALUE_CHANGE_DYNAMIC',
      payload: {|
        newValue: any,
        fieldName: string,
        subFieldName: string,
        index: number,
        onComplete: any => void,
      |},
    |}
  // | {
  //     type: 'SET_FIELD_VALUE',
  //     payload: {fullFieldName: string, newValue: any, skipValidation: ?boolean},
  //   }
  | {
      type: 'VALIDATION_ERRORS',
      payload: {
        errors: Array<{
          fieldName: string,
          fieldError: string,
          index: ?number,
          subFieldName: ?string,
        }>,
      },
    }
  | {
      type: 'FIELD_VISIBILITY_CHANGED',
      payload: {
        fieldName: string,
        index: ?number,
        subFieldName: ?string,
        isVisible: boolean,
      },
    }
  | {
      type: 'ADD_DYNAMIC_ITEM',
      payload: {
        fieldName: string,
        fieldSchemaData: DynamicFieldMetadata,
        initData: {[string]: any},
      },
    }
  | {
      type: 'REMOVE_DYNAMIC_ITEM',
      payload: {
        fieldName: string,
        index: number,
      },
    };

export type InitValuesMap = {[string]: any};
export type ReducerInitArgs = {
  schema: Schema,
  schemaValues: InitValuesMap,
};

export type AddDynamicItemArgs = {
  dynamicFieldName: string,
  initData: InitValuesMap,
};
export type RemoveDynamicItemArgs = {
  dynamicFieldName: string,
  index: number,
};

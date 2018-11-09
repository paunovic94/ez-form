import React from 'react';
import ReactSelect from 'react-select';
import { InputTypes } from '../index';

function TextInput({
  label,
  error,
  fontSize,
  name,
  value,
  onChange,
  disabled,
  ...restProps
}) {
  label = typeof label === "object" ? label.descriptor.defaultMessage : label;
  error = typeof error === "object" ? error.descriptor.defaultMessage : error;

  return (
    <div className={`TestTextInput ${name}`}>
      {label && <div className="Label">Label: {label}</div>}
      {error && <div className="Error">Error: {error}</div>}
      <input
        type="text"
        title={error}
        value={value}
        onChange={onChange}
        style={{
          background: error ? 'coral' : 'white',
          fontSize: fontSize || 16,
        }}
        disabled={disabled}
      />
    </div>
  );
}

function Select({
  label,
  error,
  value,
  options,
  onChange,
  onChangeTestValue,
  disabled,
  onInputChange,
  ...restProps
}) {

  if (typeof value === 'string' && options) {
    value = options.find(option => option.value === value);
  }

  return (
    <div className="TestSelect" onClick={e => onChange(onChangeTestValue)}>
      {label && <div>Label: {label}</div>}
      {error && <div>Error: {error}</div>}
      <ReactSelect
        value={value}
        options={options}
        onChange={onChange}
        isDisabled={disabled}
        onInputChange={onInputChange}
      />
    </div>
  );
}

let formElements = {
  textInput: { type: InputTypes.TEXT, Component: TextInput },
  select: { type: InputTypes.SELECT, Component: Select },
};

export default formElements;

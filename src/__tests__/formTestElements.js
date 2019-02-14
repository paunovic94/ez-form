import React from 'react';
import ReactSelect from 'react-select';
import {InputTypes} from '../index';

test('Not a test file, just avoiding Jest error', () => {
  expect(true).toBe(true);
});

export function formatDate(date) {
  date = new Date(date);
  var monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

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
  label = typeof label === 'object' ? label.descriptor.defaultMessage : label;
  error = typeof error === 'object' ? error.descriptor.defaultMessage : error;

  if (
    name &&
    name.toLowerCase().includes('date') &&
    !isNaN(Date.parse(value))
  ) {
    value = formatDate(value);
  }
  return (
    <div className={`TestTextInput ${name}`}>
      {label && (
        <label htmlFor={`${name}-input`} className="Label">
          Label: {label}
        </label>
      )}
      {error && <div className="Error">Error: {error}</div>}
      <input
        id={`${name}-input`}
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
  selectOptions,
  onChange,
  onChangeTestValue,
  disabled,
  onInputChange,
  name,
  ...restProps
}) {
  if (typeof value === 'string' && selectOptions) {
    value = selectOptions.find(option => option.value === value);
  }

  return (
    <div
      className={`TestSelect ${name}`}
      onClick={e => onChange(onChangeTestValue)}>
      {label && <div>Label: {label}</div>}
      {error && <div>Error: {error}</div>}
      <ReactSelect
        value={value}
        options={selectOptions}
        onChange={onChange}
        isDisabled={disabled}
        onInputChange={onInputChange}
      />
    </div>
  );
}

function MultiSelect({
  label,
  error,
  value,
  selectOptions,
  onChange,
  onChangeTestValue,
  disabled,
  onInputChange,
  name,
  ...restProps
}) {
  return (
    <div
      className={`TestMultiSelect ${name}`}
      onClick={e => onChange(onChangeTestValue)}>
      {label && <div>Label: {label}</div>}
      {error && <div>Error: {error}</div>}
      <ReactSelect
        value={value}
        options={selectOptions}
        onChange={onChange}
        isDisabled={disabled}
        onInputChange={onInputChange}
        isMulti={true}
      />
    </div>
  );
}

function Checkbox({
  label,
  error,
  value = false,
  onChange,
  disabled,
  name,
  id = name,
  checked,
  ...restProps
}) {
  return (
    <div className={`Checkbox ${name}`}>
      {label && <label htmlFor={id}>Label: {label}</label>}
      {error && <div>Error: {error}</div>}
      <input
        type="checkbox"
        value={value}
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function RadioGroup({
  label: groupLabel,
  error,
  value: selectedValue,
  onChange,
  disabled,
  name,
  id = name,
  options = [],
}) {
  return (
    <div className={`RadioGroup ${name}`}>
      {groupLabel && <div>Label: {groupLabel}</div>}
      {error && <div>Error: {error}</div>}
      {options.length &&
        options.map(({label, value}, idx) => (
          <div className={`RadioElement`} key={idx}>
            <input
              type="radio"
              id={name + '_' + idx}
              name={name}
              value={value}
              checked={String(selectedValue) === String(value)}
              onChange={onChange}
              disabled={disabled}
            />
            <label htmlFor={name + '_' + idx}>{label}</label>
          </div>
        ))}
    </div>
  );
}

function TextArea({
  name,
  id = name,
  label,
  value,
  disabled = false,
  readOnly = false,
  error,
  onChange,
  className,
  appendTextOnFocus,
  onFocus,
  ...restProps
}) {
  label = typeof label === 'object' ? label.descriptor.defaultMessage : label;
  error = typeof error === 'object' ? error.descriptor.defaultMessage : error;
  return (
    <div className={`TestTextInput ${name}`}>
      {label && (
        <label htmlFor={id} className="Label">
          Label: {label}
        </label>
      )}
      {error && <div className="Error">Error: {error}</div>}
      <textarea
        id={id}
        className={className}
        name={name}
        placeholder=""
        value={value}
        title={error}
        readOnly={readOnly}
        onChange={onChange}
        style={{
          background: error ? 'coral' : 'white',
          fontSize: 16,
        }}
        disabled={disabled}
        onFocus={e => {
          if (typeof appendTextOnFocus === 'function' && onChange) {
            appendTextOnFocus();
            onChange(e);
          }
          onFocus && onFocus(e);
        }}
      />
    </div>
  );
}

let formElements = {
  textInput: {type: InputTypes.TEXT, Component: TextInput},
  select: {type: InputTypes.SELECT, Component: Select},
  multiSelect: {type: InputTypes.MULTISELECT, Component: MultiSelect},
  checkbox: {type: InputTypes.CHECKBOX, Component: Checkbox},
  radioGroup: {type: InputTypes.RADIOGROUP, Component: RadioGroup},
  textArea: {type: InputTypes.TEXTAREA, Component: TextArea},
};

export default formElements;

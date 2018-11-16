import React from "react";
import ReactSelect from "react-select";
import { InputTypes } from "../index";

export function formatDate(date) {
  date = new Date(date);
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + " " + monthNames[monthIndex] + " " + year;
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
  label = typeof label === "object" ? label.descriptor.defaultMessage : label;
  error = typeof error === "object" ? error.descriptor.defaultMessage : error;

  if (
    name &&
    name.toLowerCase().includes("date") &&
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
          background: error ? "coral" : "white",
          fontSize: fontSize || 16
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
  name,
  ...restProps
}) {
  if (typeof value === "string" && options) {
    value = options.find(option => option.value === value);
  }

  return (
    <div
      className={`TestSelect ${name}`}
      onClick={e => onChange(onChangeTestValue)}
    >
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

function MultiSelect({
  label,
  error,
  value,
  options,
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
      onClick={e => onChange(onChangeTestValue)}
    >
      {label && <div>Label: {label}</div>}
      {error && <div>Error: {error}</div>}
      <ReactSelect
        value={value}
        options={options}
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
  value,
  isCheckbox = true,
  onChange,
  disabled,
  name,
  id = name,
  ...restProps
}) {
  console.log(value, !!value);
  return (
    <div
      className={`Checkbox ${name}`}
    >
      {label && <div>Label: {label}</div>}
      {error && <div>Error: {error}</div>}
      <input
        type="checkbox"
        id={id}
        value={value}
        checked={!!value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}


let formElements = {
  textInput: { type: InputTypes.TEXT, Component: TextInput },
  select: { type: InputTypes.SELECT, Component: Select },
  multiSelect: { type: InputTypes.MULTISELECT, Component: MultiSelect },
  checkbox: { type: InputTypes.CHECKBOX, Component: Checkbox },
};

export default formElements;

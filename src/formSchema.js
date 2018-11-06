import formElements from "./formElements";

function isRequired(value) {
  if (
    !value ||
    (Array.isArray(value) && value.length === 0) ||
    !String(value).trim()
  ) {
    return "Field is required";
  }
}

let formSchema = [
  {
    fieldName: "firstName",
    defaultValue: "Def",
    formElement: formElements.textInput,
    label: "First Name",
    validationRules: [
      {
        fn: isRequired
      }
    ]
  },
  {
    fieldName: "lastName",
    defaultValue: "ault",
    formElement: formElements.textInput,
    label: "First Name",
    validationRules: [
      {
        fn: isRequired
      }
    ]
  },
  {
    fieldName: "country",
    defaultValue: "SERBIA",
    formElement: formElements.select,
    label: "Country",
    validationRules: [
      {
        fn: isRequired
      }
    ]
  }
];

export default formSchema;

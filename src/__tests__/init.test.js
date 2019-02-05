import React from "react";
import { render, cleanup, fireEvent } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

afterEach(cleanup);

describe("init default value from schema", () => {
  test("Text Input", () => {
    function TestForm(props) {
      const { formData } = useForm({
        testInputText: {
          formElement: formElements.textInput,
          defaultValue: "test-input-text"
        },
        testInputTextNoDefault: {
          formElement: formElements.textInput
        }
      });

      return (
        <div>
          {formData.testInputText.render()}
          {formData.testInputTextNoDefault.render()}
        </div>
      );
    }

    const { container } = render(<TestForm />);

    const inputs = container.querySelectorAll("input");

    expect(inputs[0].value).toBe("test-input-text");
    expect(inputs[1].value).toBe("");
  });

  test("Select", () => {
    function TestForm(props) {
      const { formData } = useForm({
        testSelectStringValue: {
          formElement: formElements.select,
          defaultValue: "test-select"
        },
        testSelectObjectValue: {
          formElement: formElements.select,
          defaultValue: { value: "test-select", label: "Test Select Default" }
        }
      });

      return (
        <div>
          {formData.testSelectStringValue.render({
            selectOptions: [{ value: "test-select", label: "Test Select" }]
          })}
          {formData.testSelectObjectValue.render({
            selectOptions: [{ value: "test-select", label: "Test Select" }]
          })}
        </div>
      );
    }

    const { queryByText } = render(<TestForm />);

    expect(queryByText("Test Select")).toBeTruthy();
    expect(queryByText("Test Select Default")).toBeTruthy();
  });

  test("Multi Select", () => {
    function TestForm(props) {
      const { formData } = useForm({
        testSelectMulti: {
          formElement: formElements.multiSelect,
          defaultValue: [
            { value: "test-select1", label: "Test Select1" },
            { value: "test-select2", label: "Test Select2" }
          ]
        },
        testSelectMultiString: {
          formElement: formElements.multiSelect,
          defaultValue: ["string-value1"]
        }
      });

      return (
        <div>
          {formData.testSelectMulti.render({
            selectOptions: [
              { value: "test-select1", label: "Test Select1" },
              { value: "test-select2", label: "Test Select2" }
            ]
          })}
          {formData.testSelectMultiString.render({
            selectOptions: [
              { value: "string-value1", label: "string-value1" },
              { value: "string-value2", label: "string-value2" }
            ]
          })}
        </div>
      );
    }

    const { queryByText } = render(<TestForm />);

    expect(queryByText("Test Select1")).toBeTruthy();
    expect(queryByText("Test Select2")).toBeTruthy();
    expect(queryByText("string-value1")).toBeFalsy();
    expect(queryByText("string-value2")).toBeFalsy();
  });

  test("Checkbox - valid value for default value is boolean", () => {
    function TestForm(props) {
      const { formData } = useForm({
        checkbox1: {
          formElement: formElements.checkbox,
          defaultValue: true
        },
        checkbox2: {
          formElement: formElements.checkbox,
          defaultValue: false
        },
        checkbox3: {
          formElement: formElements.checkbox
        }
      });

      return (
        <div>
          {formData.checkbox1.render()}
          {formData.checkbox2.render()}
          {formData.checkbox3.render()}
        </div>
      );
    }

    const { container } = render(<TestForm />);

    const checkboxs = container.querySelectorAll("input");

    expect(checkboxs[0].type).toBe("checkbox");

    expect(checkboxs[0].checked).toBeTruthy();
    expect(checkboxs[1].checked).not.toBeTruthy();
    expect(checkboxs[2].checked).not.toBeTruthy();
  });

  test("Radio group", () => {
    function TestForm(props) {
      const { formData } = useForm({
        radioGroup1: {
          formElement: formElements.radioGroup,
          name: "radioGroup1"
        },
        radioGroup2: {
          formElement: formElements.radioGroup,
          defaultValue: "option1",
          name: "radioGroup2"
        },
        radioGroup3: {
          formElement: formElements.radioGroup,
          defaultValue: "non-existing-option",
          name: "radioGroup3"
        }
      });

      return (
        <div>
          {formData.radioGroup1.render()}
          {formData.radioGroup2.render({
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" }
            ]
          })}
          {formData.radioGroup3.render({
            options: [{ value: "radio3-option1", label: "Radio 3 Option 1" }]
          })}
        </div>
      );
    }

    const { container, getByLabelText, debug } = render(<TestForm />);

    const radioGroups = container.querySelectorAll(".RadioGroup");

    // First group
    expect(radioGroups[0]).toBeTruthy();

    // Second group
    expect(getByLabelText("Option 1").type).toBe("radio");
    expect(getByLabelText("Option 1").checked).toBeTruthy();
    expect(getByLabelText("Option 1").value).toBe("option1");

    expect(getByLabelText("Option 2").type).toBe("radio");
    expect(getByLabelText("Option 2").checked).not.toBeTruthy();
    expect(getByLabelText("Option 2").value).toBe("option2");

    // Third group
    expect(getByLabelText("Radio 3 Option 1").checked).not.toBeTruthy();
  });

  test("IsVisible flag in schema", () => {
    function TestForm(props) {
      const { formData } = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "testInputText1",
          name: "testInputText1",
          isVisible: true
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          defaultValue: "testInputText2"
        },
        testInputText3: {
          formElement: formElements.textInput,
          name: "testInputText3",
          defaultValue: "testInputText3",
          isVisible: false
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testInputText3.render()}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);
    const inputs = container.querySelectorAll("input");
    const TextInputComponent3 = container.querySelector(".testInputText3");

    expect(inputs[0].value).toBe("testInputText1");
    expect(inputs[1].value).toBe("testInputText2");
    expect(TextInputComponent3).not.toBeTruthy();
  });

  test("Label and Label2", () => {
    function TestForm(props) {
      const { formData } = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "testInputText1",
          name: "testInputText1",
          label: "testInputText1"
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          defaultValue: "testInputText2",
          label: "testInputText2",
          label2: "testInputText2 label2"
        },
        testInputText3: {
          formElement: formElements.textInput,
          name: "testInputText3",
          defaultValue: "testInputText3",
          label: "testInputText3",
          label2: "testInputText3 label2"
        },
        testInputText4: {
          formElement: formElements.textInput,
          name: "testInputText4",
          defaultValue: "testInputText4",
          label: {
            descriptor: {
              id: "Util.label",
              defaultMessage: "testInputText4"
            }
          }
        },
        testInputText5: {
          formElement: formElements.textInput,
          name: "testInputText5",
          defaultValue: "testInputText5"
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testInputText3.render({ useSecondLabel: true })}
          {formData.testInputText4.render()}
          {formData.testInputText5.render()}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);

    let label1 = container.querySelector(".testInputText1 > .Label");
    let label2 = container.querySelector(".testInputText2 > .Label");
    let label3 = container.querySelector(".testInputText3 > .Label");
    let label4 = container.querySelector(".testInputText4 > .Label");
    let label5 = container.querySelector(".testInputText5 > .Label");

    expect(label1.innerHTML).toBe("Label: testInputText1");
    expect(label2.innerHTML).toBe("Label: testInputText2");
    expect(label3.innerHTML).toBe("Label: testInputText3 label2");
    expect(label4.innerHTML).toBe("Label: testInputText4");
    expect(label5).toBeNull();
  });
});

describe("Init value in schema with second arg in useForm", () => {
  test("Text input", () => {
    function TestForm(props) {
      const { formData } = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
            defaultValue: "testInputText1",
            name: "testInputText1"
          },
          testInputText2: {
            formElement: formElements.textInput,
            name: "testInputText2"
          },
          testInputText3: {
            formElement: formElements.textInput,
            name: "testInputText3"
          },
          testInputText4: {
            formElement: formElements.textInput,
            name: "testInputText4"
          },
          testInputText5: {
            formElement: formElements.textInput,
            name: "testInputText5"
          }
        },
        {
          testInputText1: "initText1",
          testInputText2: 0,
          testInputText3: 1,
          testInputText4: false,
          testInputText5: true
        }
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testInputText3.render()}
          {formData.testInputText4.render()}
          {formData.testInputText5.render()}
        </div>
      );
    }

    const { container } = render(<TestForm />);

    const inputs = container.querySelectorAll("input");

    expect(inputs[0].value).toBe("initText1");
    expect(inputs[1].value).toBe("0");
    expect(inputs[2].value).toBe("1");
    expect(inputs[3].value).toBe("false");
    expect(inputs[4].value).toBe("true");
  });

  test("Text input - init with '', undefiend, null", () => {
    function TestForm(props) {
      const { formData } = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
            name: "testInputText1",
            label: "testInputText1"
          },
          testInputText2: {
            formElement: formElements.textInput,
            name: "testInputText2",
            label: "testInputText2"
          },
          testInputText3: {
            formElement: formElements.textInput,
            name: "testInputText3",
            label: "testInputText3"
          }
        },
        {
          testInputText1: "",
          testInputText2: undefined,
          testInputText3: null
        }
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testInputText3.render()}
        </div>
      );
    }

    const { container, getByLabelText } = render(<TestForm />);

    expect(getByLabelText("Label: testInputText1").value).toEqual("");
    expect(getByLabelText("Label: testInputText2").value).toEqual("");
    expect(getByLabelText("Label: testInputText3").value).toEqual("");
  });

  test("Select - init with value that is in options", () => {
    function TestForm(props) {
      const { formData } = useForm(
        {
          testSelectStringValue: {
            formElement: formElements.select
          },
          testSelectObjectValue: {
            formElement: formElements.select
          }
        },
        {
          testSelectStringValue: "test-select",
          testSelectObjectValue: {
            value: "test-select",
            label: "Test Select Init 2"
          }
        }
      );

      return (
        <div>
          {formData.testSelectStringValue.render({
            selectOptions: [{ value: "test-select", label: "Test Select Init 1" }]
          })}
          {formData.testSelectObjectValue.render({
            selectOptions: [{ value: "test-select", label: "Test Select Init 2" }]
          })}
        </div>
      );
    }

    const { queryByText } = render(<TestForm />);

    expect(queryByText("Test Select Init 1")).toBeTruthy();
    expect(queryByText("Test Select Init 2")).toBeTruthy();
  });

  test("Select - init with value that isn't in selectOptions ", () => {
    function TestForm(props) {
      const { formData, validate, prepareForServer } = useForm(
        {
          testSelect1: {
            formElement: formElements.select,
            name: "testSelect1"
          },
          testSelect2: {
            formElement: formElements.select,
            name: "testSelect2"
          }
        },
        {
          testSelect1: "non-existing-value",
          testSelect2: { value: "non-existing-value", label: "Not Exixt" }
        }
      );

      return (
        <div>
          {formData.testSelect1.render({
            selectOptions: []
          })}
          {formData.testSelect2.render({
            selectOptions: []
          })}
        </div>
      );
    }

    const { container, queryByText } = render(<TestForm />);

    expect(queryByText("non-existing-value")).toBeFalsy();
    expect(queryByText("Not Exixt")).toBeTruthy();
  });

  test("Multi Select - init with props", () => {
    function TestForm(props) {
      const { formData, validate, prepareForServer } = useForm(
        {
          testSelectMulti1: {
            formElement: formElements.multiSelect,
            name: "testSelect1"
          }
        },
        {
          testSelectMulti1: [
            { value: "test-select1", label: "Test Select1" },
            { value: "test-select2", label: "Test Select2" }
          ]
        }
      );

      return (
        <div>
          {formData.testSelectMulti1.render({
            selectOptions: [
              { value: "test-select1", label: "Test Select1" },
              { value: "test-select2", label: "Test Select2" }
            ]
          })}
        </div>
      );
    }

    const { container, queryByText } = render(<TestForm />);

    expect(queryByText("Test Select1")).toBeTruthy();
    expect(queryByText("Test Select2")).toBeTruthy();
  });

  test("Multi Select - init with [] with value that is not in options", () => {
    function TestForm(props) {
      const { formData, validate, prepareForServer } = useForm(
        {
          testSelectMulti1: {
            formElement: formElements.multiSelect,
            name: "testSelectMulti1"
          }
        },
        {
          testSelectMulti1: [
            { value: "not-extist", label: "Not exist in selectOptions" }
          ]
        }
      );

      return (
        <div>
          {formData.testSelectMulti1.render({
            selectOptions: []
          })}
        </div>
      );
    }

    const { container, queryByText } = render(<TestForm />);

    expect(queryByText("Not exist in selectOptions")).toBeTruthy();
  });

  test("Multi Select - init with [] with string", () => {
    function TestForm(props) {
      const { formData, validate, prepareForServer } = useForm(
        {
          testSelectMulti1: {
            formElement: formElements.multiSelect,
            name: "testSelectMulti1"
          },
          testSelectMulti2: {
            formElement: formElements.multiSelect,
            name: "testSelectMulti2"
          }
        },
        {
          testSelectMulti1: ["Not extist in selectOptions"],
          testSelectMulti2: ["Exist in selectOptions"]
        }
      );

      return (
        <div>
          {formData.testSelectMulti1.render({
            selectOptions: []
          })}
          {formData.testSelectMulti2.render({
            selectOptions: [{ value: "Exist in options", label: "Exist in options" }]
          })}
        </div>
      );
    }

    const { container, queryByText } = render(<TestForm />);

    expect(queryByText("Not exist in options")).toBeFalsy();
    expect(queryByText("Exist in options")).toBeFalsy();
  });

  test("Checkbox - boolean is valid value for init", () => {
    function TestForm(props) {
      const { formData } = useForm(
        {
          checkbox1: {
            formElement: formElements.checkbox
          },
          checkbox2: {
            formElement: formElements.checkbox
          }
        },
        {
          checkbox1: true,
          checkbox2: false
        }
      );

      return (
        <div>
          {formData.checkbox1.render()}
          {formData.checkbox2.render()}
        </div>
      );
    }

    const { container } = render(<TestForm />);

    const checkboxs = container.querySelectorAll("input");

    expect(checkboxs[0].type).toBe("checkbox");

    expect(checkboxs[0].checked).toBe(true);
    expect(checkboxs[1].checked).toBe(false);
  });

  test("Checkbox - when init with undefined, use default value or set default value to false", () => {
    function TestForm(props) {
      const { formData } = useForm(
        {
          checkbox1: {
            formElement: formElements.checkbox
          },
          checkbox2: {
            formElement: formElements.checkbox,
            defaultValue: true
          }
        },
        {
          checkbox1: undefined,
          checkbox2: undefined
        }
      );

      return (
        <div>
          {formData.checkbox1.render()}
          {formData.checkbox2.render()}
        </div>
      );
    }

    const { container, debug } = render(<TestForm />);

    const checkboxs = container.querySelectorAll("input");

    expect(checkboxs[0].type).toBe("checkbox");

    expect(checkboxs[0].checked).toBe(false);
    expect(checkboxs[1].checked).toBe(true);

    expect(checkboxs[0].value).toBe("false");
    expect(checkboxs[1].value).toBe("true");
  });

  test("Checkbox - throws on initValue other than boolean or undefined", () => {
    function TestForm(props) {
      const { formData } = useForm(
        {
          checkbox1: {
            formElement: formElements.checkbox
          }
        },
        {
          checkbox1: ""
        }
      );

      return <div>{formData.checkbox1.render()}</div>;
    }

    expect(() => render(<TestForm />)).toThrow(/Invalid initValue/);
  });

  test("Checkbox - throws on defaultValue other than boolean or undefined", () => {
    function TestForm(props) {
      const { formData } = useForm({
        checkbox1: {
          formElement: formElements.checkbox,
          defaultValue: null
        }
      });

      return <div>{formData.checkbox1.render()}</div>;
    }

    expect(() => render(<TestForm />)).toThrow(/Invalid defaultValue/);
  });
});

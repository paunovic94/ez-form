import { render, cleanup, fireEvent, wait } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";
import React from "react";
import { isMaxLength } from "./validation.test";

afterEach(cleanup);

describe("Test utiliti functions for schema", () => {
  test.skip("Prepare for server - input", () => {
    let onSubmitMock = jest.fn();

    function TestForm(props) {
      const { formData, validate, prepareForServer } = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
            defaultValue: "Test 1 default"
          },
          testInputText2: {
            formElement: formElements.textInput
          },
          testInputText3: {
            formElement: formElements.textInput
          },
          testInputText4: {
            formElement: formElements.textInput
          },
          testInputText5: {
            formElement: formElements.textInput,
            name: "testInputText5"
          }
        },
        {
          testInputText1: "Test 1",
          testInputText2: "",
          testInputText3: undefined,
          testInputText4: null,
          testInputText5: 1
        }
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testInputText3.render()}
          {formData.testInputText4.render()}
          {formData.testInputText5.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}
          >
            Submit form
          </button>
        </div>
      );
    }
    const { container, getByText, getByValue } = render(<TestForm />);

    fireEvent.click(getByText("Submit form"));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testInputText1: "Test 1",
      testInputText2: null,
      testInputText3: null,
      testInputText4: null,
      testInputText5: 1
    });
  });

  test("Prepare for server - select", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const { formData, validate, prepareForServer } = useForm(
        {
          testSelectString: {
            formElement: formElements.select
          },
          testSelectString2: {
            formElement: formElements.select
          },
          testSelectObj1: {
            formElement: formElements.select
          },
          testSelectObj2: {
            formElement: formElements.select
          },
          testSelectObj3: {
            formElement: formElements.select
          }
        },
        {
          testSelectString: "testSelectString",
          testSelectString2: "not-existing-option",
          testSelectObj1: {
            value: "test-select-obj",
            label: "Test Select Object"
          },
          testSelectObj2: {
            value: {},
            label: "Test Select Nested Obj"
          },
          testSelectObj3: { value: "not-existing-option", label: "Not exist" }
        }
      );

      return (
        <div>
          {formData.testSelectString.render({
            options: [
              { value: "testSelectString", label: "Test Select String" }
            ]
          })}
          {formData.testSelectString2.render()}
          {formData.testSelectObj1.render({
            options: [{ value: "test-select-obj", label: "Test Select Object" }]
          })}
          {formData.testSelectObj2.render({
            options: [
              {
                value: {},
                label: "Test Select Nested Obj"
              }
            ]
          })}
          {formData.testSelectObj3.render({
            options: []
          })}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}
          >
            Submit form
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue } = render(<TestForm />);

    fireEvent.click(getByText("Submit form"));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testSelectString: "testSelectString",
      testSelectString2: "not-existing-option",
      testSelectObj1: "test-select-obj",
      testSelectObj2: {},
      testSelectObj3: "not-existing-option"
    });
  });

  test("Prepare for server - select - returns null for '', null and undefined in state", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const { formData, validate, prepareForServer } = useForm(
        {
          testSelect1: {
            formElement: formElements.select
          },
          testSelect2: {
            formElement: formElements.select
          },
          testSelect3: {
            formElement: formElements.select
          }
        },
        {
          testSelect1: null,
          testSelect2: "",
          testSelect3: undefined
        }
      );

      return (
        <div>
          {formData.testSelect1.render({})}
          {formData.testSelect2.render()}
          {formData.testSelect3.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}
          >
            Submit form
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue } = render(<TestForm />);

    fireEvent.click(getByText("Submit form"));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testSelect1: null,
      testSelect2: null,
      testSelect3: null,
    });
  });

  test.skip("Prepare for server - multi select", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const { formData, validate, prepareForServer } = useForm(
        {
          testMultiSelect1: {
            formElement: formElements.multiSelect
          },
          testMultiSelect2: {
            formElement: formElements.multiSelect
          },
          testMultiSelect3: {
            formElement: formElements.multiSelect
          },
          testMultiSelect4: {
            formElement: formElements.multiSelect
          },
          testMultiSelect5: {
            formElement: formElements.multiSelect
          },
        },
        {
          testMultiSelect1: [{ value: "multi-select1", label: "Test Multi Select1" }, { value: "multi-select2", label: "Test Multi Select2" }],
          testMultiSelect2: [],
          testMultiSelect3: [{ value: "multi-select1", label: "Test Multi Select1" }],
          testMultiSelect4: null,
          testMultiSelect5: undefined,
        }
      );

      return (
        <div>
          {formData.testMultiSelect1.render({
            options:[{ value: "multi-select1", label: "Test Multi Select1" }, { value: "multi-select2", label: "Test Multi Select2" }]
          })}
          {formData.testMultiSelect2.render()}
          {formData.testMultiSelect3.render({
            options:[{ value: "multi-select1", label: "Test Multi Select1" }, { value: "multi-select2", label: "Test Multi Select2" }]
          })}
          {formData.testMultiSelect4.render()}
          {formData.testMultiSelect5.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}
          >
            Submit form
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue } = render(<TestForm />);

    fireEvent.click(getByText("Submit form"));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testMultiSelect1: ["multi-select1", "multi-select2"],
      testMultiSelect2: [],
      testMultiSelect2: ["multi-select1"],
      testMultiSelect4: null,
      testMultiSelect5: null
    });
  });

});

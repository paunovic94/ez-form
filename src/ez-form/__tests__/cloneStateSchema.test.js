import React from "react";
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  waitForDomChange,
  getByTestId,
  queryByTestId,
  wait
} from "react-testing-library";
import useForm from "../index";
import formElements, {formatDate} from "./formTestElements";

describe("Clone state schema values", () => {
    test("cloneStateValues input", () => {
      let initialValuesObj = {
        testInputText1: "Test 1",
        testInputText2: "",
        testInputText3: undefined,
        testInputText4: null,
        testInputText5: [],
        testInputText6: 1
      };
  
      function TestForm(props) {
        const { formData, cloneStateValues } = useForm(
          {
            testInputText1: {
              formElement: formElements.textInput
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
              formElement: formElements.textInput
            },
            testInputText6: {
              formElement: formElements.textInput
            }
          },
          initialValuesObj
        );
  
        return (
          <div>
            {formData.testInputText1.render()}
            {formData.testInputText2.render()}
            {formData.testInputText3.render()}
            {formData.testInputText4.render()}
            {formData.testInputText5.render()}
            {formData.testInputText6.render()}
            <button
              onClick={() => {
                {
                  let clonedState = cloneStateValues();
                  expect(clonedState).toEqual({
                    testInputText1: "Test 1",
                    testInputText2: "",
                    testInputText3: '',
                    testInputText4: '',
                    testInputText5: [],
                    testInputText6: 1
                  });
                }
              }}
            >
              Clone schema values
            </button>
          </div>
        );
      }
  
      const { container, getByText } = render(<TestForm />);
      fireEvent.click(getByText("Clone schema values"));
    });
  
    test("cloneStateValues select", () => {
      function TestForm(props) {
        const { formData, cloneStateValues } = useForm({
          testSelectString: {
            formElement: formElements.select,
            defaultValue: "Test Select"
          },
          testSelectObj: {
            formElement: formElements.select,
            defaultValue: { value: "test-select", label: "Test Select" }
          },
          testMultiSelect1: {
            formElement: formElements.multiSelect,
            defaultValue: [{ value: "multi-select", label: "Test Multi Select" }]
          },
          testMultiSelect2: {
            formElement: formElements.multiSelect,
            defaultValue: []
          }
        });
  
        return (
          <div>
            <button
              onClick={() => {
                {
                  let clonedState = cloneStateValues();
                  expect(clonedState).toEqual({
                    testSelectString: "Test Select",
                    testSelectObj: { value: "test-select", label: "Test Select" },
                    testMultiSelect1: [
                      { value: "multi-select", label: "Test Multi Select" }
                    ],
                    testMultiSelect2: []
                  });
                }
              }}
            >
              Clone schema values
            </button>
          </div>
        );
      }
  
      const { container, getByText } = render(<TestForm />);
      fireEvent.click(getByText("Clone schema values"));
    });

    test("Checkbox", () => {
      let onSubmitMock = jest.fn();
      let initialValuesObj = {
        checkbox1: "true",
        checkbox2: true,
        checkbox3: undefined,
        checkbox4: null,
        checkbox5: ""
      };
  
      function TestForm(props) {
        const { formData, validate, cloneStateValues } = useForm(
          {
            checkbox1: {
              formElement: formElements.checkbox,
              defaultValue: true
            },
            checkbox2: {
              formElement: formElements.checkbox
            },
            checkbox3: {
              formElement: formElements.checkbox
            },
            checkbox4: {
              formElement: formElements.checkbox
            },
            checkbox5: {
              formElement: formElements.checkbox
            }
          },
          initialValuesObj
        );
  
        return (
          <div>
            {formData.checkbox1.render()}
            {formData.checkbox2.render()}
            {formData.checkbox3.render()}
            {formData.checkbox4.render()}
            {formData.checkbox5.render()}
            <button
              onClick={() => {
                let clonedState = cloneStateValues();
                  expect(clonedState).toEqual(initialValuesObj);
              }}
            >
              Submit form
            </button>
          </div>
        );
      }

      const { container, getByText, getByValue } = render(<TestForm />);
      fireEvent.click(getByText("Clone schema values"));
    });
  
  });
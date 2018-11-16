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

describe("Get schema state value", () => {
    test.skip("Get value from state - input field", () => {
      function TestForm(props) {
        const { formData, getSchemaStateValue } = useForm({
          testInputText1: {
            formElement: formElements.textInput,
            defaultValue: "Test",
            name: "testInputText1"
          },
          testInputText2: {
            formElement: formElements.textInput,
            defaultValue: undefined,
            name: "testInputText2"
          }
        });
  
        return (
          <div>
            {formData.testInputText1.render()}
            {formData.testInputText2.render()}
  
            <button
              onClick={() => {
                {
                  let inputValue1 = getSchemaStateValue("testInputText1");
                  let inputValue2 = getSchemaStateValue("testInputText2");
  
                  expect(inputValue1).toEqual("Test");
                  expect(inputValue2).toEqual("");
                }
              }}
            >
              Get input values
            </button>
          </div>
        );
      }
  
      const { container, getByText } = render(<TestForm />);
  
      const inputs = container.querySelectorAll("input");
  
      expect(inputs[0].value).toBe("Test");
      expect(inputs[1].value).toBe("");
  
      fireEvent.click(getByText("Get input values"));
    });
  
    test.skip("Get value from state - select/multi select", () => {
      function TestForm(props) {
        const { formData, getSchemaStateValue } = useForm({
          testSelectString: {
            formElement: formElements.textInput,
            defaultValue: "Test Select",
            name: "testSelectString"
          },
          testSelectObj: {
            formElement: formElements.textInput,
            defaultValue: { value: "test-select", label: "Test Select" },
            name: "testSelectObj"
          },
          testSelectMulti: {
            formElement: formElements.textInput,
            defaultValue: [{ value: "test-multi", label: "Test Select Multi" }],
            name: "testSelectMulti"
          }
        });
  
        return (
          <div>
            {formData.testSelectString.render()}
            {formData.testSelectObj.render()}
            {formData.testSelectMulti.render()}
            <button
              onClick={() => {
                {
                  let select1 = getSchemaStateValue("testSelectString");
                  let select2 = getSchemaStateValue("testSelectObj");
                  let select3 = getSchemaStateValue("testSelectMulti");
  
                  expect(select1).toEqual("Test Select");
                  expect(select2).toEqual({
                    value: "test-select",
                    label: "Test Select"
                  });
                  expect(select3).toEqual([
                    { value: "test-multi", label: "Test Select Multi" }
                  ]);
                }
              }}
            >
              Get select values
            </button>
          </div>
        );
      }
  
      const { container, getByText } = render(<TestForm />);
  
      fireEvent.click(getByText("Get select values"));
    });
  });
  
  
  
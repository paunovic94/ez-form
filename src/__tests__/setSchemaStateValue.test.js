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
import {isMaxLength, isName} from "./validation.test";

describe("Set schema state value", () => {
    test("Set schema state value without validation", async () => {
      function TestForm() {
        const { formData, setSchemaStateValue } = useForm({
          testInputText1: {
            formElement: formElements.textInput,
            name: "testInputText1",
            label: "testInputText1",
            validationRules: [
              {
                fn: isMaxLength,
                args: {
                  maxLength: 3
                }
              }
            ]
          }
        });
  
        return (
          <div>
            {formData.testInputText1.render()}
            <button
              onClick={() => {
                setSchemaStateValue({
                  fullFieldName: "testInputText1",
                  newValue: "Test",
                  skipValidation: true
                });
              }}
            >
              Set schema test value
            </button>
          </div>
        );
      }
  
      const { container, getByText, getByValue, getByLabelText, queryByText } = render(
        <TestForm />
      );
  
      expect(getByLabelText("Label: testInputText1").value).toBe("");
  
      fireEvent.click(getByText("Set schema test value"));
      let testInputText1 = await waitForElement(
        () => getByValue("Test"),
        container
      );
  
      expect(testInputText1.value).toBe("Test");
      expect(queryByText("Error: Max length is 3")).toBeNull();
    });
  
    test("Set schema state select value ", async () => {
      function TestForm() {
        const { formData, setSchemaStateValue } = useForm({
          testSelect: {
            formElement: formElements.select,
            name: "testSelect",
            label: "testSelect"
          }
        });
  
        return (
          <div>
            {formData.testSelect.render()}
            <button
              onClick={() => {
                setSchemaStateValue({
                  fullFieldName: "testSelect",
                  newValue: { value: "Test", label: "Test" },
                  skipValidation: true
                });
              }}
            >
              Set schema test value
            </button>
          </div>
        );
      }
  
      const { container, getByText, getByValue, getByLabelText, queryByText } = render(
        <TestForm />
      );
      expect(container.querySelector("input").value).toBe("");
  
      fireEvent.click(getByText("Set schema test value"));
      await wait(() => expect(queryByText("Test")).toBeTruthy(), container);
    });
  
    test("Set schema state value with validation", async () => {
      function TestForm() {
        const { formData, setSchemaStateValue } = useForm({
          testInputText1: {
            formElement: formElements.textInput,
            name: "testInputText1",
            label: "testInputText1",
            validationRules: [
              {
                fn: isMaxLength,
                args: {
                  maxLength: 3
                }
              }
            ]
          },
          testInputText2: {
            formElement: formElements.textInput,
            name: "testInputText2",
            label: "testInputText2",
            validationRules: [
              {
                fn: isName
              }
            ]
          }
        });
  
        return (
          <div>
            {formData.testInputText1.render()}
            {formData.testInputText2.render()}
            <button
              onClick={() => {
                setSchemaStateValue({
                  fullFieldName: "testInputText1",
                  newValue: "Test"
                });
                setSchemaStateValue({
                  fullFieldName: "testInputText2",
                  newValue: "Test2"
                });
              }}
            >
              Set schema test value
            </button>
          </div>
        );
      }
  
      const {
        container,
        queryByText,
        getByText,
        getByValue,
        getByLabelText
      } = render(<TestForm />);
  
      fireEvent.click(getByText("Set schema test value"));
  
      await wait(
        () => [
          expect(getByLabelText("Label: testInputText1").value).toBe("Test"),
          expect(getByLabelText("Label: testInputText2").value).toBe("Test2")
        ],
        {
          container
        }
      );
  
      expect(queryByText("Error: Max length is 3")).toBeTruthy();
      expect(queryByText("Error: Is name default")).toBeTruthy();
      // Question: if input 1 has validate another field and we change it with setSchemaStateValue,
      // should we validate another field?
    });
  
    test("Set schema state value with callback onComplete", async () => {
      let onCompleteMock = jest.fn();
  
      function TestForm() {
        const { formData, setSchemaStateValue } = useForm({
          testInputText1: {
            formElement: formElements.textInput,
            name: "testInputText1",
            label: "testInputText1"
          }
        });
  
        return (
          <div>
            {formData.testInputText1.render()}
            <button
              onClick={() => {
                setSchemaStateValue({
                  fullFieldName: "testInputText1",
                  newValue: "Test",
                  skipValidation: true,
                  onComplete: onCompleteMock
                });
              }}
            >
              Set schema test value
            </button>
          </div>
        );
      }
  
      const { container, getByText, getByValue, getByLabelText } = render(
        <TestForm />
      );
  
      expect(getByLabelText("Label: testInputText1").value).toBe("");
      fireEvent.click(getByText("Set schema test value"));
  
      await waitForElement(() => getByValue("Test"), container);
      expect(onCompleteMock).toHaveBeenCalled();
    });
  
    test.skip("Set schema state value bulk", async () => {
      function TestForm() {
        const { formData, setSchemaStateValueBulk } = useForm({
          testInputText1: {
            formElement: formElements.textInput,
            name: "testInputText1",
            label: "testInputText1"
          },
          testInputText2: {
            formElement: formElements.textInput,
            name: "testInputText2",
            label: "testInputText2"
          }
        });
  
        return (
          <div>
            {formData.testInputText1.render()}
            <button
              onClick={() => {
                setSchemaStateValueBulk({
                  testInputText1: "Test 1",
                  testInputText1: "Test 2"
                });
              }}
            >
              Set schema test value
            </button>
          </div>
        );
      }
  
      const { container, getByText, getByValue, getByLabelText } = render(
        <TestForm />
      );
  
      expect(getByLabelText("Label: testInputText1").value).toBe("");
      expect(getByLabelText("Label: testInputText2").value).toBe("");
  
      fireEvent.click(getByText("Set schema test value"));
  
      await waitForElement(
        () => [getByValue("Test 1"), getByValue("Test 2")],
        container
      );
    });
  });
  
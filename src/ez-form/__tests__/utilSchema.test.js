import { render, cleanup, fireEvent, wait } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";
import React from "react";
import { isMaxLength } from "./validation.test";

afterEach(cleanup);

describe(" Test utiliti functions for schema", () => {
  test("Prepare for server", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const { formData, validate, prepareForServer } = useForm(
        {
          testInputText: {
            formElement: formElements.textInput,
            name: "testInputText1",
            defaultValue: "testInputText default"
          },
          testSelect: {
            formElement: formElements.select,
            name: "testSelect",
            validationRules: []
          },
          testSelect2: {
            formElement: formElements.select,
            name: "testSelect",
            validationRules: []
          }
        },
        {
          testInputText: "testInputText",
          testSelect: {
            value: "test-select",
            label: "Test Select"
          },
          testSelect2: {
            value: { value: "testSelect2", label: "testSelect2" },
            label: "testSelect2"
          }
        }
      );

      //   let [nonSchemaField, setNonSchemaField] = useState("nonSchemaField");

      return (
        <div>
          {formData.testInputText.render()}
          {formData.testSelect.render({
            options: [{ value: "test-select", label: "Test Select" }]
          })}
          {formData.testSelect2.render({
            options: [
              {
                value: { value: "testSelect2", label: "testSelect2" },
                label: "testSelect2"
              }
            ]
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
      testInputText: "testInputText",
      testSelect: "test-select",
      testSelect2: { value: "testSelect2", label: "testSelect2" }
    });
  });

  test("Prepare for server - returns null for '', null and undefined in state", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const { formData, validate, prepareForServer } = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
            name: "testInputText1"
          },
          testInputText2: {
            formElement: formElements.textInput,
            name: "testInputText2"
          },
          testSelect1: {
            formElement: formElements.select,
            name: "testSelect1",
            validationRules: []
          },
          testSelect2: {
            formElement: formElements.select,
            name: "testSelect2",
            validationRules: []
          },
          testSelect3: {
            formElement: formElements.select,
            name: "testSelect3",
            validationRules: []
          }
        },
        {
          testInputText1: "",
          testInputText2: undefined,
          testSelect1: null,
          testSelect2: "",
          testSelect3: undefined
        }
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testSelect1.render({
            options: []
          })}
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
      testInputText1: null,
      testInputText2: null,
      testSelect1: null,
      testSelect2: null,
      testSelect3: null
    });
  });

  test.skip("Set schema state value without validation", async () => {
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

    const { container, getByText, getByValue, getByLabelText } = render(
      <TestForm />
    );

    expect(getByLabelText("Label: testInputText1").value).toBe("");

    fireEvent.click(getByText("Set schema test value"));
    let testInputText1 = await waitForElement(()=>getByValue("Test"), container);

    expect(testInputText1.value).toBe("Test");
    expect(queryByText("Error: Max length is 3")).toBeNull();
  });

  test.skip("Set schema state value with validation", async () => {
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
              fn: isName,
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

  test.skip("Set schema state value with callback onComplete", async () => {
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

    await waitForElement(()=>getByValue("Test"), container);
    expect(onCompleteMock).toHaveBeenCalled()
  });
});

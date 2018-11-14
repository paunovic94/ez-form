import { render, cleanup, fireEvent } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";
import React from "react";

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
          testSelect1: "non-existing-value",
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
});

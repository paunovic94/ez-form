import React from "react";
import { render, cleanup, fireEvent } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

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
          }
        },
        {
          testInputText: "testInputText",
          testSelect: {
            value: "test-select",
            label: "Test Select"
          }
        }
      );

      return (
        <div>
          {formData.testInputText.render()}
          {formData.testSelect.render({
            options: [{ value: "test-select", label: "Test Select" }]
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

    expect(onSubmitMock.mock.calls[0][0]).toBe({
      testInputText: "testInputText",
      testSelect: "test-select"
    });
  });
});

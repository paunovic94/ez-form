import React from "react";
import { render, cleanup, fireEvent } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

afterEach(cleanup);

describe("init default value from schema", () => {
  test("Text Input", () => {
    function TestForm(props) {
      const formData = useForm({
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

    fireEvent.change(inputs[1], { target: { value: "test2" } });

    expect(inputs[0].value).toBe("test-input-text");
    expect(inputs[1].value).toBe("");
  });

  test("Select", () => {
    function TestForm(props) {
      const formData = useForm({
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
            options: [{ value: "test-select", label: "Test Select" }]
          })}
          {formData.testSelectObjectValue.render({
            options: [{ value: "test-select", label: "Test Select" }]
          })}
        </div>
      );
    }

    const { queryByText } = render(<TestForm />);

    expect(queryByText("Test Select")).toBeTruthy();
    expect(queryByText("Test Select Default")).toBeTruthy();
  });
});

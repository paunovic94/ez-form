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

  test.skip("IsVisible flag in schema", () => {
    function TestForm(props) {
      const formData = useForm({
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
});

describe("Init value in schema with second arg in useForm", () => {
  test.skip("Text input", () => {
    function TestForm(props) {
      const formData = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
            defaultValue: "testInputText1",
            name: "testInputText1"
          },
          testInputText2: {
            formElement: formElements.textInput,
            name: "testInputText2"
          }
        },
        { testInputText1: "initText1", testInputText2: "initText2" }
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
        </div>
      );
    }

    const { container } = render(<TestForm />);

    const inputs = container.querySelectorAll("input");

    expect(inputs[0].value).toBe("initText1");
    expect(inputs[1].value).toBe("initText2");
  });

  test.skip("Select", () => {
    function TestForm(props) {
      const formData = useForm(
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
            options: [{ value: "test-select", label: "Test Select Init 1" }]
          })}
          {formData.testSelectObjectValue.render({
            options: [{ value: "test-select", label: "Test Select Init 2" }]
          })}
        </div>
      );
    }

    const { queryByText } = render(<TestForm />);

    expect(queryByText("Test Select Init 1")).toBeTruthy();
    expect(queryByText("Test Select Init 2")).toBeTruthy();
  });
})

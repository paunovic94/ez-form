import React from "react";
import { render, cleanup, fireEvent, waitForElement } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

afterEach(cleanup);

describe("Test render additional options", () => {
  test("IsVisible flag", () => {
    function TestForm(props) {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "testInputText1",
          name: "testInputText1"
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          defaultValue: "testInputText2"
        }
      });

      return (
        <div>
          {formData.testInputText1.render({ isVisible: true })}
          {formData.testInputText2.render({ isVisible: false })}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);
    const TextInputComponents = container.querySelectorAll(".TestTextInput");

    expect(TextInputComponents[0]).toBeTruthy();
    expect(TextInputComponents[1]).not.toBeTruthy();
  });

  test("IsDisabled flag", () => {
    function TestForm(props) {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "testInputText1",
          name: "testInputText1"
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          defaultValue: "testInputText2"
        },
        testInputText3: {
          formElement: formElements.textInput,
          name: "testInputText3",
          defaultValue: "testInputText3"
        },
        testSelect: {
          formElement: formElements.select,
          defaultValue: "test-select"
        }
      });

      return (
        <div>
          {formData.testInputText1.render({ disabled: true })}
          {formData.testInputText2.render({ disabled: false })}
          {formData.testInputText3.render()}
          {formData.testSelect.render({
            options: [{ value: "test-select", label: "Test Select" }],
            disabled: false
          })}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);
    const inputs = container.querySelectorAll("input");

    expect(inputs[0].disabled).toBeTruthy();
    expect(inputs[1].disabled).not.toBeTruthy();
    expect(inputs[2].disabled).not.toBeTruthy();
    expect(inputs[3].disabled).not.toBeTruthy();
  });

  test("Trigger an action on text input change", async () => {
    function TestForm() {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput
        }
      });

      return <div>{formData.testInputText1.render()}</div>;
    }

    const { container, getByValue } = render(<TestForm />);

    const input = container.querySelector("input");
    let handleInputChangeMock = jest.fn();

    fireEvent.change(input, {
      target: { value: "test1", onChange: handleInputChangeMock }
    });
    await waitForElement(() => [getByValue("test1")], {
      container
    });

    expect(handleInputChangeMock).toHaveBeenCalled();
  });
});

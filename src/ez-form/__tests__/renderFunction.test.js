import React from "react";
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  wait
} from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

afterEach(cleanup);

describe("Test render additional options", () => {
  test("IsVisible flag", () => {
    function TestForm(props) {
      const { formData } = useForm({
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
      const { formData } = useForm({
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

    const { container } = render(<TestForm />);
    const inputs = container.querySelectorAll("input");

    expect(inputs[0].disabled).toBeTruthy();
    expect(inputs[1].disabled).not.toBeTruthy();
    expect(inputs[2].disabled).not.toBeTruthy();
    expect(inputs[3].disabled).not.toBeTruthy();
  });

  test("Trigger an action on text input change", async () => {
    let handleInputChangeMock = jest.fn();

    function TestForm() {
      const { formData } = useForm({
        testInputText1: {
          formElement: formElements.textInput
        }
      });

      return (
        <div>
          {formData.testInputText1.render({ onChange: handleInputChangeMock })}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);

    const input = container.querySelector("input");

    fireEvent.change(input, {
      target: { value: "test1" }
    });
    let a = await waitForElement(() => getByValue("test1"), {
      container
    });

    expect(handleInputChangeMock).toHaveBeenCalled();
  });

  test("Trigger an action on select input change", async () => {
    let handleInputChangeMock = jest.fn();
    let handleInputChangeMultiMock = jest.fn();

    function TestForm() {
      const { formData } = useForm({
        testSelect: {
          formElement: formElements.select
        },
        testMultiSelect: {
          formElement: formElements.multiSelect
        }
      });

      return (
        <div>
          {formData.testSelect.render({
            options: [
              {
                value: "test-select",
                label: "Test Select"
              }
            ],
            onInputChange: handleInputChangeMock
          })}
          {formData.testMultiSelect.render({
            options: [
              {
                value: "test-select-multi",
                label: "Test Select Multi"
              }
            ],
            onInputChange: handleInputChangeMultiMock
          })}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);
    const selectInput = container.querySelector(".TestSelect input");
    const multiSelectInput = container.querySelector(".TestMultiSelect input");

    fireEvent.change(selectInput, {
      target: { value: "test" }
    });
    fireEvent.change(multiSelectInput, {
      target: { value: "test multi" }
    });
    await waitForElement(() => [getByValue("test"), getByValue("test multi")], {
      container
    });

    expect(handleInputChangeMock).toHaveBeenCalled();
    expect(handleInputChangeMock.mock.calls[0][0]).toEqual("test");
    expect(handleInputChangeMultiMock).toHaveBeenCalled();
    expect(handleInputChangeMultiMock.mock.calls[0][0]).toEqual("test multi");
  });

  test("Trigger an action on select option change", async () => {
    let handleChangeOptionMock = jest.fn();
    let handleChangeMultiOptionMock = jest.fn();

    function TestForm() {
      const { formData } = useForm({
        testSelect: {
          formElement: formElements.select
        },
        testMultiSelect: {
          formElement: formElements.multiSelect
        }
      });

      return (
        <div>
          {formData.testSelect.render({
            options: [
              {
                value: "test-select",
                label: "Test Select"
              }
            ],
            onChangeTestValue: { value: "test-select", label: "Test Select" },
            onChange: handleChangeOptionMock
          })}
          {formData.testMultiSelect.render({
            options: [
              {
                value: "test-multi",
                label: "Test multi select"
              }
            ],
            onChangeTestValue: [
              {
                value: "test-multi",
                label: "Test multi select"
              }
            ],
            onChange: handleChangeMultiOptionMock
          })}
        </div>
      );
    }

    const { container, getByText } = render(<TestForm />);
    const testSelect = container.querySelector(".TestSelect");
    const testSelectMulti = container.querySelector(".TestMultiSelect");

    fireEvent.click(testSelect);
    fireEvent.click(testSelectMulti);

    await waitForElement(
      () => [getByText("Test Select"), getByText("Test multi select")],
      {
        container
      }
    );

    expect(handleChangeOptionMock).toHaveBeenCalled();
    expect(handleChangeOptionMock.mock.calls[0][0]).toEqual({
      value: "test-select",
      label: "Test Select"
    });
    expect(handleChangeMultiOptionMock).toHaveBeenCalled();
    expect(handleChangeMultiOptionMock.mock.calls[0][0]).toEqual([
      {
        value: "test-multi",
        label: "Test multi select"
      }
    ]);
  });

  test.skip("Trigger an action on checkbox change", async () => {
    let handleCheckboxChangeMock = jest.fn();

    function TestForm() {
      const { formData } = useForm({
        checkbox1: {
          formElement: formElements.checkbox
        }
      });

      return (
        <div>
          {formData.checkbox1.render({ onChange: handleCheckboxChangeMock })}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);

    const input = container.querySelector("input");

    fireEvent.change(input, {
      target: { value: true, checked: true }
    });

    await wait(() => expect(container.querySelector("input").checked).toBeTruthy(), {
      container
    });

    expect(handleCheckboxChangeMock).toHaveBeenCalled();
  });
});

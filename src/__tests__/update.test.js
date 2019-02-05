import React from "react";
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  wait,
} from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

afterEach(cleanup);

describe("Update form data on input change", () => {
  test("Text Input", async () => {
    function TestForm() {
      const { formData } = useForm({
        testInputText1: {
          formElement: formElements.textInput
        },
        testInputText2: {
          formElement: formElements.textInput
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
        </div>
      );
    }

    const { container, getByValue, debug } = render(<TestForm />);
    const [input1, input2] = container.querySelectorAll("input");

    fireEvent.change(input1, { target: { value: "test1" } });
    fireEvent.change(input2, { target: { value: "test2" } });

    await waitForElement(() => [getByValue("test1"), getByValue("test2")], {
      container
    });
  });

  test("Select", async () => {
    function TestForm() {
      const { formData } = useForm({
        testSelect1: {
          formElement: formElements.select
        },
        testSelect2: {
          formElement: formElements.select,
          defaultValue: "option-default"
        }
      });

      return (
        <div>
          {formData.testSelect1.render({
            selectOptions: [
              { value: "option-default", label: "Test Default 1" },
              { value: "option-1", label: "Test 1" }
            ],
            onChangeTestValue: { value: "option-1", label: "Test 1" }
          })}
          {formData.testSelect2.render({
            selectOptions: [{ value: "option-default", label: "Test Default 2" }],
            onChangeTestValue: null
          })}
        </div>
      );
    }

    const { container, getByText, queryByText } = render(<TestForm />);

    const [select1, select2] = container.querySelectorAll(".TestSelect");

    fireEvent.click(select1);
    fireEvent.click(select2);

    await waitForElement(() => getByText("Test 1"), {
      container
    });

    expect(queryByText("Test Default 2")).toBeNull();
  });

  test("Multi Select", async () => {
    function TestForm() {
      const { formData } = useForm({
        testSelectMulti1: {
          formElement: formElements.multiSelect,
          name: "testSelectMulti1",
          defaultValue: [{ value: "test-select1", label: "Test Select1" }]
        },
        testSelectMulti2: {
          formElement: formElements.multiSelect,
          name: "testSelectMulti2",
          defaultValue: [
            { value: "multi-select-to-remove", label: "Test Remove" }
          ]
        }
      });

      return (
        <div>
          {formData.testSelectMulti1.render({
            selectOptions: [
              { value: "test-select1", label: "Test Select1" },
              { value: "test-select2", label: "Test Select2" }
            ],
            onChangeTestValue: [
              { value: "test-select1", label: "Test Select1" },
              { value: "test-select2", label: "Test Select2" }
            ]
          })}
          {formData.testSelectMulti2.render({
            selectOptions: [
              { value: "multi-select-to-remove", label: "Test Remove" }
            ],
            onChangeTestValue: []
          })}
        </div>
      );
    }

    const { container, getByText, queryByText, debug } = render(<TestForm />);
    const [select1, select2] = container.querySelectorAll("input");

    expect(queryByText("Test Select1")).toBeTruthy();
    expect(queryByText("Test Remove")).toBeTruthy();

    fireEvent.click(select1);
    fireEvent.click(select2);

    await wait(
      () => [
        expect(queryByText("Test Select1")).toBeTruthy(),
        expect(queryByText("Test Select2")).toBeTruthy(),
        expect(queryByText("Test Remove")).not.toBeTruthy()
      ],
      {
        container
      }
    );
  });

  test("Checkbox", async () => {
    function TestForm() {
      const { formData } = useForm({
        checkbox1: {
          formElement: formElements.checkbox,
          name: "checkbox1",
          label: "checkbox1",
          defaultValue: true
        },
      });

      return (
        <div>
          {formData.checkbox1.render()}
        </div>
      );
    }

    const { container } = render(<TestForm />);
    const checkbox1 = container.querySelector(".checkbox1 input")

    expect(container.querySelector(".checkbox1 input").checked).toBeTruthy();
    expect(container.querySelector(".checkbox1 input").type).toBe("checkbox");
    fireEvent.click(container.querySelector(".checkbox1 input"));

    await wait(
      () => [
        expect(container.querySelector(".checkbox1 input").checked).not.toBeTruthy()
      ],
      {
        container
      }
    );

    fireEvent.click(container.querySelector(".checkbox1 input"));
    await wait(
      () => [
        expect(container.querySelector(".checkbox1 input").checked).toBeTruthy()
      ],
      {
        container
      }
    );
  });

  test("Text Area", async () => {
    function TestForm() {
      const { formData } = useForm({
        testAreaText1: {
          formElement: formElements.textArea
        },
      });

      return (
        <div>
          {formData.testAreaText1.render()}
        </div>
      );
    }

    const { container, getByText, debug } = render(<TestForm />);
    const [textarea1] = container.querySelectorAll('textarea');

    textarea1.innerHTML = 'test1';

    await waitForElement(() => [getByText('test1'), ], {
      container
    });
  });
});

import React from "react";
import {
  render,
  cleanup,
  fireEvent,
  waitForElement
} from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

afterEach(cleanup);

describe("Update form data on input change", () => {
  test("Text Input", async () => {
    function TestForm() {
      const formData = useForm({
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

    const { container, getByValue } = render(<TestForm />);

    const [input1, input2] = container.querySelectorAll("input");

    fireEvent.change(input1, { target: { value: "test1" } });
    fireEvent.change(input2, { target: { value: "test2" } });

    await waitForElement(() => [getByValue("test1"), getByValue("test2")], {
      container
    });
  });

  test("Select", async () => {
    function TestForm() {
      const formData = useForm({
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
            options: [
              { value: "option-default", label: "Test Default 1" },
              { value: "option-1", label: "Test 1" }
            ],
            onChangeTestValue: { value: "option-1", label: "Test 1" }
          })}
          {formData.testSelect2.render({
            options: [{ value: "option-default", label: "Test Default 2" }],
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
});

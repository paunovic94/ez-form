import React from "react";
import { render, cleanup, fireEvent, waitForElement } from "react-testing-library";
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

    await waitForElement(
      () => [
        getByValue('test1'),
        getByValue('test2'),
      ],
      {container},
    );

    // expect(input1.value).toBe("test1");
    // expect(input2.value).toBe("test2");
  });
});

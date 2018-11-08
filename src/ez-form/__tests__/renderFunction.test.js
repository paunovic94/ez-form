import React from "react";
import { render, cleanup, fireEvent } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

afterEach(cleanup);

describe("Test render additional options", () => {
  test.skip("IsVisible flag", () => {
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
});

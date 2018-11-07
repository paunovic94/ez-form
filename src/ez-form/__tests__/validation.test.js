import React from "react";
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  getByText as getByTextGlobal,
  queryByText as queryByTextGlobal
} from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";

function isRequired({ value, message }) {
  if (!value) {
    return message || "Is required default";
  }
  return "";
}

function isName({ value, message }) {
  if (value && /^[a-zA-Z]*$/.test(value)) {
    return message || "Is name default";
  }
  return "";
}

afterEach(cleanup);

describe("Validate form data on input change", () => {
  test("Validate only changed input", async () => {
    function TestForm() {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "text1",
          validationRules: [
            {
              fn: isRequired
            },
            {
              fn: isName
            }
          ]
        },
        testInputText2: {
          formElement: formElements.textInput,
          validationRules: [
            {
              fn: isName
            },
          ]
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
    const [inputWrapper1, inputWrapper2] = container.querySelectorAll(".TestTextInput");

    fireEvent.change(input1, { target: { value: "" } });
    
    await waitForElement(() => getByValue(""), {
        inputWrapper1
    });

    let errorMessage1 = queryByTextGlobal(inputWrapper1, "Is required default"); 
    let errorMessage2 = inputWrapper2.querySelector(".Error");

    expect(errorMessage1).toBeTruthy();
    expect(errorMessage2).toBeNull();

    fireEvent.change(input1, { target: { value: "text" } });
    fireEvent.change(input2, { target: { value: "222" } });

    await waitForElement(() => [getByValue("text"), getByValue("222")], {
        container
    });

    errorMessage1 = inputWrapper1.querySelector(".Error");
    errorMessage2 = queryByTextGlobal(inputWrapper2, "Is name default");

    expect(errorMessage1).toBeNull();
    expect(errorMessage2).toBeTruthy();

  });
});

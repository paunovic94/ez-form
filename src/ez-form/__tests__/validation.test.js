import React from "react";
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
//   getByText as getByTextGlobal,
//   queryByText as queryByTextGlobal
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

function isMaxLength({value, args = {}}) {
  if (value && value.length > args.maxLength) {
    return "Max length is " + args.maxLength;
  }
}

afterEach(cleanup);

describe("Validate form data on input change", () => {
  test("Validate only changed input", async () => {
    function TestForm() {
      const formData = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "text1",
          name: "testInputText1",
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
          name: "testInputText2",
          validationRules: [
            {
              fn: isName,
              message: "Is name custom"
            }
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
    const [inputWrapper1, inputWrapper2] = container.querySelectorAll(
      ".TestTextInput"
    );

    fireEvent.change(input1, { target: { value: "" } });

    await waitForElement(() => getByValue(""), {
      inputWrapper1
    });

    let errorMessage1 = container.querySelector(".testInputText1 > .Error");
    let errorMessage2 = container.querySelector(".testInputText2 > .Error");

    expect(errorMessage1.innerHTML).toBe('Is required default')
    expect(errorMessage2).toBeNull();

    fireEvent.change(input1, { target: { value: "text" } });
    fireEvent.change(input2, { target: { value: "222" } });

    await waitForElement(() => [getByValue("text"), getByValue("222")], {
      container
    });


    errorMessage1 =  container.querySelector(".testInputText1 > .Error");
    errorMessage2 = container.querySelector(".testInputText2 > .Error");

    expect(errorMessage1).toBeNull();
    expect(errorMessage2.innerHTML).toBe('Is name custom');
  });

  test.skip("Args property for validation function", async () => {
    function TestForm() {
      const formData = useForm({
        testInputText: {
          formElement: formElements.textInput,
          validationRules: [
            {
              fn: isMaxLength,
              args : {
                  maxLength : 3
              }
            }
          ]
        }
      });

      return (
        <div>
          {formData.testInputText.render()}
        </div>
      );
    }

    const { container, getByValue } = render(<TestForm />);

    const [input] = container.querySelectorAll("input");
    const [testInputText] = container.querySelectorAll(
      ".TestTextInput"
    );

    fireEvent.change(input, { target: { value: "text" } });

    await waitForElement(() => [getByValue("text")], {
        container
    });

    let errorMessage = inputWrapper.querySelector(".Error");
    expect(errorMessage).toBe("Max length is 3");

  });
});

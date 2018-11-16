import { render, cleanup, fireEvent, wait } from "react-testing-library";
import useForm from "../index";
import formElements from "./formTestElements";
import React from "react";
import { isMaxLength } from "./validation.test";

afterEach(cleanup);

describe("Test utiliti functions for schema", () => {
  test("Prepare for server", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const { formData, validate, prepareForServer } = useForm(
        {
          testInputText: {
            formElement: formElements.textInput,
            name: "testInputText1",
            defaultValue: "testInputText default"
          },
          testSelect: {
            formElement: formElements.select,
            name: "testSelect",
            validationRules: []
          },
          testSelect2: {
            formElement: formElements.select,
            name: "testSelect",
            validationRules: []
          }
        },
        {
          testInputText: "testInputText",
          testSelect: {
            value: "test-select",
            label: "Test Select"
          },
          testSelect2: {
            value: { value: "testSelect2", label: "testSelect2" },
            label: "testSelect2"
          }
        }
      );

      //   let [nonSchemaField, setNonSchemaField] = useState("nonSchemaField");

      return (
        <div>
          {formData.testInputText.render()}
          {formData.testSelect.render({
            options: [{ value: "test-select", label: "Test Select" }]
          })}
          {formData.testSelect2.render({
            options: [
              {
                value: { value: "testSelect2", label: "testSelect2" },
                label: "testSelect2"
              }
            ]
          })}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}
          >
            Submit form
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue } = render(<TestForm />);

    fireEvent.click(getByText("Submit form"));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testInputText: "testInputText",
      testSelect: "test-select",
      testSelect2: { value: "testSelect2", label: "testSelect2" }
    });
  });

  test("Prepare for server - returns null for '', null and undefined in state", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const { formData, validate, prepareForServer } = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
            name: "testInputText1"
          },
          testInputText2: {
            formElement: formElements.textInput,
            name: "testInputText2"
          },
          testSelect1: {
            formElement: formElements.select,
            name: "testSelect1",
            validationRules: []
          },
          testSelect2: {
            formElement: formElements.select,
            name: "testSelect2",
            validationRules: []
          },
          testSelect3: {
            formElement: formElements.select,
            name: "testSelect3",
            validationRules: []
          }
        },
        {
          testInputText1: "",
          testInputText2: undefined,
          testSelect1: null,
          testSelect2: "",
          testSelect3: undefined
        }
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testSelect1.render({
            options: []
          })}
          {formData.testSelect2.render()}
          {formData.testSelect3.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}
          >
            Submit form
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue } = render(<TestForm />);

    fireEvent.click(getByText("Submit form"));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testInputText1: null,
      testInputText2: null,
      testSelect1: null,
      testSelect2: null,
      testSelect3: null
    });
  });
});

describe("Set schema state value", () => {
  test.skip("Set schema state value without validation", async () => {
    function TestForm() {
      const { formData, setSchemaStateValue } = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: "testInputText1",
          label: "testInputText1",
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3
              }
            }
          ]
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: "testInputText1",
                newValue: "Test",
                skipValidation: true
              });
            }}
          >
            Set schema test value
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue, getByLabelText } = render(
      <TestForm />
    );

    expect(getByLabelText("Label: testInputText1").value).toBe("");

    fireEvent.click(getByText("Set schema test value"));
    let testInputText1 = await waitForElement(
      () => getByValue("Test"),
      container
    );

    expect(testInputText1.value).toBe("Test");
    expect(queryByText("Error: Max length is 3")).toBeNull();
  });

  test.skip("Set schema state select value ", async () => {
    function TestForm() {
      const { formData, setSchemaStateValue } = useForm({
        testSelect: {
          formElement: formElements.select,
          name: "testSelect",
          label: "testSelect"
        }
      });

      return (
        <div>
          {formData.testSelect.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: "testSelect",
                newValue: { value: "Test", label: "Test" },
                skipValidation: true
              });
            }}
          >
            Set schema test value
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue, getByLabelText } = render(
      <TestForm />
    );
    expect(container.querySelector("input").value).toBe("");

    fireEvent.click(getByText("Set schema test value"));
    let selectInput = await waitForElement(() => getByValue("Test"), container);

    expect(selectInput.value).toBe("Test");
  });

  test.skip("Set schema state value with validation", async () => {
    function TestForm() {
      const { formData, setSchemaStateValue } = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: "testInputText1",
          label: "testInputText1",
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3
              }
            }
          ]
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          label: "testInputText2",
          validationRules: [
            {
              fn: isName
            }
          ]
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: "testInputText1",
                newValue: "Test"
              });
              setSchemaStateValue({
                fullFieldName: "testInputText2",
                newValue: "Test2"
              });
            }}
          >
            Set schema test value
          </button>
        </div>
      );
    }

    const {
      container,
      queryByText,
      getByText,
      getByValue,
      getByLabelText
    } = render(<TestForm />);

    fireEvent.click(getByText("Set schema test value"));

    await wait(
      () => [
        expect(getByLabelText("Label: testInputText1").value).toBe("Test"),
        expect(getByLabelText("Label: testInputText2").value).toBe("Test2")
      ],
      {
        container
      }
    );

    expect(queryByText("Error: Max length is 3")).toBeTruthy();
    expect(queryByText("Error: Is name default")).toBeTruthy();
    // Question: if input 1 has validate another field and we change it with setSchemaStateValue,
    // should we validate another field?
  });

  test.skip("Set schema state value with callback onComplete", async () => {
    let onCompleteMock = jest.fn();

    function TestForm() {
      const { formData, setSchemaStateValue } = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: "testInputText1",
          label: "testInputText1"
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: "testInputText1",
                newValue: "Test",
                skipValidation: true,
                onComplete: onCompleteMock
              });
            }}
          >
            Set schema test value
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue, getByLabelText } = render(
      <TestForm />
    );

    expect(getByLabelText("Label: testInputText1").value).toBe("");
    fireEvent.click(getByText("Set schema test value"));

    await waitForElement(() => getByValue("Test"), container);
    expect(onCompleteMock).toHaveBeenCalled();
  });

  test.skip("Set schema state value bulk", async () => {
    function TestForm() {
      const { formData, setSchemaStateValueBulk } = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: "testInputText1",
          label: "testInputText1"
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: "testInputText2",
          label: "testInputText2"
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          <button
            onClick={() => {
              setSchemaStateValueBulk({
                testInputText1: "Test 1",
                testInputText1: "Test 2"
              });
            }}
          >
            Set schema test value
          </button>
        </div>
      );
    }

    const { container, getByText, getByValue, getByLabelText } = render(
      <TestForm />
    );

    expect(getByLabelText("Label: testInputText1").value).toBe("");
    expect(getByLabelText("Label: testInputText2").value).toBe("");

    fireEvent.click(getByText("Set schema test value"));

    await waitForElement(
      () => [getByValue("Test 1"), getByValue("Test 2")],
      container
    );
  });
});

describe("Get schema state value", () => {
  test.skip("Get value from state - input field", () => {
    function TestForm(props) {
      const { formData, getSchemaStateValue } = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: "Test",
          name: "testInputText1"
        },
        testInputText2: {
          formElement: formElements.textInput,
          defaultValue: undefined,
          name: "testInputText2"
        }
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}

          <button
            onClick={() => {
              {
                let inputValue1 = getSchemaStateValue("testInputText1");
                let inputValue2 = getSchemaStateValue("testInputText2");

                expect(inputValue1).toEqual("Test");
                expect(inputValue2).toEqual("");
              }
            }}
          >
            Get input values
          </button>
        </div>
      );
    }

    const { container, getByText } = render(<TestForm />);

    const inputs = container.querySelectorAll("input");

    expect(inputs[0].value).toBe("Test");
    expect(inputs[1].value).toBe("");

    fireEvent.click(getByText("Get input values"));
  });

  test.skip("Get value from state - select/multi select", () => {
    function TestForm(props) {
      const { formData, getSchemaStateValue } = useForm({
        testSelectString: {
          formElement: formElements.textInput,
          defaultValue: "Test Select",
          name: "testSelectString"
        },
        testSelectObj: {
          formElement: formElements.textInput,
          defaultValue: { value: "test-select", label: "Test Select" },
          name: "testSelectObj"
        },
        testSelectMulti: {
          formElement: formElements.textInput,
          defaultValue: [{ value: "test-multi", label: "Test Select Multi" }],
          name: "testSelectMulti"
        }
      });

      return (
        <div>
          {formData.testSelectString.render()}
          {formData.testSelectObj.render()}
          {formData.testSelectMulti.render()}
          <button
            onClick={() => {
              {
                let select1 = getSchemaStateValue("testSelectString");
                let select2 = getSchemaStateValue("testSelectObj");
                let select3 = getSchemaStateValue("testSelectMulti");

                expect(select1).toEqual("Test Select");
                expect(select2).toEqual({
                  value: "test-select",
                  label: "Test Select"
                });
                expect(select3).toEqual([
                  { value: "test-multi", label: "Test Select Multi" }
                ]);
              }
            }}
          >
            Get select values
          </button>
        </div>
      );
    }

    const { container, getByText } = render(<TestForm />);

    fireEvent.click(getByText("Get select values"));
  });
});

describe.skip("Clone state schema values", () => {
  test("cloneStateValues input", () => {
    let initialValuesObj = {
      testInputText1: "Test 1",
      testInputText2: "",
      testInputText3: undefined,
      testInputText4: null,
      testInputText5: [],
      testInputText6: 1
    };

    function TestForm(props) {
      const { formData, cloneStateValues } = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput
          },
          testInputText2: {
            formElement: formElements.textInput
          },
          testInputText3: {
            formElement: formElements.textInput
          },
          testInputText4: {
            formElement: formElements.textInput
          },
          testInputText5: {
            formElement: formElements.textInput
          },
          testInputText6: {
            formElement: formElements.textInput
          }
        },
        initialValuesObj
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testInputText3.render()}
          {formData.testInputText4.render()}
          {formData.testInputText5.render()}
          {formData.testInputText6.render()}
          <button
            onClick={() => {
              {
                let clonedState = cloneStateValues();
                expect(clonedState).toEqual(initialValuesObj);
              }
            }}
          >
            Clone schema values
          </button>
        </div>
      );
    }

    const { container, getByText } = render(<TestForm />);
    fireEvent.click(getByText("Clone schema values"));
  });

  test.skip("cloneStateValues select", () => {
    function TestForm(props) {
      const { formData, cloneStateValues } = useForm({
        testSelectString: {
          formElement: formElements.select,
          defaultValue: "Test Select"
        },
        testSelectObj: {
          formElement: formElements.select,
          defaultValue: { value: "test-select", label: "Test Select" }
        },
        testMultiSelect1: {
          formElement: formElements.multiSelect,
          defaultValue: [{ value: "multi-select", label: "Test Multi Select" }]
        },
        testMultiSelect2: {
          formElement: formElements.multiSelect,
          defaultValue: []
        }
      });

      return (
        <div>
          <button
            onClick={() => {
              {
                let clonedState = cloneStateValues();
                expect(clonedState).toEqual({
                  testSelectString: "Test Select",
                  testSelectObj: { value: "test-select", label: "Test Select" },
                  testMultiSelect1: [
                    { value: "multi-select", label: "Test Multi Select" }
                  ],
                  testMultiSelect2: []
                });
              }
            }}
          >
            Clone schema values
          </button>
        </div>
      );
    }

    const { container, getByText } = render(<TestForm />);
    fireEvent.click(getByText("Clone schema values"));
  });
});

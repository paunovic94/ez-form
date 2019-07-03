import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  waitForDomChange,
  getByTestId,
  queryByTestId,
  wait,
} from '@testing-library/react';
import useForm from '../index';
import formElements, {formatDate} from './formTestElements';
import {isMaxLength, isName, isRequired} from './validation.test';

afterEach(cleanup);

describe('Set schema state value', () => {
  test('Set schema state value without validation', async () => {
    function TestForm() {
      const {formData, setSchemaStateValue} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
          ],
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: 'testInputText1',
                newValue: 'Test',
                skipValidation: true,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {
      container,
      getByText,
      getByDisplayValue,
      getByLabelText,
      queryByText,
    } = render(<TestForm />);

    expect(getByLabelText('Label: testInputText1').value).toBe('');

    fireEvent.click(getByText('Set schema test value'));
    let testInputText1 = await waitForElement(
      () => getByDisplayValue('Test'),
      container
    );

    expect(testInputText1.value).toBe('Test');
    expect(queryByText('Error: Max length is 3')).toBeNull();
  });

  test('Set schema state select value ', async () => {
    function TestForm() {
      const {formData, setSchemaStateValue} = useForm({
        testSelect: {
          formElement: formElements.select,
          name: 'testSelect',
          label: 'testSelect',
        },
      });

      return (
        <div>
          {formData.testSelect.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: 'testSelect',
                newValue: {value: 'Test', label: 'Test'},
                skipValidation: true,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {
      container,
      getByText,
      getByDisplayValue,
      getByLabelText,
      queryByText,
    } = render(<TestForm />);
    expect(container.querySelector('input').value).toBe('');

    fireEvent.click(getByText('Set schema test value'));
    await wait(() => expect(queryByText('Test')).toBeTruthy(), container);
  });

  test('Set schema state value with validation', async () => {
    function TestForm() {
      const {formData, setSchemaStateValue} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
          ],
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          label: 'testInputText2',
          validationRules: [
            {
              fn: isName,
            },
          ],
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: 'testInputText1',
                newValue: 'Test',
              });
              setSchemaStateValue({
                fullFieldName: 'testInputText2',
                newValue: 'Test2',
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, queryByText, getByText, getByLabelText} = render(
      <TestForm />
    );

    fireEvent.click(getByText('Set schema test value'));

    await wait(
      () => [
        expect(getByLabelText('Label: testInputText1').value).toBe('Test'),
        expect(getByLabelText('Label: testInputText2').value).toBe('Test2'),
      ],
      {
        container,
      }
    );

    expect(queryByText('Error: Max length is 3')).toBeTruthy();
    expect(queryByText('Error: Is name default')).toBeTruthy();
    // Question: if input 1 has validate another field and we change it with setSchemaStateValue,
    // should we validate another field?
  });

  test('Set schema state value with callback onComplete', async () => {
    let onCompleteMock = jest.fn();

    function TestForm() {
      const {formData, setSchemaStateValue} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: 'testInputText1',
                newValue: 'Test',
                skipValidation: true,
                onComplete: onCompleteMock,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, getByText, getByDisplayValue, getByLabelText} = render(
      <TestForm />
    );

    expect(getByLabelText('Label: testInputText1').value).toBe('');
    fireEvent.click(getByText('Set schema test value'));

    await waitForElement(() => getByDisplayValue('Test'), container);
    expect(onCompleteMock).toHaveBeenCalled();
  });

  test('Set schema state value bulk', async () => {
    function TestForm() {
      const {formData, setSchemaStateValueBulk} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          label: 'testInputText2',
        },
        select1: {
          formElement: formElements.select,
          name: 'select1',
          label: 'select1',
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.select1.render()}
          <button
            onClick={() => {
              setSchemaStateValueBulk({
                valuesMap: {
                  testInputText1: 'Test 1',
                  testInputText2: 'Test 2',
                  select1: {
                    value: 'select_val',
                    label: 'select_label',
                  },
                },
                skipValidation: true,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, getByText, getByDisplayValue, getByLabelText} = render(
      <TestForm />
    );

    expect(getByLabelText('Label: testInputText1').value).toBe('');
    expect(getByLabelText('Label: testInputText2').value).toBe('');
    expect(container.querySelector('.TestSelect input').value).toBe('');

    fireEvent.click(getByText('Set schema test value'));

    await waitForElement(
      () => [
        getByDisplayValue('Test 1'),
        getByDisplayValue('Test 2'),
        getByText('select_label'),
      ],
      container
    );
  });

  test('Set schema state value bulk with validation', async () => {
    function TestForm() {
      const {formData, setSchemaStateValueBulk} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          label: 'testInputText2',
          validationRules: [
            {
              fn: isRequired,
            },
          ],
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          <button
            onClick={() => {
              setSchemaStateValueBulk({
                valuesMap: {
                  testInputText1: 'Test 1',
                  testInputText2: '',
                },
                // skipValidation: false,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, getByText, getByDisplayValue, getByLabelText} = render(
      <TestForm />
    );

    expect(getByLabelText('Label: testInputText1').value).toBe('');
    expect(getByLabelText('Label: testInputText2').value).toBe('');

    fireEvent.click(getByText('Set schema test value'));

    await waitForElement(() => [getByDisplayValue('Test 1')], container);

    let errorMessage2 = container.querySelector('.testInputText2 > .Error');
    expect(errorMessage2.innerHTML).toBe('Error: Is required default');
  });

  test('Set schema state value bulk with onComplete cb', async () => {
    const onCompleteMock = jest.fn();
    function TestForm() {
      const {formData, setSchemaStateValueBulk} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          label: 'testInputText2',
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          <button
            onClick={() => {
              setSchemaStateValueBulk({
                valuesMap: {
                  testInputText1: 'Test 1',
                  testInputText2: 'Test 2',
                },
                onComplete: onCompleteMock,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, getByText, getByDisplayValue} = render(<TestForm />);
    fireEvent.click(getByText('Set schema test value'));

    await waitForElement(
      () => [getByDisplayValue('Test 1'), getByDisplayValue('Test 2')],
      container
    );
    expect(onCompleteMock).toHaveBeenCalled();
  });

  test('Set schema state value without validation - text area', async () => {
    function TestForm() {
      const {formData, setSchemaStateValue} = useForm({
        textArea1: {
          formElement: formElements.textArea,
          name: 'textArea1',
          label: 'textArea1',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
          ],
        },
      });

      return (
        <div>
          {formData.textArea1.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: 'textArea1',
                newValue: 'Test',
                skipValidation: true,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, getByText, getByLabelText, queryByText} = render(
      <TestForm />
    );

    expect(getByLabelText('Label: textArea1').value).toBe('');

    fireEvent.click(getByText('Set schema test value'));
    let textArea1 = await waitForElement(() => getByText('Test'), container);

    expect(textArea1.innerHTML).toBe('Test');
    expect(queryByText('Error: Max length is 3')).toBeNull();
  });

  test('Reset field errors if skipValidation is set to true', async () => {
    function TestForm() {
      const {formData, setSchemaStateValue} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
          ],
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          <button
            onClick={() => {
              setSchemaStateValue({
                fullFieldName: 'testInputText1',
                newValue: 'Test again invalid value',
                skipValidation: true,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, getByText, getByDisplayValue, queryByText} = render(
      <TestForm />
    );

    let testInput = container.querySelector('input');
    expect(testInput.value).toBe('');

    // Insert invalid value and check is error message visible
    fireEvent.change(testInput, {target: {value: 'invaliedValue'}});
    await wait(() => [expect(testInput.value).toBe('invaliedValue')], {
      container,
    });
    expect(queryByText('Error: Max length is 3')).toBeTruthy();

    // Call setSchemaStateValue with  skipValidation: true
    fireEvent.click(getByText('Set schema test value'));
    testInput = await waitForElement(
      () => getByDisplayValue('Test again invalid value'),
      container
    );

    expect(queryByText('Error: Max length is 3')).toBeNull();
  });

  test('Set schema state value bulk and reset errors', async () => {
    function TestForm() {
      const {formData, setSchemaStateValueBulk} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          label: 'testInputText1',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
          ],
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          label: 'testInputText2',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
          ],
        },
      });

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          <button
            onClick={() => {
              setSchemaStateValueBulk({
                valuesMap: {
                  testInputText1: 'Test 1',
                  testInputText2: 'Test 2',
                },
                skipValidation: true,
              });
            }}>
            Set schema test value
          </button>
        </div>
      );
    }

    const {container, getByText, getByDisplayValue} = render(<TestForm />);
    let [testInput1, testInput2] = container.querySelectorAll('input');

    expect(testInput1.value).toBe('');
    expect(testInput2.value).toBe('');

    // Change inputs to get errors
    fireEvent.change(testInput1, {target: {value: 'invaliedValue1'}});
    fireEvent.change(testInput2, {target: {value: 'invaliedValue2'}});

    await wait(
      () => [
        expect(testInput1.value).toBe('invaliedValue1'),
        expect(testInput2.value).toBe('invaliedValue2'),
      ],
      {
        container,
      }
    );
    let errorMessage1 = container.querySelector('.testInputText1 > .Error');
    let errorMessage2 = container.querySelector('.testInputText2 > .Error');

    expect(errorMessage1.innerHTML).toBe('Error: Max length is 3');
    expect(errorMessage2.innerHTML).toBe('Error: Max length is 3');

    // Set schema values and skip validation to reset errors
    fireEvent.click(getByText('Set schema test value'));

    await waitForElement(
      () => [
        getByDisplayValue('Test 1'),
        getByDisplayValue('Test 2'),
        expect(container.querySelector('.testInputText1 > .Error')).toBeNull(),
        expect(container.querySelector('.testInputText2 > .Error')).toBeNull(),
      ],
      container
    );
  });
});

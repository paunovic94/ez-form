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
} from 'react-testing-library';
import useForm from '../index';
import formElements, {formatDate} from './formTestElements';

export function getNestedValue(state, name) {
  if (!state) return;
  return name.split('.').reduce((acc, key) => {
    if (acc) return acc[key];
    return acc;
  }, state);
}

export function isRequired(value, message, args) {
  if (!value) {
    return message || 'Is required default';
  }
  return '';
}

export function isName(value, message, args) {
  if (value && !/^[a-zA-Z]*$/.test(value)) {
    return message || 'Is name default';
  }
  return '';
}

export function isMaxLength(value, message, args = {}) {
  if (value && value.length > args.maxLength) {
    return 'Max length is ' + args.maxLength;
  }
}

function isStartDateBeforeEndDate(value, message, args, state) {
  const endDate = getNestedValue(state, `${args.endDate}.value`);

  if (!message) {
    message = 'Start date should be before end date';
  }
  if (value && new Date(endDate) < new Date(value)) {
    return message;
  }
}

function isEndDateAfterStartDate(value, message, args, state) {
  const startDate = getNestedValue(state, `${args.startDate}.value`);
  if (!message) {
    message = 'End date should be after end date';
  }

  if (!startDate) return;

  if (value && new Date(startDate) > new Date(value)) {
    return message;
  }
}

afterEach(cleanup);

describe('Validate form data on input change', () => {
  test('Validate only changed input', async () => {
    function TestForm() {
      const {formData} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: 'text1',
          name: 'testInputText1',
          validationRules: [
            {
              fn: isRequired,
            },
            {
              fn: isName,
            },
          ],
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          validationRules: [
            {
              fn: isName,
              message: 'Is name custom',
            },
          ],
        },
      });
      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);

    const [input1, input2] = container.querySelectorAll('input');
    const [inputWrapper1, inputWrapper2] = container.querySelectorAll(
      '.TestTextInput'
    );

    fireEvent.change(input1, {target: {value: ''}});

    await waitForElement(() => getByValue(''), {
      inputWrapper1,
    });

    let errorMessage1 = container.querySelector('.testInputText1 > .Error');
    let errorMessage2 = container.querySelector('.testInputText2 > .Error');

    expect(errorMessage1.innerHTML).toBe('Error: Is required default');
    expect(errorMessage2).toBeNull();

    fireEvent.change(input1, {target: {value: 'text'}});
    fireEvent.change(input2, {target: {value: '222'}});

    await waitForElement(() => [getByValue('text'), getByValue('222')], {
      container,
    });

    errorMessage1 = container.querySelector('.testInputText1 > .Error');
    errorMessage2 = container.querySelector('.testInputText2 > .Error');

    expect(errorMessage1).toBeNull();
    expect(errorMessage2.innerHTML).toBe('Error: Is name custom');
  });

  test('useForm treat intl error message and string same', async () => {
    // Intl error messages are handled in components from formElemet
    function TestForm() {
      const {formData} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: 'text1',
          name: 'testInputText1',
          validationRules: [
            {
              fn: isRequired,
              message: {
                descriptor: {
                  id: 'Util.isRequired',
                  defaultMessage: 'Is required intl message',
                },
              },
            },
          ],
        },
      });

      return <div>{formData.testInputText1.render()}</div>;
    }

    const {container, getByValue} = render(<TestForm />);
    const input = container.querySelector('input');

    fireEvent.change(input, {target: {value: ''}});
    await waitForElement(() => getByValue(''), {
      container,
    });

    let errorMessage = container.querySelector('.Error');
    expect(errorMessage.innerHTML).toBe('Error: Is required intl message');
  });

  test('Args property for validation function', async () => {
    function TestForm() {
      const {formData} = useForm({
        testInputText: {
          formElement: formElements.textInput,
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

      return <div>{formData.testInputText.render()}</div>;
    }

    const {container, getByValue} = render(<TestForm />);

    const [input] = container.querySelectorAll('input');
    const [testInputText] = container.querySelectorAll('.TestTextInput');

    fireEvent.change(input, {target: {value: 'text'}});

    await waitForElement(() => [getByValue('text')], {
      container,
    });

    let errorMessage = testInputText.querySelector('.Error');
    expect(errorMessage.innerHTML).toBe('Error: Max length is 3');
  });

  test('Validate anoter field', async () => {
    function TestForm() {
      const {formData} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          name: 'testInputText1',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
            {
              validateAnotherField: 'testInputText2',
            },
          ],
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
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
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);

    const [input1, input2] = container.querySelectorAll('input');
    const [inputWrapper1, inputWrapper2] = container.querySelectorAll(
      '.TestTextInput'
    );

    fireEvent.change(input1, {target: {value: 'Text1'}});

    await waitForElement(() => [getByValue('Text1')], {
      container,
    });

    let errorMessage1 = container.querySelector('.testInputText1 > .Error');
    let errorMessage2 = container.querySelector('.testInputText2 > .Error');

    expect(errorMessage1.innerHTML).toBe('Error: Max length is 3');
    expect(errorMessage2.innerHTML).toBe('Error: Is required default');

    fireEvent.change(input1, {target: {value: 't'}});
    fireEvent.change(input2, {target: {value: 'text2'}});

    await waitForElement(() => [getByValue('t'), getByValue('text2')], {
      container,
    });

    errorMessage1 = container.querySelector('.testInputText1 > .Error');
    errorMessage2 = container.querySelector('.testInputText2 > .Error');

    expect(errorMessage1).toBeNull();
    expect(errorMessage2).toBeNull();
  });

  test('Validate field based on value for another field', async () => {
    function TestForm() {
      const {formData} = useForm({
        startDate: {
          formElement: formElements.textInput,
          name: 'startDate',
          validationRules: [
            {
              fn: isStartDateBeforeEndDate,
              args: {
                endDate: 'endDate',
              },
            },
          ],
        },
        endDate: {
          formElement: formElements.textInput,
          name: 'endDate',
          defaultValue: new Date(2017, 12, 31),
        },
      });

      return (
        <div>
          {formData.startDate.render()}
          {formData.endDate.render()}
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);
    const [startDateInput] = container.querySelectorAll('input');

    let startDate = new Date();
    fireEvent.change(startDateInput, {target: {value: startDate}});

    await waitForElement(() => getByValue(formatDate(startDate)), {
      container,
    });

    let endDateErrorMessage = container.querySelector('.startDate > .Error');
    expect(endDateErrorMessage.innerHTML).toBe(
      'Error: Start date should be before end date'
    );
  });

  test('Validate another field: stop cyclically validation', async () => {
    function TestForm() {
      const {formData} = useForm({
        startDate: {
          formElement: formElements.textInput,
          name: 'startDate',
          validationRules: [
            {
              fn: isStartDateBeforeEndDate,
              args: {
                endDate: 'endDate',
              },
            },
            {
              validateAnotherField: 'endDate',
            },
          ],
        },
        endDate: {
          formElement: formElements.textInput,
          name: 'endDate',
          defaultValue: new Date(2017, 11, 31),
          validationRules: [
            {
              fn: isEndDateAfterStartDate,
              args: {
                startDate: 'startDate',
              },
            },
            {
              validateAnotherField: 'startDate',
            },
          ],
        },
      });

      return (
        <div>
          {formData.startDate.render()}
          {formData.endDate.render()}
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);
    const [startDateInput] = container.querySelectorAll('input');

    let startDate = new Date();
    fireEvent.change(startDateInput, {target: {value: startDate}});

    await waitForElement(() => getByValue(formatDate(startDate)), {
      container,
    });

    let startDateErrorMessage = container.querySelector('.startDate > .Error');
    let endDateErrorMessage = container.querySelector('.endDate > .Error');

    expect(startDateErrorMessage.innerHTML).toBe(
      'Error: Start date should be before end date'
    );
    expect(endDateErrorMessage.innerHTML).toBe(
      'Error: End date should be after end date'
    );

    let newStartDate = new Date(2015, 11, 31);
    fireEvent.change(startDateInput, {target: {value: newStartDate}});

    await waitForElement(() => getByValue(formatDate(newStartDate)), {
      container,
    });

    await wait(() => [
      expect(container.querySelector('.startDate > .Error')).toBeNull(),
      expect(container.querySelector('.endDate > .Error')).toBeNull(),
    ]);
  });
});

describe('Validate function', () => {
  test('Validate all fields in schema', async () => {
    let onSubmit = jest.fn();

    function TestForm() {
      const {formData, validate} = useForm({
        a: {
          formElement: formElements.textInput,
          name: 'a',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 3,
              },
            },
            {
              validateAnotherField: 'b',
            },
          ],
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
          validationRules: [
            {
              fn: isRequired,
            },
          ],
        },
      });

      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
          <button
            onClick={() => {
              let isValid = validate();
              if (isValid) {
                onSubmit();
              }
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {container, getByText, getByValue} = render(<TestForm />);
    fireEvent.click(getByText('Submit form'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector('.a > .Error')).toBeNull();
    expect(container.querySelector('.b > .Error').innerHTML).toBe('Error: Is required default');

    // Fix error
    fireEvent.change(container.querySelector('.b > input'), {target: {value: 'testInputText2'}});
    await waitForElement(() => getByValue('testInputText2'), {
      container,
    });
    fireEvent.click(getByText('Submit form'));

    expect(container.querySelector('.a > .Error')).toBeNull();
    expect(container.querySelector('.b > .Error')).toBeNull();
    expect(onSubmit).toHaveBeenCalled();
  });

  test("Don't validate field that has isVisible false flag", () => {
    let onSubmit = jest.fn();

    function TestForm() {
      const {formData, validate} = useForm({
        a: {
          formElement: formElements.textInput,
          name: 'a',
          isVisible: false,
          validationRules: [
            {
              fn: isRequired,
            },
          ],
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
        },
      });

      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
          <button
            onClick={() => {
              let isValid = validate();
              if (isValid) {
                onSubmit();
              }
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {container, getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));
    expect(onSubmit).toHaveBeenCalled();
  });

  test('Validate function is returning true when there are no validation rules', async () => {
    let onSubmit = jest.fn();

    function TestForm() {
      const {formData, validate} = useForm({
        a: {
          formElement: formElements.textInput,
          name: 'a',
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
          validationRules: [],
        },
      });

      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
          <button
            onClick={() => {
              let isValid = validate();
              if (isValid) {
                onSubmit();
              }
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {container, getByText, getByValue} = render(<TestForm />);
    let errorMessages = container.querySelector('.Error');

    fireEvent.click(getByText('Submit form'));

    expect(errorMessages).toBeNull();
    expect(onSubmit).toHaveBeenCalled();
  });

  test('Validate function - one field is valid, other is not valid', async () => {
    let onSubmit = jest.fn();

    function TestForm() {
      const {formData, validate} = useForm({
        a: {
          formElement: formElements.textInput,
          name: 'a',
          validationRules: [
            {
              fn: isRequired,
            },
          ],
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
        },
      });

      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
          <button
            onClick={() => {
              let isValid = validate();
              if (isValid) {
                onSubmit();
              }
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {container, getByText, getByValue} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector('.a > .Error')).not.toBeNull();
    expect(container.querySelector('.b > .Error')).toBeNull();

    // Fix error
    fireEvent.change(container.querySelector('.a > input'), {target: {value: 'tt'}});
    await waitForElement(() => getByValue('tt'), {
      container,
    });

    fireEvent.click(getByText('Submit form'));
    expect(container.querySelector('.a > .Error')).toBeNull();
    expect(container.querySelector('.b > .Error')).toBeNull();
    expect(onSubmit).toHaveBeenCalled();
  });

  test('Test validate function when field is valid but rule returns undefined, not empty string', async () => {
    let onSubmit = jest.fn();

    function TestForm() {
      const {formData, validate} = useForm({
        a: {
          formElement: formElements.textInput,
          name: 'a',
          defaultValue: 'A',
          validationRules: [
            {
              fn: isMaxLength,
              args: {
                maxLength: 15,
              },
            },
          ],
        },
      });
      return (
        <div>
          {formData.a.render()}
          <button
            onClick={() => {
              let isValid = validate();
              if (isValid) {
                onSubmit();
              }
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {getByText} = render(<TestForm />);
    fireEvent.click(getByText('Submit form'));
    expect(onSubmit).toHaveBeenCalled();
  });
});

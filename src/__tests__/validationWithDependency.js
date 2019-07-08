import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
} from 'react-testing-library';
import useForm from '../index';
import formElements from './formTestElements';
import {isRequired} from './validation.test';

afterEach(cleanup);

describe('Test validation rules with dependency: rule expect args with dependencyField,dependencyValue,dependencyInValidationArgs', () => {
  test('Validation with dependency with passed dependency value: test a if b = "B"', async () => {
    function TestForm() {
      const {formData} = useForm({
        a: {
          formElement: formElements.textInput,
          defaultValue: 'A',
          name: 'a',
          validationRules: [
            {
              fn: isRequired,
              args: {
                dependencyField: 'b',
                dependencyValue: 'B',
              },
            },
          ],
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
          defaultValue: 'B',
        },
      });
      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);

    const [a] = container.querySelectorAll('input');
    const [inputWrapperA] = container.querySelectorAll('.TestTextInput');

    fireEvent.change(a, {target: {value: ''}});
    await waitForElement(() => getByValue(''), {
      inputWrapperA,
    });

    expect(container.querySelector('.a > .Error').innerHTML).toBe('Error: Is required default');
  });


  test('Validation with dependency with passed dependency value: test a if b is select field and b.value = "B"', async () => {
    function TestForm() {
      const {formData} = useForm({
        a: {
          formElement: formElements.textInput,
          defaultValue: 'A',
          name: 'a',
          validationRules: [
            {
              fn: isRequired,
              args: {
                dependencyField: 'b',
                dependencyValue: 'B',
              },
            },
          ],
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
          defaultValue: {value: 'B', label: 'B'},
        },
      });
      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);

    const [a] = container.querySelectorAll('input');
    const [inputWrapperA] = container.querySelectorAll('.TestTextInput');

    fireEvent.change(a, {target: {value: ''}});
    await waitForElement(() => getByValue(''), {
      inputWrapperA,
    });

    expect(container.querySelector('.a > .Error').innerHTML).toBe('Error: Is required default');
  });



  test('Validatin rule with no passed dependency value: validate a if b has any value in state', async () => {
    function TestForm() {
      const {formData} = useForm({
        a: {
          formElement: formElements.textInput,
          defaultValue: 'A',
          name: 'a',
          validationRules: [
            {
              fn: isRequired,
              args: {
                dependencyField: 'b',
              },
            },
          ],
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
          defaultValue: 'B',
        },
      });
      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);

    const [inputA] = container.querySelectorAll('input');
    const [inputWrapperA] = container.querySelectorAll('.TestTextInput');

    fireEvent.change(inputA, {target: {value: ''}});
    await waitForElement(() => getByValue(''), {
      inputWrapperA,
    });

    let errorMessageA = container.querySelector('.a > .Error');
    expect(errorMessageA.innerHTML).toBe('Error: Is required default');
  });

  test('Do not validate a when dependency field b is changed and its value is not "B" ', async () => {
    function TestForm() {
      const {formData} = useForm({
        a: {
          formElement: formElements.textInput,
          defaultValue: 'text1',
          name: 'a',
          validationRules: [
            {
              fn: isRequired,
              args: {
                dependencyField: 'b',
                dependencyValue: 'B',
              },
            },
          ],
        },
        b: {
          formElement: formElements.textInput,
          name: 'b',
          defaultValue: 'B',
          validationRules: [
            {
              validateAnotherField: 'a',
            },
          ],
        },
      });
      return (
        <div>
          {formData.a.render()}
          {formData.b.render()}
        </div>
      );
    }

    const {container, getByValue} = render(<TestForm />);

    const [inputA, inputB] = container.querySelectorAll('input');
    const [inputWrapperA, inputWrapperB] = container.querySelectorAll(
      '.TestTextInput'
    );

    fireEvent.change(inputA, {target: {value: ''}});
    await waitForElement(() => getByValue(''), {
      inputWrapperA,
    });

    let errorMessageA = container.querySelector('.a > .Error');
    expect(errorMessageA.innerHTML).toBe('Error: Is required default');

    // don't validate a after change dependency value
    fireEvent.change(inputB, {target: {value: 'BBB'}});
    await waitForElement(() => getByValue('BBB'), {
      inputWrapperB,
    });
    expect(container.querySelector('.a > .Error')).toBeNull();
  });
});


describe('Test validate function when rules are with dependency', () => {
  test('Pass dependency field and value as arguments of validate function', async () => {
    let onSubmit1 = jest.fn();
    let onSubmit2 = jest.fn();

    function TestForm() {
      const {formData, validate} = useForm({
        a: {
          formElement: formElements.textInput,
          name: 'a',
          validationRules: [
            {
              fn: isRequired,
              args: {
                dependencyInValidationArgs: true,
                dependencyField: 'b',
                dependencyValue: 'B',
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
              let isValid = validate({b: 'B'});
              if (isValid) {
                onSubmit1();
              }
            }}>
            Submit form 1
          </button>
          <button
            onClick={() => {
              let isValid = validate({b: ''});
              if (isValid) {
                onSubmit2();
              }
            }}>
            Submit form 2
          </button>
        </div>
      );
    }

    const {container, getByText} = render(<TestForm />);
    fireEvent.click(getByText('Submit form 1'));
    expect(onSubmit1).not.toHaveBeenCalled();

    let errorMessageA = container.querySelector('.a > .Error');
    expect(errorMessageA.innerHTML).toBe('Error: Is required default');

    // Field is valid (not validated) if dependencyInValidationArgs are not satisfied
    fireEvent.click(getByText('Submit form 2'));
    expect(onSubmit2).toHaveBeenCalled();
  });

  test('Do not validate field a when dependent field b is changed so it does not meet the conditions', async () => {
    let onSubmit = jest.fn();

    function TestForm() {
      const {formData, validate} = useForm({
        a: {
          formElement: formElements.textInput,
          name: 'a',
          validationRules: [
            {
              fn: isRequired,
              args: {
                dependencyField: 'b',
                dependencyValue: 'B',
              },
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

    fireEvent.change(container.querySelector('.b > input'), {target: {value: 'B'}});
    await waitForElement(() => getByValue('B'), {
      container,
    });

    fireEvent.click(getByText('Submit form'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(container.querySelector('.a > .Error')).not.toBeNull();

    // Change dependency field, so it is diferent of dependency value
    // Expect not to validate dependent filed (to be valid)
    fireEvent.change(container.querySelector('.b > input'), {
      target: {value: 'BBB'},
    });
    await waitForElement(() => getByValue('BBB'), {
      container,
    });

    fireEvent.click(getByText('Submit form'));
    expect(container.querySelector('.a > .Error')).toBeNull();
    expect(onSubmit).toHaveBeenCalled();
  });
});

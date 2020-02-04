import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  wait,
} from '@testing-library/react';
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

    const {container, getByDisplayValue} = render(<TestForm />);

    const [a] = container.querySelectorAll('input');
    const [inputWrapperA] = container.querySelectorAll('.TestTextInput');

    fireEvent.change(a, {target: {value: ''}});
    await waitForElement(() => getByDisplayValue(''), {
      inputWrapperA,
    });

    expect(container.querySelector('.a > .Error').innerHTML).toBe(
      'Error: Is required default'
    );
  });

  test('Validation with dependency with passed dependency value: test a if b is select field and b.value = "B"', async () => {
    function TestForm() {
      const {formData} = useForm({
        a: {
          formElement: formElements.textInput,
          defaultValue: 'A',
          label: 'a',
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
          formElement: formElements.select,
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

    const {container, getByLabelText} = render(<TestForm />);

    const [a] = container.querySelectorAll('input');

    fireEvent.change(a, {target: {value: ''}});
    await wait(() => expect(getByLabelText('Label: a').value).toEqual(''), {
      container,
    });

    expect(container.querySelector('.a > .Error').innerHTML).toBe(
      'Error: Is required default'
    );
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

    const {container, getByDisplayValue} = render(<TestForm />);

    const [inputA] = container.querySelectorAll('input');
    const [inputWrapperA] = container.querySelectorAll('.TestTextInput');

    fireEvent.change(inputA, {target: {value: ''}});
    await waitForElement(() => getByDisplayValue(''), {
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

    const {container, getByDisplayValue} = render(<TestForm />);

    const [inputA, inputB] = container.querySelectorAll('input');
    const [inputWrapperA, inputWrapperB] = container.querySelectorAll(
      '.TestTextInput'
    );

    fireEvent.change(inputA, {target: {value: ''}});
    await waitForElement(() => getByDisplayValue(''), {
      inputWrapperA,
    });

    let errorMessageA = container.querySelector('.a > .Error');
    expect(errorMessageA.innerHTML).toBe('Error: Is required default');

    // don't validate a after change dependency value
    fireEvent.change(inputB, {target: {value: 'BBB'}});
    await waitForElement(() => getByDisplayValue('BBB'), {
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

    const {container, getByText, getByDisplayValue} = render(<TestForm />);

    fireEvent.change(container.querySelector('.b > input'), {
      target: {value: 'B'},
    });
    await waitForElement(() => getByDisplayValue('B'), {
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
    await waitForElement(() => getByDisplayValue('BBB'), {
      container,
    });

    fireEvent.click(getByText('Submit form'));
    expect(container.querySelector('.a > .Error')).toBeNull();
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe('validateAnotherField in dynamic schema',  () => {
  test('validation with dependency + validateAnotherField', async () => {
    function TestForm() {
      const {formData} = useForm(
        {
          dynamicField: {
            dynamicSchemaItem: {
              a: {
                formElement: formElements.textInput,
                defaultValue: '',
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
                defaultValue: '',
                validationRules: [
                  {
                    fn: isRequired,
                  },
                  {
                    validateAnotherField: 'a',
                  },
                ],
              },
            },
          },
        },
        {dynamicField: [{a: 'A1', b: 'B1'}, {a: '', b: 'B2'}]}
      );
      return (
        <div>
          {formData.dynamicField.map((item, index) => (
            <div className={'Item' + index}>
              {item.a.render()}
              {item.b.render()}
            </div>
          ))}
        </div>
      );
    }

    const {container, getByDisplayValue, getAllByDisplayValue} = render(<TestForm />);
    //
    const [inputA1, inputB1, inputA2, inputB2] = container.querySelectorAll(
      'input'
    );
    const [
      inputWrapperA1,
      inputWrapperB1,
      inputWrapperA2,
      inputWrapperB2,
    ] = container.querySelectorAll('.TestTextInput');

    fireEvent.change(inputB2, {target: {value: ''}});
    await waitForElement(() => getAllByDisplayValue('').length === 2);

    let errorMessageA1 = inputWrapperA1.querySelector('.Error');
    let errorMessageB1 = inputWrapperB1.querySelector('.Error');
    let errorMessageA2 = inputWrapperA2.querySelector('.Error');
    let errorMessageB2 = inputWrapperB2.querySelector('.Error');
    expect(errorMessageA1).toBeNull();
    expect(errorMessageB1).toBeNull();
    expect(errorMessageA2).toBeNull();
    expect(errorMessageB2.innerHTML).toBe('Error: Is required default');

    fireEvent.change(inputB2, {target: {value: 'B'}});
    await waitForElement(() => getByDisplayValue('B'));

    errorMessageA1 = inputWrapperA1.querySelector('.Error');
    errorMessageB1 = inputWrapperB1.querySelector('.Error');
    errorMessageA2 = inputWrapperA2.querySelector('.Error');
    errorMessageB2 = inputWrapperB2.querySelector('.Error');
    expect(errorMessageA1).toBeNull();
    expect(errorMessageB1).toBeNull();
    expect(errorMessageA2.innerHTML).toBe('Error: Is required default');
    expect(errorMessageB2).toBeNull();
  });
});

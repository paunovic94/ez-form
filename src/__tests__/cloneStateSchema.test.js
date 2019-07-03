import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import useForm from '../index';
import formElements from './formTestElements';

afterEach(cleanup);

describe('Clone state schema values', () => {
  test('cloneStateValues input', () => {
    let initialValuesObj = {
      testInputText1: 'Test 1',
      testInputText2: '',
      testInputText3: undefined,
      testInputText4: null,
      testInputText5: [],
      testInputText6: 1,
    };

    function TestForm(props) {
      const {formData, cloneStateValues} = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
          },
          testInputText2: {
            formElement: formElements.textInput,
          },
          testInputText3: {
            formElement: formElements.textInput,
          },
          testInputText4: {
            formElement: formElements.textInput,
          },
          testInputText5: {
            formElement: formElements.textInput,
          },
          testInputText6: {
            formElement: formElements.textInput,
          },
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
                expect(clonedState).toEqual({
                  testInputText1: 'Test 1',
                  testInputText2: '',
                  testInputText3: '',
                  testInputText4: '',
                  testInputText5: [],
                  testInputText6: 1,
                });
              }
            }}>
            Clone schema values
          </button>
        </div>
      );
    }

    const {container, getByText} = render(<TestForm />);
    fireEvent.click(getByText('Clone schema values'));
  });

  test('cloneStateValues select', () => {
    function TestForm(props) {
      const {formData, cloneStateValues} = useForm({
        testSelectString: {
          formElement: formElements.select,
          defaultValue: 'Test Select',
        },
        testSelectObj: {
          formElement: formElements.select,
          defaultValue: {value: 'test-select', label: 'Test Select'},
        },
        testMultiSelect1: {
          formElement: formElements.multiSelect,
          defaultValue: [{value: 'multi-select', label: 'Test Multi Select'}],
        },
        testMultiSelect2: {
          formElement: formElements.multiSelect,
          defaultValue: [],
        },
      });

      return (
        <div>
          <button
            onClick={() => {
              {
                let clonedState = cloneStateValues();
                expect(clonedState).toEqual({
                  testSelectString: 'Test Select',
                  testSelectObj: {value: 'test-select', label: 'Test Select'},
                  testMultiSelect1: [
                    {value: 'multi-select', label: 'Test Multi Select'},
                  ],
                  testMultiSelect2: [],
                });
              }
            }}>
            Clone schema values
          </button>
        </div>
      );
    }

    const {container, getByText} = render(<TestForm />);
    fireEvent.click(getByText('Clone schema values'));
  });

  test('Checkbox', () => {
    let onSubmitMock = jest.fn();
    let initialValuesObj = {
      checkbox1: true,
      checkbox2: false,
      checkbox3: undefined,
    };

    function TestForm(props) {
      const {formData, validate, cloneStateValues} = useForm(
        {
          checkbox1: {
            formElement: formElements.checkbox,
          },
          checkbox2: {
            formElement: formElements.checkbox,
          },
          checkbox3: {
            formElement: formElements.checkbox,
          },
        },
        initialValuesObj
      );

      return (
        <div>
          {formData.checkbox1.render()}
          {formData.checkbox2.render()}
          {formData.checkbox3.render()}
          <button
            onClick={() => {
              let clonedState = cloneStateValues();
              expect(clonedState).toEqual({
                checkbox1: true,
                checkbox2: false,
                checkbox3: false,
              });
            }}>
            Clone schema values
          </button>
        </div>
      );
    }

    const {getByText} = render(<TestForm />);
    fireEvent.click(getByText('Clone schema values'));
  });

  test('cloneStateValues text area', () => {
    let initialValuesObj = {
      textArea1: 'Test 1',
      textArea2: '',
      textArea3: undefined,
      textArea4: null,
      textArea5: [],
      textArea6: 1,
    };

    function TestForm(props) {
      const {formData, cloneStateValues} = useForm(
        {
          textArea1: {
            formElement: formElements.textArea,
          },
          textArea2: {
            formElement: formElements.textArea,
          },
          textArea3: {
            formElement: formElements.textArea,
          },
          textArea4: {
            formElement: formElements.textArea,
          },
          textArea5: {
            formElement: formElements.textArea,
          },
          textArea6: {
            formElement: formElements.textArea,
          },
        },
        initialValuesObj
      );

      return (
        <div>
          {formData.textArea1.render()}
          {formData.textArea2.render()}
          {formData.textArea3.render()}
          {formData.textArea4.render()}
          {formData.textArea5.render()}
          {formData.textArea6.render()}
          <button
            onClick={() => {
              {
                let clonedState = cloneStateValues();
                expect(clonedState).toEqual({
                  textArea1: 'Test 1',
                  textArea2: '',
                  textArea3: '',
                  textArea4: '',
                  textArea5: [],
                  textArea6: 1,
                });
              }
            }}>
            Clone schema values
          </button>
        </div>
      );
    }

    const {container, getByText} = render(<TestForm />);
    fireEvent.click(getByText('Clone schema values'));
  });
});

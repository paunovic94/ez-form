import {render, cleanup, fireEvent, wait} from '@testing-library/react';
import useForm from '../index';
import formElements from './formTestElements';
import React from 'react';

afterEach(cleanup);

describe('Prepare for server', () => {
  test('Input', () => {
    let onSubmitMock = jest.fn();

    function TestForm(props) {
      const {formData, validate, prepareForServer} = useForm(
        {
          testInputText1: {
            formElement: formElements.textInput,
            defaultValue: 'Test 1 default',
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
            name: 'testInputText5',
          },
          testInputText6: {
            formElement: formElements.textInput,
            name: 'testInputText6',
          },
          testInputText7: {
            formElement: formElements.textInput,
            name: 'testInputText7',
          },
        },
        {
          testInputText1: 'Test 1',
          testInputText2: '',
          testInputText3: undefined,
          testInputText4: null,
          testInputText5: 1,
          testInputText6: false,
          testInputText7: 0,
        }
      );

      return (
        <div>
          {formData.testInputText1.render()}
          {formData.testInputText2.render()}
          {formData.testInputText3.render()}
          {formData.testInputText4.render()}
          {formData.testInputText5.render()}
          {formData.testInputText6.render()}
          {formData.testInputText7.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}>
            Submit form
          </button>
        </div>
      );
    }
    const {getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testInputText1: 'Test 1',
      testInputText2: null,
      testInputText3: null,
      testInputText4: null,
      testInputText5: 1,
      testInputText6: false,
      testInputText7: 0,
    });
  });

  test('Select', () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const {formData, validate, prepareForServer} = useForm(
        {
          testSelectString: {
            formElement: formElements.select,
          },
          testSelectString2: {
            formElement: formElements.select,
          },
          testSelectObj1: {
            formElement: formElements.select,
          },
          testSelectObj2: {
            formElement: formElements.select,
          },
          testSelectObj3: {
            formElement: formElements.select,
          },
        },
        {
          testSelectString: 'testSelectString',
          testSelectString2: 'not-existing-option',
          testSelectObj1: {
            value: 'test-select-obj',
            label: 'Test Select Object',
          },
          testSelectObj2: {
            value: {},
            label: 'Test Select Nested Obj',
          },
          testSelectObj3: {value: 'not-existing-option', label: 'Not exist'},
        }
      );

      return (
        <div>
          {formData.testSelectString.render({
            selectOptions: [
              {value: 'testSelectString', label: 'Test Select String'},
            ],
          })}
          {formData.testSelectString2.render()}
          {formData.testSelectObj1.render({
            selectOptions: [
              {value: 'test-select-obj', label: 'Test Select Object'},
            ],
          })}
          {formData.testSelectObj2.render({
            selectOptions: [
              {
                value: {},
                label: 'Test Select Nested Obj',
              },
            ],
          })}
          {formData.testSelectObj3.render({
            selectOptions: [],
          })}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testSelectString: 'testSelectString',
      testSelectString2: 'not-existing-option',
      testSelectObj1: 'test-select-obj',
      testSelectObj2: {},
      testSelectObj3: 'not-existing-option',
    });
  });

  test("Select - returns null for '', null and undefined in state", () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const {formData, validate, prepareForServer} = useForm(
        {
          testSelect1: {
            formElement: formElements.select,
          },
          testSelect2: {
            formElement: formElements.select,
          },
          testSelect3: {
            formElement: formElements.select,
          },
        },
        {
          testSelect1: null,
          testSelect2: '',
          testSelect3: undefined,
        }
      );

      return (
        <div>
          {formData.testSelect1.render({})}
          {formData.testSelect2.render()}
          {formData.testSelect3.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testSelect1: null,
      testSelect2: null,
      testSelect3: null,
    });
  });

  test('Multi select', () => {
    let onSubmitMock = jest.fn();

    function TestForm() {
      const {formData, validate, prepareForServer} = useForm(
        {
          testMultiSelect1: {
            formElement: formElements.multiSelect,
          },
          testMultiSelect2: {
            formElement: formElements.multiSelect,
          },
          testMultiSelect3: {
            formElement: formElements.multiSelect,
          },
          testMultiSelect4: {
            formElement: formElements.multiSelect,
          },
          testMultiSelect5: {
            formElement: formElements.multiSelect,
          },
        },
        {
          testMultiSelect1: [
            {value: 'multi-select1', label: 'Test Multi Select1'},
            {value: 'multi-select2', label: 'Test Multi Select2'},
          ],
          testMultiSelect2: [],
          testMultiSelect3: [
            {value: 'multi-select1', label: 'Test Multi Select1'},
          ],
          testMultiSelect4: null,
          testMultiSelect5: undefined,
        }
      );

      return (
        <div>
          {formData.testMultiSelect1.render({
            selectOptions: [
              {value: 'multi-select1', label: 'Test Multi Select1'},
              {value: 'multi-select2', label: 'Test Multi Select2'},
            ],
          })}
          {formData.testMultiSelect2.render()}
          {formData.testMultiSelect3.render({
            selectOptions: [
              {value: 'multi-select1', label: 'Test Multi Select1'},
              {value: 'multi-select2', label: 'Test Multi Select2'},
            ],
          })}
          {formData.testMultiSelect4.render()}
          {formData.testMultiSelect5.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}>
            Submit form
          </button>
        </div>
      );
    }

    const {getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      testMultiSelect1: ['multi-select1', 'multi-select2'],
      testMultiSelect2: [],
      testMultiSelect3: ['multi-select1'],
      testMultiSelect4: null,
      testMultiSelect5: null,
    });
  });

  test('Checkbox', () => {
    let onSubmitMock = jest.fn();

    function TestForm(props) {
      const {formData, validate, prepareForServer} = useForm(
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
        {
          checkbox1: false,
          checkbox2: true,
          checkbox3: undefined,
        }
      );

      return (
        <div>
          {formData.checkbox1.render()}
          {formData.checkbox2.render()}
          {formData.checkbox3.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}>
            Submit form
          </button>
        </div>
      );
    }
    const {getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      checkbox1: false,
      checkbox2: true,
      checkbox3: false,
    });
  });

  test('Text area', () => {
    let onSubmitMock = jest.fn();
    function TestForm(props) {
      const {formData, validate, prepareForServer} = useForm(
        {
          textArea1: {
            formElement: formElements.textArea,
            defaultValue: 'Test 1 default',
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
            name: 'textArea5',
          },
          textArea6: {
            formElement: formElements.textArea,
            name: 'textArea6',
          },
          textArea7: {
            formElement: formElements.textArea,
            name: 'textArea7',
          },
        },
        {
          textArea1: 'Test 1',
          textArea2: '',
          textArea3: undefined,
          textArea4: null,
          textArea5: 1,
          textArea6: false,
          textArea7: 0,
        }
      );

      return (
        <div>
          {formData.textArea1.render()}
          {formData.textArea2.render()}
          {formData.textArea3.render()}
          {formData.textArea4.render()}
          {formData.textArea5.render()}
          {formData.textArea6.render()}
          {formData.textArea7.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}>
            Submit form
          </button>
        </div>
      );
    }
    const {container, getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      textArea1: 'Test 1',
      textArea2: null,
      textArea3: null,
      textArea4: null,
      textArea5: 1,
      textArea6: false,
      textArea7: 0,
    });
  });

  test('Prepare for server trims off leading & trailing spaces', () => {
    let onSubmitMock = jest.fn();
    function TestForm(props) {
      const {formData, validate, prepareForServer} = useForm(
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
          textInput1: {
            formElement: formElements.textInput,
          },
          textInput2: {
            formElement: formElements.textInput,
          },
          textInput3: {
            formElement: formElements.textInput,
          },
        },
        {
          textArea1: ' Test area      ',
          textArea2: '\n\nTest area\n',
          textArea3: '\tTest area\t',
          textInput1: ' Test input      ',
          textInput2: '\n\nTest input\n',
          textInput3: '\tTest input\t',
        }
      );

      return (
        <div>
          {formData.textArea1.render()}
          {formData.textInput1.render()}
          <button
            onClick={() => {
              let dataForServer = prepareForServer();
              onSubmitMock(dataForServer);
            }}>
            Submit form
          </button>
        </div>
      );
    }
    const {container, getByText} = render(<TestForm />);

    fireEvent.click(getByText('Submit form'));

    expect(onSubmitMock.mock.calls[0][0]).toEqual({
      textArea1: 'Test area',
      textArea2: 'Test area',
      textArea3: 'Test area',
      textInput1: 'Test input',
      textInput2: 'Test input',
      textInput3: 'Test input',
    });
  });
});

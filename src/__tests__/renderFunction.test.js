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

afterEach(cleanup);

describe('Test render additional options', () => {
  test('IsVisible flag', () => {
    function TestForm(props) {
      const {formData} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: 'testInputText1',
          name: 'testInputText1',
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          defaultValue: 'testInputText2',
        },
      });

      return (
        <div>
          {formData.testInputText1.render({isVisible: true})}
          {formData.testInputText2.render({isVisible: false})}
        </div>
      );
    }

    const {container} = render(<TestForm />);
    const TextInputComponents = container.querySelectorAll('.TestTextInput');

    expect(TextInputComponents[0]).toBeTruthy();
    expect(TextInputComponents[1]).not.toBeTruthy();
  });

  test('IsDisabled flag', () => {
    function TestForm(props) {
      const {formData} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
          defaultValue: 'testInputText1',
          name: 'testInputText1',
        },
        testInputText2: {
          formElement: formElements.textInput,
          name: 'testInputText2',
          defaultValue: 'testInputText2',
        },
        testInputText3: {
          formElement: formElements.textInput,
          name: 'testInputText3',
          defaultValue: 'testInputText3',
        },
        testSelect: {
          formElement: formElements.select,
          defaultValue: 'test-select',
        },
      });

      return (
        <div>
          {formData.testInputText1.render({disabled: true})}
          {formData.testInputText2.render({disabled: false})}
          {formData.testInputText3.render()}
          {formData.testSelect.render({
            selectOptions: [{value: 'test-select', label: 'Test Select'}],
            disabled: false,
          })}
        </div>
      );
    }

    const {container} = render(<TestForm />);
    const inputs = container.querySelectorAll('input');

    expect(inputs[0].disabled).toBeTruthy();
    expect(inputs[1].disabled).not.toBeTruthy();
    expect(inputs[2].disabled).not.toBeTruthy();
    expect(inputs[3].disabled).not.toBeTruthy();
  });

  test('Trigger an action on text input change', async () => {
    let handleInputChangeMock = jest.fn();

    function TestForm() {
      const {formData, setSchemaStateValue} = useForm({
        testInputText1: {
          formElement: formElements.textInput,
        },
        testInputText2: {
          formElement: formElements.textInput,
        },
      });

      return (
        <div>
          {formData.testInputText1.render({
            onChange: newVal => {
              expect(newVal).toBe('test1');
              handleInputChangeMock();
              setSchemaStateValue({
                fullFieldName: 'testInputText2',
                newValue: 'test2-on-change',
              });
            },
          })}
          {formData.testInputText2.render()}
        </div>
      );
    }

    const {container, getByDisplayValue} = render(<TestForm />);

    const input = container.querySelector('input');

    fireEvent.change(input, {
      target: {value: 'test1'},
    });
    await waitForElement(() => getByDisplayValue('test2-on-change'), {
      container,
    });

    expect(handleInputChangeMock).toHaveBeenCalled();
  });

  test('Trigger an action on text area change', async () => {
    let handleInputChangeMock = jest.fn();

    function TestForm() {
      const {formData} = useForm({
        testAreaText1: {
          formElement: formElements.textArea,
        },
      });

      return (
        <div>
          {formData.testAreaText1.render({onChange: handleInputChangeMock})}
        </div>
      );
    }

    const {container, getByText} = render(<TestForm />);

    const textArea = container.querySelector('textarea');

    fireEvent.change(textArea, {
      target: {value: 'test1'},
    });
    let a = await waitForElement(() => getByText('test1'), {
      container,
    });

    expect(handleInputChangeMock).toHaveBeenCalled();
  });

  test('Call appendTextOnFocus on focus area change', async () => {
    let handleInputChangeMock = jest.fn();
    let handleAppendTextOnFocusMock = jest.fn();

    function TestForm() {
      const {formData} = useForm({
        textArea1: {
          formElement: formElements.textArea,
        },
      });

      return (
        <div>
          {formData.textArea1.render({
            onChange: handleInputChangeMock,
            appendTextOnFocus: handleAppendTextOnFocusMock,
          })}
        </div>
      );
    }

    const {container} = render(<TestForm />);

    const textArea = container.querySelector('textarea');

    fireEvent.focus(textArea);
    await wait(() => expect(handleAppendTextOnFocusMock).toHaveBeenCalled());
    await wait(() => expect(handleInputChangeMock).toHaveBeenCalled());
  });

  test('Trigger an action on select input change', async () => {
    let handleInputChangeMock = jest.fn();
    let handleInputChangeMultiMock = jest.fn();

    function TestForm() {
      const {formData} = useForm({
        testSelect: {
          formElement: formElements.select,
        },
        testMultiSelect: {
          formElement: formElements.multiSelect,
        },
      });

      return (
        <div>
          {formData.testSelect.render({
            selectOptions: [
              {
                value: 'test-select',
                label: 'Test Select',
              },
            ],
            onInputChange: handleInputChangeMock,
          })}
          {formData.testMultiSelect.render({
            selectOptions: [
              {
                value: 'test-select-multi',
                label: 'Test Select Multi',
              },
            ],
            onInputChange: handleInputChangeMultiMock,
          })}
        </div>
      );
    }

    const {container, getByDisplayValue} = render(<TestForm />);
    const selectInput = container.querySelector('.TestSelect input');
    const multiSelectInput = container.querySelector('.TestMultiSelect input');

    fireEvent.change(selectInput, {
      target: {value: 'test'},
    });
    fireEvent.change(multiSelectInput, {
      target: {value: 'test multi'},
    });
    await waitForElement(
      () => [getByDisplayValue('test'), getByDisplayValue('test multi')],
      {
        container,
      }
    );

    expect(handleInputChangeMock).toHaveBeenCalled();
    expect(handleInputChangeMock.mock.calls[0][0]).toEqual('test');
    expect(handleInputChangeMultiMock).toHaveBeenCalled();
    expect(handleInputChangeMultiMock.mock.calls[0][0]).toEqual('test multi');
  });

  test('Trigger an action on select option change', async () => {
    let handleChangeOptionMock = jest.fn();
    let handleChangeMultiOptionMock = jest.fn();

    function TestForm() {
      const {formData} = useForm({
        testSelect: {
          formElement: formElements.select,
        },
        testMultiSelect: {
          formElement: formElements.multiSelect,
        },
      });

      return (
        <div>
          {formData.testSelect.render({
            selectOptions: [
              {
                value: 'test-select',
                label: 'Test Select',
              },
            ],
            onChangeTestValue: {value: 'test-select', label: 'Test Select'},
            onChange: handleChangeOptionMock,
          })}
          {formData.testMultiSelect.render({
            selectOptions: [
              {
                value: 'test-multi',
                label: 'Test multi select',
              },
            ],
            onChangeTestValue: [
              {
                value: 'test-multi',
                label: 'Test multi select',
              },
            ],
            onChange: handleChangeMultiOptionMock,
          })}
        </div>
      );
    }

    const {container, getByText} = render(<TestForm />);
    const testSelect = container.querySelector('.TestSelect');
    const testSelectMulti = container.querySelector('.TestMultiSelect');

    fireEvent.click(testSelect);
    fireEvent.click(testSelectMulti);

    await waitForElement(
      () => [getByText('Test Select'), getByText('Test multi select')],
      {
        container,
      }
    );

    expect(handleChangeOptionMock).toHaveBeenCalled();
    expect(handleChangeOptionMock.mock.calls[0][0]).toEqual({
      value: 'test-select',
      label: 'Test Select',
    });
    expect(handleChangeMultiOptionMock).toHaveBeenCalled();
    expect(handleChangeMultiOptionMock.mock.calls[0][0]).toEqual([
      {
        value: 'test-multi',
        label: 'Test multi select',
      },
    ]);
  });

  test('Trigger an action on checkbox change', async () => {
    let handleCheckboxChangeMock = jest.fn();

    function TestForm() {
      const {formData} = useForm({
        checkbox1: {
          formElement: formElements.checkbox,
          name: 'checkbox1',
          defaultValue: false,
          label: 'checkbox1',
        },
      });

      return (
        <div>
          {formData.checkbox1.render({onChange: handleCheckboxChangeMock})}
        </div>
      );
    }

    const {container, getByLabelText} = render(<TestForm />);

    fireEvent.click(getByLabelText('Label: checkbox1'));
    await wait(
      () => expect(getByLabelText('Label: checkbox1').checked).toBeTruthy(),
      {
        container,
      }
    );

    expect(handleCheckboxChangeMock).toHaveBeenCalled();
    expect(handleCheckboxChangeMock.mock.calls[0][0]).toBe(true);
  });
});

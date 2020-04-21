import {
  cleanup,
  fireEvent,
  render,
  wait,
  waitForElement,
} from '@testing-library/react';
import useForm from '../index';
import formElements from './formTestElements';
import React from 'react';

afterEach(cleanup);

describe('Bugs noticed in the wild', () => {
  test('State change triggered in onChange callback', async () => {
    // Noticed in admin-portal/Direct Accounts
    // when setSchemaStateValue is called in onChange callback of select, a
    // new value of select field is not set

    // The issue happened because in onChange cb another action was dispatched synchronously
    // after the first one (triggered by input change). In such a case reducer fn
    // is called twice but with the same state arg (second dispatch does not wait first to be completed).

    function TestForm(props) {
      const {formData, setSchemaStateValue} = useForm({
        someSelect: {
          defaultValue: '1',
          formElement: formElements.select,
        },
        testInputText: {
          formElement: formElements.textInput,
        },
      });

      return (
        <div>
          {formData.someSelect.render({
            selectOptions: [
              {value: '1', label: 'One'},
              {value: '2', label: 'Two'},
            ],
            onChangeTestValue: {value: '2', label: 'Two'},
            onChange: newVal => {
              setSchemaStateValue({
                fullFieldName: 'testInputText',
                newValue: 'select-changed-' + newVal.label,
                skipValidation: true,
              });
            },
          })}
          {formData.testInputText.render()}
        </div>
      );
    }

    const {container, queryByText, queryByDisplayValue} = render(<TestForm />);
    const [select] = container.querySelectorAll('.TestSelect');

    expect(queryByText('One')).toBeTruthy();

    fireEvent.click(select);

    await wait(
      () => [
        expect(queryByDisplayValue('select-changed-Two')).toBeTruthy(),
        expect(queryByText('Two')).toBeTruthy(),
        expect(queryByText('One')).not.toBeTruthy(),
      ],
      {
        container,
      }
    );
  });
});

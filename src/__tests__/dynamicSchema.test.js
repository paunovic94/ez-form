import React from 'react';
import {render, cleanup} from '@testing-library/react';
import useForm from '../index';
import formElements from './formTestElements';

afterEach(cleanup);

describe('Dynamic Schema', () => {
  test('dynamic element set to empty array initially', () => {
    function TestForm(props) {
      const {formData} = useForm({
        students: {
          dynamicSchema: true,
          dynamicSchemaItem: {
            name: {
              formElement: formElements.textInput,
              defaultValue: 'testInputText1',
            },
            gender: {
              formElement: formElements.radioGroup,
              defaultValue: 'MALE',
            },
          },
        },
      });

      if (formData.students.length === 0) {
        return <div>No students</div>;
      }

      return formData.students.map(studentSchema => (
        <div>
          {studentSchema.name.render()}
          {studentSchema.gender.render({
            options: [
              {value: 'MALE', label: 'Male'},
              {value: 'FEMALE', label: 'Female'},
              {value: 'OTHER', label: 'Other'},
            ],
          })}
        </div>
      ));
    }

    const {getByText, queryByDisplayValue} = render(<TestForm />);

    expect(getByText('No students')).toBeTruthy();
    expect(queryByDisplayValue('MALE')).toBeNull();

  });
});

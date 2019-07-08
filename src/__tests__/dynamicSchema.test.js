import React from 'react';
import {render, cleanup} from '@testing-library/react';
import useForm from '../index';
import formElements from './formTestElements';

afterEach(cleanup);

function TestForm({initData}) {
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
    <div className="student">
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

describe('Dynamic Schema', () => {
  test('dynamic element set to empty array initially', () => {
    const {getByText, queryByDisplayValue} = render(<TestForm />);

    expect(getByText('No students')).toBeTruthy();
    expect(queryByDisplayValue('MALE')).toBeNull();
  });

  // test('init dynamic element with data', () => {
  //   const {container, getByText, getByDisplayValue} = render(
  //     <TestForm
  //       initData={[
  //         {name: 'Student Studentic', gender: 'OTHER'},
  //         {name: 'Studentica Mala', gender: 'FEMALE'},
  //         {name: 'Student Pravi', gender: 'MALE'},
  //       ]}
  //     />
  //   );
  //   let numOfRenderedStudents = container.querySelectorAll('.student');
  //   expect(numOfRenderedStudents.length).toBe(3);
  //   expect(getByText('No students')).toBeNull();
  //   expect(getByDisplayValue('MALE')).toBeTruthy();
  //   expect(getByDisplayValue('OTHER')).toBeTruthy();
  //   expect(getByDisplayValue('FEMALE')).toBeTruthy();
  // });
});

import React, {useState} from 'react';
import {render, cleanup, fireEvent, wait, waitForDomChange} from '@testing-library/react';
import useForm from '../index';
import formElements from './formTestElements';

afterEach(cleanup);

const delay = (to) => new Promise(res => setTimeout(res, to));

function TestForm({initData}) {
  let [schema, setSchema] = useState({
    standardField: {
      formElement: formElements.textInput,
      defaultValue: 'testInputText1',
    },
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

  const {formData, addDynamicItem} = useForm(schema);

  if (formData.students.length === 0) {
    return (
      <>
        <button
          onClick={() =>
            addDynamicItem({
              dynamicFieldName: 'students',
              initData: {name: 'Milos1', gender: 'FEMALE'},
            })
          }>
          Add
        </button>
        <div>No students</div>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() =>
          addDynamicItem({
            dynamicFieldName: 'students',
            initData: {name: 'Milos2', gender: 'MALE'},
          })
        }>
        Add
      </button>
      {formData.students.map(studentSchema => (
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
      ))}
    </>
  );
}

describe('Dynamic Schema', () => {
  test('dynamic element set to empty array initially', () => {
    const {getByText, queryByDisplayValue} = render(<TestForm />);

    expect(getByText('No students')).toBeTruthy();
    expect(queryByDisplayValue('MALE')).toBeNull();
  });

  test('init dynamic element with data', async () => {
    const {
      container,
      getByText,
      queryByText,
      queryByDisplayValue,
    } = render(
      <TestForm
        initData={[
          {name: 'Student Studentic', gender: 'OTHER'},
          {name: 'Studentica Mala', gender: 'FEMALE'},
          {name: 'Student Pravi', gender: 'MALE'},
        ]}
      />
    );

    fireEvent.click(getByText('Add'));

    await delay(1000);
    // await wait(() => [expect(queryByDisplayValue('Milos1')).toBeTruthy()], {
    //   container,
    // });

    let numOfRenderedStudents = container.querySelectorAll('.student');
    expect(numOfRenderedStudents.length).toBe(1);
    expect(queryByText('No students')).toBeNull();
    expect(queryByDisplayValue('MALE')).toBeTruthy();
    expect(queryByDisplayValue('OTHER')).toBeNull();
    expect(queryByDisplayValue('FEMALE')).toBeNull();
  });
});

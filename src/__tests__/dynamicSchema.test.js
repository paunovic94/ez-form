import React, {useState} from 'react';
import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import useForm from '../index';
import formElements from './formTestElements';

afterEach(cleanup);

const delay = to => new Promise(res => setTimeout(res, to));

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

  const {formData, addDynamicItem, removeDynamicItem} = useForm(
    schema,
    initData ? {students: initData} : undefined
  );

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
      {formData.students.map((studentSchema, index) => (
        <div className="student" key={index}>
          {studentSchema.name.render()}
          {studentSchema.gender.render({
            options: [
              {value: 'MALE', label: 'Male'},
              {value: 'FEMALE', label: 'Female'},
              {value: 'OTHER', label: 'Other'},
            ],
          })}
          <button
            onClick={() =>
              removeDynamicItem({
                dynamicFieldName: 'students',
                index,
              })
            }>
            Remove
            {index + 1}
          </button>
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
      queryByText,
      queryByDisplayValue,
      queryAllByDisplayValue,
    } = render(
      <TestForm
        initData={[
          {name: 'Student Studentic', gender: 'OTHER'},
          {name: 'Studentica Mala', gender: 'FEMALE'},
          {name: 'Student Pravi', gender: 'MALE'},
        ]}
      />
    );

    // fireEvent.click(getByText('Add'));
    //
    // await delay(1000);
    // await wait(() => [expect(queryByDisplayValue('Milos1')).toBeTruthy()], {
    //   container,
    // });

    let numOfRenderedStudents = container.querySelectorAll('.student');
    expect(numOfRenderedStudents.length).toBe(3);
    expect(queryByText('No students')).toBeNull();

    let maleRadioOptions = queryAllByDisplayValue('MALE');
    let femaleRadioOptions = queryAllByDisplayValue('FEMALE');
    let otherRadioOptions = queryAllByDisplayValue('OTHER');

    expect(maleRadioOptions[0].checked).toBe(false);
    expect(maleRadioOptions[1].checked).toBe(false);
    expect(maleRadioOptions[2].checked).toBe(true);

    expect(femaleRadioOptions[0].checked).toBe(false);
    expect(femaleRadioOptions[1].checked).toBe(true);
    expect(femaleRadioOptions[2].checked).toBe(false);

    expect(otherRadioOptions[0].checked).toBe(true);
    expect(otherRadioOptions[1].checked).toBe(false);
    expect(otherRadioOptions[2].checked).toBe(false);

    expect(queryByDisplayValue('Student Studentic')).toBeTruthy();
    expect(queryByDisplayValue('Studentica Mala')).toBeTruthy();
    expect(queryByDisplayValue('Student Pravi')).toBeTruthy();
  });

  test('addDynamicItem', async () => {
    const {
      container,
      getByText,
      queryByDisplayValue,
      queryAllByDisplayValue,
      getAllByLabelText,
    } = render(<TestForm initData={[{name: 'Student1', gender: 'OTHER'}]} />);

    fireEvent.click(getByText('Add'));
    // fireEvent.click(getByText('Add'));
    await delay(100);

    let numOfRenderedStudents = container.querySelectorAll('.student');
    expect(numOfRenderedStudents.length).toBe(2);
    expect(queryAllByDisplayValue('Student1').length).toBe(1);
    expect(queryAllByDisplayValue('Milos2').length).toBe(1);

    let otherRadioOptions = queryAllByDisplayValue('OTHER');
    expect(otherRadioOptions[0].checked).toBe(true);
    expect(otherRadioOptions[1].checked).toBe(false);
    // expect(otherRadioOptions[2].checked).toBe(false);

    let maleRadioOptions = queryAllByDisplayValue('MALE');

    expect(maleRadioOptions[0].checked).toBe(false);
    expect(maleRadioOptions[1].checked).toBe(true);
    // expect(maleRadioOptions[2].checked).toBe(true);
  });

  test('removeDynamicItem', async () => {
    const {container, getByText, queryAllByDisplayValue} = render(
      <TestForm
        initData={[
          {name: 'Student1', gender: 'OTHER'},
          {name: 'Student2', gender: 'MALE'},
          {name: 'Student3', gender: 'FEMALE'},
          {name: 'Student4', gender: 'MALE'},
          {name: 'Student5', gender: 'FEMALE'},
        ]}
      />
    );

    let numOfRenderedStudents = container.querySelectorAll('.student');
    expect(numOfRenderedStudents.length).toBe(5);
    expect(queryAllByDisplayValue('Student1').length).toBe(1);
    expect(queryAllByDisplayValue('Student2').length).toBe(1);
    expect(queryAllByDisplayValue('Student3').length).toBe(1);
    expect(queryAllByDisplayValue('Student4').length).toBe(1);
    expect(queryAllByDisplayValue('Student5').length).toBe(1);

    fireEvent.click(getByText('Remove3')); // student3
    // ostalo 1,2,4,5
    fireEvent.click(getByText('Remove1')); // student1
    // ostalo 2,4,5
    // Student5 je sad index 3
    fireEvent.click(getByText('Remove3')); // student5
    await delay(100);

    let numOfRenderedStudents2 = container.querySelectorAll('.student');
    expect(numOfRenderedStudents2.length).toBe(2);
    expect(queryAllByDisplayValue('Student1').length).toBe(0);
    expect(queryAllByDisplayValue('Student2').length).toBe(1);
    expect(queryAllByDisplayValue('Student3').length).toBe(0);
    expect(queryAllByDisplayValue('Student4').length).toBe(1);
    expect(queryAllByDisplayValue('Student5').length).toBe(0);
  });

  test('update', async () => {
    const {container, getByText, queryAllByDisplayValue} = render(
      <TestForm
        initData={[
          {name: 'Student1', gender: 'OTHER'},
          {name: 'Student2', gender: 'MALE'},
          {name: 'Student3', gender: 'FEMALE'},
        ]}
      />
    );

    expect(queryAllByDisplayValue('Student1').length).toBe(1);
    expect(queryAllByDisplayValue('Student2').length).toBe(1);
    expect(queryAllByDisplayValue('Student3').length).toBe(1);

    const [input1, input2, input3] = container.querySelectorAll('input[type=text]');
    fireEvent.change(input1, {target: {value: 'test1'}});
    fireEvent.change(input2, {target: {value: 'test2'}});
    fireEvent.change(input3, {target: {value: 'test3'}});

    await delay(100);

    expect(queryAllByDisplayValue('Student1').length).toBe(0);
    expect(queryAllByDisplayValue('Student2').length).toBe(0);
    expect(queryAllByDisplayValue('Student3').length).toBe(0);

    expect(queryAllByDisplayValue('test1').length).toBe(1);
    expect(queryAllByDisplayValue('test2').length).toBe(1);
    expect(queryAllByDisplayValue('test3').length).toBe(1);
  });

  // validation
});

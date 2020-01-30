import {updateFieldProp} from '../reducer';
import {cleanup} from '@testing-library/react';

afterEach(cleanup);

describe('utils', () => {
  let formState = {
    field1: {
      isVisible: true,
      error: '',
      value: 'v1',
    },
    field2: {
      isVisible: true,
      error: 'e2',
      value: 'v2',
    },
    field3: {
      isDynamic: true,
      value: [
        {
          field31: {
            isVisible: true,
            error: 'e310',
            value: 'v310',
          },
          field32: {
            isVisible: true,
            error: 'e320',
            value: 'v320',
          },
        },
        {
          field31: {
            isVisible: true,
            error: 'e311',
            value: 'v311',
          },
          field32: {
            isVisible: true,
            error: 'e321',
            value: 'v321',
          },
        },
      ],
    },
  };
  let formStateStringified = JSON.stringify(formState);

  test('updateFieldProp - standard field', () => {
    let updatedState = updateFieldProp({
      formState,
      fieldName: 'field1',
      updateValues: {
        error: 'e1',
      },
    });

    expect(updatedState).toEqual({
      field1: {
        isVisible: true,
        error: 'e1',
        value: 'v1',
      },
      field2: {
        isVisible: true,
        error: 'e2',
        value: 'v2',
      },
      field3: {
        isDynamic: true,
        value: [
          {
            field31: {
              isVisible: true,
              error: 'e310',
              value: 'v310',
            },
            field32: {
              isVisible: true,
              error: 'e320',
              value: 'v320',
            },
          },
          {
            field31: {
              isVisible: true,
              error: 'e311',
              value: 'v311',
            },
            field32: {
              isVisible: true,
              error: 'e321',
              value: 'v321',
            },
          },
        ],
      },
    });

    // original data not mutated!
    expect(JSON.stringify(formState)).toBe(formStateStringified);
  });

  test('updateFieldProp - dynamic field', () => {
    let updatedState = updateFieldProp({
      formState,
      fieldName: 'field3',
      index: 1,
      subFieldName: 'field32',
      updateValues: {
        value: 'v321-updated',
      },
    });

    expect(updatedState).toEqual({
      field1: {
        isVisible: true,
        error: '',
        value: 'v1',
      },
      field2: {
        isVisible: true,
        error: 'e2',
        value: 'v2',
      },
      field3: {
        isDynamic: true,
        value: [
          {
            field31: {
              isVisible: true,
              error: 'e310',
              value: 'v310',
            },
            field32: {
              isVisible: true,
              error: 'e320',
              value: 'v320',
            },
          },
          {
            field31: {
              isVisible: true,
              error: 'e311',
              value: 'v311',
            },
            field32: {
              isVisible: true,
              error: 'e321',
              value: 'v321-updated',
            },
          },
        ],
      },
    });

    // original data not mutated!
    expect(JSON.stringify(formState)).toBe(formStateStringified);
  });
});

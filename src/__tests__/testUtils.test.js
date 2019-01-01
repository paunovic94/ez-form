import React from "react";
import { render, cleanup } from "react-testing-library";

afterEach(cleanup);

describe("Playground for figuring out test utils", () => {
  test("react test", () => {
    const {
      container,
      getByTestId,
      getByValue,
      queryByText,
      queryByValue
    } = render(
      <div>
        Hello, some text!
        <input data-testid="test" type="text" defaultValue="hello" />
      </div>
    );

    const inputByTestId = getByTestId("test");
    const inputByValue = getByValue("hello");
    const inputByValueQuery = queryByValue("hello");
    const inputByQuery = container.querySelector("input");
    const allInputsByQuery = container.querySelectorAll("input");
    const helloText = queryByText("Hello, some text!");

    expect(inputByTestId.value).toEqual("hello");
    expect(inputByValue.value).toEqual("hello");
    expect(inputByValueQuery).toBeTruthy();
    expect(inputByQuery.value).toEqual("hello");
    expect(allInputsByQuery.length).toEqual(1);
    expect(helloText).toBeTruthy();
  });
});

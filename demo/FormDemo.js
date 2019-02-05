import React, { useReducer } from "react";
import useForm from "./ez-form/useFormDemo";
import formSchema from "./formSchema";
import formElements from "./formElements";

let initialState = {
  count: 0,
  source: 100
};

function reducer(state, action) {
  switch (action.type) {
    case "INC":
      return { ...state, count: state.count + 1 };
    case "DEC":
      return { ...state, count: state.count - 1 };
    case "CHANGE_SOURCE":
      return { ...state, source: action.source };
  }
}

export default function FormDemo() {
  let formData = useForm(formSchema);
  let [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <h1>Form Demo</h1>
      <b>Count: {state.count}</b>
      <button onClick={() => dispatch({ type: "INC" })}>Inc</button>
      <button onClick={() => dispatch({ type: "DEC" })}>Dec</button>
      <hr />
      <b>Source: {state.source}</b>
      <hr />

      <div>
        {formData.firstName.render({
          onChange: val => console.log("Menja se: " + val)
        })}
      </div>
      <div>{formData.lastName.render({ fontSize: 11 })}</div>
      <div>
        {formData.country.render({
          selectOptions: [
            { value: "SERBIA", label: "Serbia" },
            { value: "GREECE", label: "Greece" }
          ]
        })}
      </div>

      <button
        onClick={() =>
          dispatch({ type: "CHANGE_SOURCE", source: formData.firstName.value })
        }
      >
        Change Source
      </button>
    </div>
  );
}

Basics
	- Keep input value and error in state
	- Handle onChange event on input to update state (validation is performed here)
	- "externalized" formElement (formElements file)
	- defaultValue
	- label, label2

Additional requirements
	- Trigger an action on input change (get some data, update another field, …)
	- Validate another field (validateAnotherField) on input change
	  (i.e. password confirmation - when password is changed, confirmation should be validated again)
	- withDependancy validation
	- Update another field(s) on change (i.e country-state selects or clinics-primary clinic, address same as patient's)
	- multiselect onValueClick
	- isVisible (invisible items don't pass through validation nor are included in prepareForServer result) (probably will be a part of schema)
	- disabled field
	- pass additionalProps specific to underling element (i.e. options for select, optionRenderer, labelIcon, etc.)
	- dynamic sub-foms - be able to dynamically extend schema (i.e add contact method (1 field), add address info(group of fields))

Form utils
	- init form from schema with initial data
	- prepare form data for server (withAdditionalProps option for selects)
	- clone form data to be able to revert form to some previous state
	- update form state - setSchemaStateValue, setSchemaStateValues (Bulk)
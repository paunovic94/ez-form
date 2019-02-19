Basics
    * Keep input value and error in state
	* Handle onChange event on input to update state (validation is performed here)
	* "externalized" formElement (formElements file)
	* defaultValue
	* label, label2

Additional requirements
	* Trigger an action on input change (get some data, update another field, …)
	* Validate another field (validateAnotherField) on input change
	  (i.e. password confirmation - when password is changed, confirmation should be validated again)
	* withDependancy validation
	* Update another field(s) on change (i.e country-state selects or clinics-primary clinic, address same as patient's)
	* multiselect onValueClick
	* isVisible (invisible items don't pass through validation nor are included in prepareForServer result) (probably will be a part of schema)
	* disabled field
	* pass additionalProps specific to underling element (i.e. options for select, optionRenderer, labelIcon, etc.)
	* dynamic sub-foms - be able to dynamically extend schema (i.e add contact method (1 field), add address info(group of fields))

Form utils
	* init form from schema with initial data
	* prepare form data for server (withAdditionalProps option for selects)
	* clone form data to be able to revert form to some previous state
	* update form state - setSchemaStateValue, setSchemaStateValues (Bulk)
	* validate function


Differences with original schema:
	* withDependancy validation: no wraper function withDependancy, instead we skip validator function if args have dependencyField and dependency value is different than in state or the state value is falsy
	* if we pass dependencyInValidationArgs: true in val rule args, than compare dependencyValue with value passed as arg in validate function

	Tests
	* init.test
		- init default value from schema (keep value in state)
		- default isVisible flag in schema
		- init values with second arg
		- label and label2
		- select init with obj/string that is/is't in options
		- multi select ([] with obj/string that is/is't in options)
	* update.test
		- update field value in state onChange
	* validation.test
		- validate value on inputChage
		- support string and intl error messages (message is handled in formElemet)
		- support default and custom error messages
		- args property for validation func (based on another schema field or fixed arg)
		- validate another field 
		- prevent cyclically validation with validate another field (validate another field only on field change)
		- with dependancy validation
	* render.test
		- render componet based on is Visible prop in arg
		- disable component based on disabled prop in arg
		- onChange cb for text input and selet
		- onInputChange for select

	* prepareForServer.test
	* setSchemaStateValue.test
	* getSchemaStateValue.test
	* cloneStateValues.test


	* npm publish --access public

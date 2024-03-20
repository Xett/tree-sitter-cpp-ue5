; inherits: c

((identifier) @variable.member
	(#lua-match? @variable.member "^m_.*$"))

(parameter_declaration
	declarator: (reference_declarator) @variable.parameter)

; function(Foo ... foo)
(variadic_parameter_declaration
	declarator:
		(variadic_declarator
			(_) @variable.parameter))

; int foo = 0
(optional_parameter_declaration
	declarator: (_) @variable.parameter)

((field_expression
	(field_identifier) @function.method) @_parent
 	(#has-parent? @_parent template_method function_declarator))

(field_declaration
	(field_identifier) @variable.member)

(field_initializer
	(field_identifier) @property)

(function_declarator
	declarator: (field_identifier) @function.method)

(concept_definition
	name: (identifier) @type.definition)

(alias_declaration
  name: (type_identifier) @type.definition)

(auto) @type.builtin

(namespace_identifier) @module

((namespace_identifier) @type
	(#lua-match? @type "^[%u]"))

(case_statement
	value:
		(qualified_identifier
			(identifier) @constant))

(using_declaration
	.
	"using"
	.
	"namespace"
	.
	[
		(qualified_identifier)
		(identifier)
	] @module)

(destructor_name
	(identifier) @function.method)

; Functions
(function_declarator
	(qualified_identifier
		(identifier) @function))

(function_declarator
	(qualified_identifier
		(qualified_identifier
			(identifier) @function)))

(function_declarator
	(qualified_identifier
		(qualified_identifier
			(qualified_identifier
				(identifier) @function))))

((qualified_identifier
	(qualified_identifier
		(qualified_identifier
			(qualified_identifier
				(identifier) @function)))) @_parent
 	(#has-ancestor? @_parent function_declarator))

(function_declarator
	(template_function
		(identifier) @function))

(operator_name) @function

"operator" @function

"static_assert" @function.builtin

(call_expression
	(qualified_identifier
		(identifier) @function.call))

(call_expression
	(qualified_identifier
		(qualified_identifier
			(identifier) @function.call)))

(call_expression
	(qualified_identifier
		(qualified_identifier
			(qualified_identifier
				(identifier) @function.call))))

((qualified_identifier
	(qualified_identifier
		(qualified_identifier
			(qualified_identifier
				(identifier) @function.call)))) @_parent
	(#has-ancestor? @_parent call_expression))

(call_expression
	(template_function
		(identifier) @function.call))

(call_expression
	(qualified_identifier
		(template_function
			(identifier) @function.call)))

(call_expression
	(qualified_identifier
		(qualified_identifier
			(template_function
				(identifier) @function.call))))

(call_expression
	(qualified_identifier
		(qualified_identifier
			(qualified_identifier
				(template_function
					(identifier) @function.call)))))

((qualified_identifier
	(qualified_identifier
		(qualified_identifier
			(qualified_identifier
				(template_function
					(identifier) @function.call))))) @_parent
	(#has-ancestor? @_parent call_expression))

; Methods
(function_declarator
	(template_method
		(field_identifier) @function.method))

(call_expression
	(field_expression
		(field_identifier) @function.method.call))

; Constructors
((function_declarator
	(qualified_identifier
		(identifier) @constructor))
 	(#lua-match? @constructor "^%u"))

((call_expression
	function: (identifier) @constructor)
 	(#lua-match? @constructor "^%u"))

((call_expression
	function:
		(qualified_identifier
			name: (identifier) @constructor))
 	(#lua-match? @constructor "^%u"))

((call_expression
	function:
		(field_expression
			field: (field_identifier) @constructor))
 	(#lua-match? @constructor "^%u"))

; constructing a type in an initialiser list: Constructor (): **SuperType (1)**
((field_initializer
	(field_identifier) @constructor
	(argument_list))
 	(#lua-match? @constructor "^%u"))

; Constants
(this) @variable.builtin

(null
	"nullptr" @null (#set! "priority 130"))

(true) @boolean

(false) @boolean

; Literals
(raw_string_literal) @string

; Keywords
[
	"try"
	"catch"
	"noexcept"
	"throw"
] @keyword.exception

[
	"class"
	"decltype"
	"explicit"
	"friend"
	"namespace"
	"override"
	"template"
	"typename"
	"using"
	"concept"
	"requires"
	"constexpr"
] @keyword

[
	"co_await"
	"co_yield"
	"co_return"
] @keyword.coroutine

[
	"public"
	"private"
	"protected"
	"virtual"
	"final"
] @type.qualifier

[
	"new"
	"delete"
	"xor"
	"bitand"
	"bitor"
	"compl"
	"not"
	"xor_eq"
	"and_eq"
	"or_eq"
	"not_eq"
	"and"
	"or"
] @keyword.operator

"<=>" @operator

"::" @punctuation.scope_resolution

(template_argument_list
	[
		"<"
		">"
	] @punctuation.bracket)

(template_parameter_list
	[
		"<"
		">"
	] @punctuation.bracket)

(literal_suffix) @operator

; Super
((field_identifier) @super (#match? @super "Super") (#set! "priority" 130))
((namespace_identifier) @super (#eq? @super "Super") (#set! "priority" 130))

; UE Macros
((ue_specifier_type) @ue.specifier.type (#set! "priority" 130))

(ue_parameter
	parameter: (identifier) @ue.parameter.identifier (#set! "priority" 130))
(ue_parameter_assignment_list
	(identifier) @ue.parameter.identifier (#set! "priority" 130))

((ue_generated_type) @ue.generated.type (#set! "priority" 130))
((ue_field_declaration_type) @ue.field.declaration.type (#set! "priority" 130))

;; Gameplay Tags
((ue_gameplay_tag_type) @ue.gameplay.tag.type (#set! "priority" 130))
((namespace_identifier) @ue.gameplay.tag (#match? @ue.gameplay.tag "GameplayTags$") (#set! "priority" 130))


((ue_namespace) @ue.namespace (#set! "priority" 130))
((ue_safety_type) @ue.safety.type (#set! "priority" 130))
((ue_text_type) @ue.text.type (#set! "priority" 130))
((ue_delegate_types) @ue.delegate.type (#set! "priority" 130))
((ue_log_call) @ue.log.call (#set! "priority" 130))

;; Class Names
;;; UObject
((type_identifier) @ue.name.uobject (#match? @ue.name.uobject "^U[A-Z]") (#set! "priority" 130))
((identifier) @ue.name.uobject (#match? @ue.name.uobject "^U[A-Z]") (#set! "priority" 130))
((namespace_identifier) @ue.name.uobject (#match? @ue.name.uobject "^U[A-Z]") (#set! "priority" 130))

;;; AActor
((type_identifier) @ue.name.aactor (#match? @ue.name.aactor "^A[A-Z]") (#set! "priority" 130))
((identifier) @ue.name.aactor (#match? @ue.name.aactor "^A[A-Z]") (#set! "priority" 130))
((namespace_identifier) @ue.name.aactor (#match? @ue.name.aactor "^A[A-Z]") (#set! "priority" 130))

;;; FStruct
((type_identifier) @ue.name.fstruct (#match? @ue.name.fstruct "^F[A-Z]") (#set! "priority" 130))
((identifier) @ue.name.fstruct (#match? @ue.name.fstruct "^F[A-Z]") (#set! "priority" 130))
((namespace_identifier) @ue.name.fstruct (#match? @ue.name.fstruct "^F[A-Z]") (#set! "priority" 130))

;;; IInterface
((type_identifier) @ue.name.iinterface (#match? @ue.name.iinterface "^I[A-Z]") (#set! "priority" 130))
((identifier) @ue.name.iinterface (#match? @ue.name.iinterface "^I[A-Z]") (#set! "priority" 130))
((namespace_identifier) @ue.name.iinterface (#match? @ue.name.iinterface "^I[A-Z]") (#set! "priority" 130))

;;; TTemplate
((type_identifier) @ue.name.ttemplate (#match? @ue.name.ttemplate "^T[A-Z]") (#set! "priority" 130))

;;; EEnum
((type_identifier) @ue.name.eenum (#match? @ue.name.eenum "^E[A-Z]") (#set! "priority" 130))
((identifier) @ue.name.eenum (#match? @ue.name.eenum "^E[A-Z]") (#set! "priority" 130))
((namespace_identifier) @ue.name.eenum (#match? @ue.name.eenum "^E[A-Z]") (#set! "priority" 130))
(qualified_identifier
	scope: (namespace_identifier) @ue.name.eenum (#match? @ue.name.eenum "^E[A-Z]") (#set! "priority" 130)
	name: (identifier) @ue.item.eenum (#match? @ue.name.eenum "^E[A-Z]") (#set! "priority" 130))

; Property types
;; Float
(field_declaration
	type: (primitive_type) @float.type (#eq? @float.type "float") (#set! "priority" 130)
	declarator: (field_identifier) @float.name (#eq? @float.type "float") (#set! "priority" 130)
	default_value: (number_literal) @float.default (#set! "priority" 130))
((primitive_type) @float.type (#eq? @float.type "f$") (#set! "priority" 130))
((number_literal) @float.value (#match? @float.value "f$") (#set! "priority" 130))

;; Void
((primitive_type) @void.type (#eq? @void.type "void") (#set! "priority" 130))

;; Boolean
((primitive_type) @bool.type (#eq? @bool.type "bool") (#set! "priority" 130))

;; Integer
((type_identifier) @int.type (#match? @int.type "int") (#set! "priority" 130))

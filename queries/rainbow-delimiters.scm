(parameter_list
	"(" @delimiter
	")" @delimiter @sentinel) @container

(argument_list
	"(" @delimiter
	")" @delimiter @sentinel) @container

(parenthesized_expression
	"(" @delimiter
	")" @delimiter @sentinel) @container

(compound_statement
	"{" @delimiter
	"}" @delimiter @sentinel) @container

(initializer_list
	"{" @delimiter
	"}" @delimiter @sentinel) @container

(subscript_argument_list
	"[" @delimiter
	"]" @delimiter @sentinel) @container

(field_declaration_list
	"{" @delimiter
	"}" @delimiter @sentinel) @container

(declaration_list
	"{" @delimiter
	"}" @delimiter @sentinel) @container

(template_parameter_list
	"<" @delimiter
	">" @delimiter @sentinel) @container

(initializer_list
	"{" @delimiter
	"}" @delimiter @sentinel) @container

(template_argument_list
	"<" @delimiter
	">" @delimiter @sentinel) @container

(ue_safety_macro
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_text_macro
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_log_macro
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_paramater_assignment_list
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_specifier
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_generated_body
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_field_declaration_specifier
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_gameplay_tag
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_delegate_specifier
	"(" @delimiter
	")" @delimiter @sentinel) @container

(ue_delegate_declaration
	"(" @delimiter
	")" @delimiter @sentinel) @container

/**
 * @file C++ grammar for tree-sitter
 * @author Max Brunsfeld
 * @license MIT
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const CPP = require('tree-sitter-cpp/grammar');

const PREC = CPP.PREC;
module.exports = grammar(CPP, {
	name: 'cpp_ue5',

	conflicts: $ => [
		// C
		[$._type_specifier, $._declarator],
		[$._type_specifier, $._expression_not_binary],
		[$.sized_type_specifier],
		[$.attributed_statement],
		[$._declaration_modifiers, $.attributed_statement],

		// C++
		[$.template_function, $.template_type],
		[$.template_function, $.template_type, $._expression_not_binary],
		[$.template_function, $.template_type, $.qualified_identifier],
		[$.template_method, $.field_expression],
		[$.template_type, $.qualified_type_identifier],
		[$.qualified_type_identifier, $.qualified_identifier],
		[$.comma_expression, $.initializer_list],
		[$._expression_not_binary, $._declarator],
		[$._expression_not_binary, $.structured_binding_declarator],
		[$._expression_not_binary, $._declarator, $._type_specifier],
		[$.parameter_list, $.argument_list],
		[$._type_specifier, $.call_expression],
		[$._declaration_specifiers, $._constructor_specifiers],
		[$._binary_fold_operator, $._fold_operator],
		[$._function_declarator_seq],
		[$._type_specifier, $.sized_type_specifier],
		[$.initializer_pair, $.comma_expression],
		[$.expression_statement, $._for_statement_body],
		[$.init_statement, $._for_statement_body],
		[$._type_specifier, $.function_definition],

		[$._scope_resolution],
		[$.variadic_parameter, $.parameter_list],
		[$.parameter_list, $._old_style_parameter_list],
		[$._type_specifier, $._old_style_parameter_list, $._expression_not_binary],
	],

	rules: {
		_top_level_item: ($, original) => choice(
			original,
			$.ue_top_level_item,
		),

		_block_item: ($, original) => choice(
			original,
			$.ue_block_item,
		),

		// Types

		class_specifier: $ => prec.left(seq(
			optional($.ue_specifier),
			'class',
			field('namespace', optional(alias(/[A-Z]+_API/, $.ue_namespace))),
			$._class_declaration,
		)),

		struct_specifier: $ => prec.left(seq(
			optional($.ue_specifier),
			'struct',
			field('namespace', optional(alias(/[A-Z]+_API/, $.ue_namespace))),
			$._class_declaration,
		)),

		function_definition: $ => seq(
			field('ue_namespace', optional(alias(/[A-Z]+_API/, $.ue_namespace))),
			optional($.ms_call_modifier),
			$._declaration_specifiers,
			optional($.ms_call_modifier),
			field('declarator', $._declarator),
			field('body', choice($.compound_statement, $.try_statement)),
		),

		declaration: $ => seq(
			field('ue_namespace', optional(alias(/[A-Z]+_API/, $.ue_namespace))),
			$._declaration_specifiers,
			commaSep1(field('declarator', choice(
				seq(
					// C uses _declaration_declarator here for some nice macro parsing in function declarators,
					// but this causes a world of pain for C++ so we'll just stick to the normal _declarator here.
					$._declarator,
					optional($.gnu_asm_expression),
				),
				$.init_declarator,
			))),
			';',
		),

		enum_specifier: $ => prec.right(seq(
			optional($.ue_specifier),
			'enum',
			optional(choice('class', 'struct')),
			optional(alias(/[A-Z]+_API/, $.ue_namespace)),
			choice(
				seq(
					field('name', $._class_name),
					optional($._enum_base_clause),
					optional(field('body', $.enumerator_list)),
				),
				field('body', $.enumerator_list),
			),
			optional($.attribute_specifier),
		)),

		field_declaration_list: $ => seq(
			'{',
			optional($.ue_generated_body),
			repeat($._field_declaration_list_item),
			'}',
		),

		field_declaration: $ => seq(
			optional($.ue_field_declaration_specifier),
			field('ue_namespace', optional(alias(/[A-Z]+_API/, $.ue_namespace))),
			$._declaration_specifiers,
			commaSep(seq(
				field('declarator', $._field_declarator),
				optional(choice(
					$.bitfield_clause,
					field('default_value', $.initializer_list),
					seq('=', field('default_value', choice($._expression, $.initializer_list))),
				)),
			)),
			optional($.attribute_specifier),
			';',
		),

		inline_method_definition: $ => seq(
			optional($.ue_field_declaration_specifier),
			field('ue_namespace', optional(alias(/[A-Z]+_API/, $.ue_namespace))),
			$._declaration_specifiers,
			field('declarator', $._field_declarator),
			choice(
				field('body', choice($.compound_statement, $.try_statement)),
				$.default_method_clause,
				$.delete_method_clause,
			),
		),

		// Expressions

		_expression_not_binary: ($, original) => choice(
			original,
			$.ue_text_macro,
		),
	
		ue_safety_type: $ => choice(
			'check',
			'checkCode',
			'checkf',
			'checkNoEntry',
			'checkNoReentry',
			'checkNoRecursion',
			'verify',
			'verifyf',
			'checkSlow',
			'checkfSlow',
			'verifySlow',
			'ensure',
			'ensureMsgf',
			'ensureAlways',
			'ensureAlwaysMsgf',
		),

		ue_safety_macro: $ => seq(
			field('type', $.ue_safety_type),
			'(',
			commaSep($._expression),
			')',
			';',
		),

		ue_text_type: $ => choice(
			'TEXT',
		),

		ue_text_macro: $ => seq(
			field('type', $.ue_text_type),
			'(',
			field('text', $.string_literal),
			')',
		),

		ue_log_macro: $ => seq(
			field('type', alias('UE_LOG', $.ue_log_call)),
			'(',
			field('log_type', alias($.identifier, $.ue_log_type)),
			',',
			field('log_level', alias($.identifier, $.ue_log_level)),
			',',
			field('message', $.ue_text_macro),
			',',
			commaSep($._expression),
			')',
		),

		ue_parameter_assignment_list: $ => seq(
			'(',
			repeat(choice(
				seq(
					$.identifier,
					optional(seq(
						'=',
						choice(
							$.identifier,
							$.string_literal,
							$.ue_text_macro,
						),
					)),
				),
				$.string_literal,
				$.ue_text_macro,
			)),
			')',
		),

		ue_parameter_assignment: $ => field(
			'assignment',
			choice(
				$.string_literal,
				$.identifier,
				$.ue_text_macro,
				$.ue_parameter_assignment_list,
			),
		),

		ue_parameter: $ => seq(
			field('parameter', $.identifier),
			optional(seq(
				'=',
				$.ue_parameter_assignment,
			)),
		),

		ue_parameter_list: $ => seq(
			commaSep1($.ue_parameter),
		),

		ue_specifier_type: $ => choice(
			'USTRUCT',
			'UCLASS',
			'UENUM',
			'UINTERFACE',
		),

		ue_specifier: $ => seq(
			field('ue_macro', $.ue_specifier_type),
			'(',
			field('parameter_list', optional($.ue_parameter_list)),
			')',
		),

		ue_generated_type: $ => choice(
			'GENERATED_BODY',
			'GENERATED_USTRUCT_BODY',
			'GENERATED_UCLASS_BODY',
			'GENERATED_UINTERFACE_BODY',
			'GENERATED_IINTERFACE_BODY',
		),

		ue_generated_body: $ => seq(
			field('type', $.ue_generated_type),
			'(',
			')',
		),

		ue_field_declaration_type: $ => choice(
			'UPROPERTY',
			'UFUNCTION',
		),

		ue_field_declaration_specifier: $ => seq(
			field('type', $.ue_field_declaration_type),
			'(',
			field('parameter_list', optional($.ue_parameter_list)),
			')',
		),

		ue_gameplay_tag: $ => seq(
			field('namespace', optional(alias(/[A-Z]+_API/, $.ue_namespace))),
			alias(
				choice(
					'UE_DEFINE_GAMEPLAY_TAG',
					'UE_DECLARE_GAMEPLAY_TAG_EXTERN',
				),
				$.ue_gameplay_tag_type,
			),
			'(',
			field('parameter_list', $.ue_parameter_list),
			')',
			';',
		),

		ue_delegate_specifier: $ => seq(
			field('type', alias('UDELEGATE', $.delegate_specifier_type)),
			'(',
			field('parameter_list', optional($.ue_parameter_list)),
			')',
		),

		ue_delegate_declaration_type: $ => choice(
			'DECLARE_DELEGATE',
			'DECLARE_DELEGATE_RetVal',
			'DECLARE_DELEGATE_OneParam',
			'DECLARE_DELEGATE_RetVal_OneParam',
			'DECLARE_DELEGATE_TwoParams',
			'DECLARE_DELEGATE_RetVal_TwoParams',
			'DECLARE_DELEGATE_ThreeParams',
			'DECLARE_DELEGATE_RetVal_ThreeParams',
			'DECLARE_DELEGATE_FourParams',
			'DECLARE_DELEGATE_RetVal_FourParams',
			'DECLARE_DELEGATE_FiveParams',
			'DECLARE_DELEGATE_RetVal_FiveParams',
			'DECLARE_DELEGATE_SixParams',
			'DECLARE_DELEGATE_RetVal_SixParams',
			'DECLARE_DELEGATE_SevenParams',
			'DECLARE_DELEGATE_RetVal_SevenParams',
			'DECLARE_DELEGATE_EightParams',
			'DECLARE_DELEGATE_RetVal_EightParams',
			'DECLARE_DELEGATE_NineParams',
			'DECLARE_DELEGATE_RetVal_NineParams',
		),

		ue_event_declaration_type: $ => choice(
			'DECLARE_EVENT',
			'DECLARE_EVENT_OneParam',
			'DECLARE_EVENT_TwoParams',
			'DECLARE_EVENT_ThreeParams',
			'DECLARE_EVENT_FourParams',
			'DECLARE_EVENT_FiveParams',
			'DECLARE_EVENT_SixParams',
			'DECLARE_EVENT_SevenParams',
			'DECLARE_EVENT_EightParams',
			'DECLARE_EVENT_NineParams',
		),

		ue_dynamic_delegate_declaration_type: $ => choice(
			'DECLARE_DYNAMIC_DELEGATE',
			'DECLARE_DYNAMIC_DELEGATE_RetVal',
			'DECLARE_DYNAMIC_DELEGATE_OneParam',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_OneParam',
			'DECLARE_DYNAMIC_DELEGATE_TwoParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_TwoParams',
			'DECLARE_DYNAMIC_DELEGATE_ThreeParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_ThreeParams',
			'DECLARE_DYNAMIC_DELEGATE_FourParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_FourParams',
			'DECLARE_DYNAMIC_DELEGATE_FiveParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_FiveParams',
			'DECLARE_DYNAMIC_DELEGATE_SixParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_SixParams',
			'DECLARE_DYNAMIC_DELEGATE_SevenParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_SevenParams',
			'DECLARE_DYNAMIC_DELEGATE_EightParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_EightParams',
			'DECLARE_DYNAMIC_DELEGATE_NineParams',
			'DECLARE_DYNAMIC_DELEGATE_RetVal_NineParams',
		),

		ue_multicast_delegate_declaration_type: $ => choice(
			'DECLARE_MULTICAST_DELEGATE',
			'DECLARE_MULTICAST_DELEGATE_OneParam',
			'DECLARE_MULTICAST_DELEGATE_TwoParams',
			'DECLARE_MULTICAST_DELEGATE_ThreeParams',
			'DECLARE_MULTICAST_DELEGATE_FourParams',
			'DECLARE_MULTICAST_DELEGATE_FiveParams',
			'DECLARE_MULTICAST_DELEGATE_SixParams',
			'DECLARE_MULTICAST_DELEGATE_SevenParams',
			'DECLARE_MULTICAST_DELEGATE_EightParams',
			'DECLARE_MULTICAST_DELEGATE_NineParams',
		),

		ue_ts_multicast_delegate_declaration_type: $ => choice(
			'DECLARE_TS_MULTICAST_DELEGATE',
			'DECLARE_TS_MULTICAST_DELEGATE_OneParam',
			'DECLARE_TS_MULTICAST_DELEGATE_TwoParams',
			'DECLARE_TS_MULTICAST_DELEGATE_ThreeParams',
			'DECLARE_TS_MULTICAST_DELEGATE_FourParams',
			'DECLARE_TS_MULTICAST_DELEGATE_FiveParams',
			'DECLARE_TS_MULTICAST_DELEGATE_SixParams',
			'DECLARE_TS_MULTICAST_DELEGATE_SevenParams',
			'DECLARE_TS_MULTICAST_DELEGATE_EightParams',
			'DECLARE_TS_MULTICAST_DELEGATE_NineParams',
		),

		ue_dynamic_multicast_delegate_declaration_type: $ => choice(
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_FourParams',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_FiveParams',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_SixParams',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_SevenParams',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_EightParams',
			'DECLARE_DYNAMIC_MULTICAST_DELEGATE_NineParams',
		),

		ue_delegate_types: $ => choice(
			$.ue_delegate_declaration_type,
			$.ue_event_declaration_type,
			$.ue_dynamic_delegate_declaration_type,
			$.ue_multicast_delegate_declaration_type,
			$.ue_ts_multicast_delegate_declaration_type,
			$.ue_dynamic_multicast_delegate_declaration_type,
		),

		ue_delegate_declaration: $ => seq(
			field('specifier', optional($.ue_delegate_specifier)),
			field('type', $.ue_delegate_types),
			'(',
			optional($.ue_parameter_list),
			')',
			';',
		),

		ue_top_level_item: $ => choice(
			$.ue_gameplay_tag,
			$.ue_delegate_declaration,
		),

		ue_block_item: $ => choice(
			$.ue_gameplay_tag,
			$.ue_delegate_declaration,
			$.ue_safety_macro,
			$.ue_log_macro,
		),

	},
});

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {ChoiceRule}
 *
 */
function commaSep(rule) {
	return optional(commaSep1(rule));
}

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function commaSep1(rule) {
	return seq(rule, repeat(seq(',', rule)));
}

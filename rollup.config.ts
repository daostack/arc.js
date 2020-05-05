import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import builtins from 'rollup-plugin-node-builtins'

const pkg = require('./package.json')

const libraryName = 'index'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: pkg.module, name: camelCase(libraryName), format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Node.js built-ins
    builtins(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      jsnext: true,
      extensions: ['.mjs', '.js', '.json']
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'node_modules/graphql/error/index.js': [
          'syntaxError',
          'GraphQLError',
          'locatedError',
          'printError',
          'formatError'
        ],
        'node_modules/graphql/execution/index.js': [
          'execute', 'defaultTypeResolver', 'defaultFieldResolver',
          'responsePathAsArray', 'getDirectiveValues',
          'ExecutionArgs', 'ExecutionResult'
        ],
        'node_modules/graphql/language/index.js': [
          'getLocation',
          'Kind',
          'createLexer',
          'TokenKind',
          'parse',
          'parseValue',
          'parseType',
          'print',
          'printLocation',
          'printSourceLocation',
          'Source',
          'visit',
          'visitInParallel',
          'visitWithTypeInfo',
          'getVisitFn',
          'BREAK',
          'isDefinitionNode',
          'isExecutableDefinitionNode',
          'isSelectionNode',
          'isValueNode',
          'isTypeNode',
          'isTypeSystemDefinitionNode',
          'isTypeDefinitionNode',
          'isTypeSystemExtensionNode',
          'isTypeExtensionNode',
          'DirectiveLocation'
        ],
        'node_modules/graphql/subscription/index.js': [
            'subscribe', 'createSourceEventStream'
        ],
        'node_modules/graphql/type/index.js': [
          '__Schema',
          '__Directive',
          '__DirectiveLocation',
          '__Type',
          '__Field',
          '__InputValue',
          '__EnumValue',
          '__TypeKind',
          'assertDirective',
          'assertType',
          'assertScalarType',
          'assertSchema',
          'assertObjectType',
          'assertInterfaceType',
          'assertUnionType',
          'assertEnumType',
          'assertInputObjectType',
          'assertInputType',
          'assertListType',
          'assertNonNullType',
          'assertNullableType',
          'assertNamedType',
          'assertOutputType',
          'assertLeafType',
          'assertCompositeType',
          'assertAbstractType',
          'assertWrappingType',
          'assertValidSchema',
          'DEFAULT_DEPRECATION_REASON',
          'getNullableType',
          'getNamedType',
          'GraphQLBoolean',
          'GraphQLDeprecatedDirective',
          'GraphQLDirective',
          'GraphQLEnumType',
          'GraphQLFloat',
          'GraphQLID',
          'GraphQLIncludeDirective',
          'GraphQLInputObjectType',
          'GraphQLInt',
          'GraphQLInterfaceType',
          'GraphQLList',
          'GraphQLNonNull',
          'GraphQLObjectType',
          'GraphQLScalarType',
          'GraphQLSchema',
          'GraphQLString',
          'GraphQLSkipDirective',
          'GraphQLUnionType',
          'introspectionTypes',
          'isAbstractType',
          'isDirective',
          'isSpecifiedScalarType',
          'isSchema',
          'isScalarType',
          'isType',
          'isObjectType',
          'isInterfaceType',
          'isIntrospectionType',
          'isUnionType',
          'isEnumType',
          'isInputObjectType',
          'isListType',
          'isNonNullType',
          'isInputType',
          'isOutputType',
          'isLeafType',
          'isCompositeType',
          'isNullableType',
          'isNamedType',
          'isRequiredArgument',
          'isRequiredInputField',
          'isSpecifiedDirective',
          'isWrappingType',
          'SchemaMetaFieldDef',
          'specifiedDirectives',
          'specifiedScalarTypes',
          'TypeKind',
          'TypeMetaFieldDef',
          'TypeNameMetaFieldDef',
          'validateSchema',
        ],
        'node_modules/graphql/validation/index.js': [
          'validate',
          'ValidationContext',
          'specifiedRules',
          'ExecutableDefinitionsRule',
          'FieldsOnCorrectTypeRule',
          'FragmentsOnCompositeTypesRule',
          'KnownArgumentNamesRule',
          'KnownDirectivesRule',
          'KnownFragmentNamesRule',
          'KnownTypeNamesRule',
          'LoneAnonymousOperationRule',
          'NoFragmentCyclesRule',
          'NoUndefinedVariablesRule',
          'NoUnusedFragmentsRule',
          'NoUnusedVariablesRule',
          'OverlappingFieldsCanBeMergedRule',
          'PossibleFragmentSpreadsRule',
          'ProvidedRequiredArgumentsRule',
          'ScalarLeafsRule',
          'SingleFieldSubscriptionsRule',
          'UniqueArgumentNamesRule',
          'UniqueDirectivesPerLocationRule',
          'UniqueFragmentNamesRule',
          'UniqueInputFieldNamesRule',
          'UniqueOperationNamesRule',
          'UniqueVariableNamesRule',
          'ValuesOfCorrectTypeRule',
          'VariablesAreInputTypesRule',
          'VariablesInAllowedPositionRule',
          'LoneSchemaDefinitionRule',
          'UniqueOperationTypesRule',
          'UniqueTypeNamesRule',
          'UniqueEnumValueNamesRule',
          'UniqueFieldDefinitionNamesRule',
          'UniqueDirectiveNamesRule',
          'PossibleTypeExtensionsRule',
          'introspectionFromSchema'
        ],
        'node_modules/graphql/utilities/index.js': [
          'getIntrospectionQuery',
          'introspectionQuery',
          'getOperationAST',
          'getOperationRootType',
          'introspectionFromSchema',
          'buildClientSchema',
          'buildASTSchema',
          'buildSchema',
          'getDescription',
          'extendSchema',
          'lexicographicSortSchema',
          'printSchema',
          'printType',
          'printIntrospectionSchema',
          'typeFromAST',
          'valueFromAST',
          'valueFromASTUntyped',
          'astFromValue',
          'TypeInfo',
          'coerceInputValue',
          'coerceValue',
          'isValidJSValue',
          'isValidLiteralValue',
          'concatAST',
          'separateOperations',
          'stripIgnoredCharacters',
          'isEqualType',
          'isTypeSubTypeOf',
          'doTypesOverlap',
          'assertValidName',
          'isValidNameError',
          'BreakingChangeType',
          'DangerousChangeType',
          'findBreakingChanges',
          'findDangerousChanges',
          'findDeprecatedUsages'
        ],

        'node_modules/subscriptions-transport-ws/dist/index.js': [ 'SubscriptionClient' ],

        'node_modules/ethers/index.js': [
          'utils',
          'Contract',
          'Signer',
          'Wallet'
        ]
      }
    }),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}

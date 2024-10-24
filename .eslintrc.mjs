module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint/eslint-plugin", "perfectionist"],
	extends: [
		"plugin:@typescript-eslint/recommended",
		require.resolve("@vercel/style-guide/eslint/node"),
		"plugin:perfectionist/recommended-natural-legacy",
		"plugin:prettier/recommended",
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: [".eslintrc.js"],
	rules: {
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"import/no-default-export": "off",
		"import/no-unresolved": "off",
		"import/order": "off",
		"no-console": "off",
		"perfectionist/sort-classes": "off",
		"perfectionist/sort-imports": "off",
		"perfectionist/sort-named-imports": "off",
		"tailwindcss/classnames-order": "off",
		"tailwindcss/no-custom-classname": "off",
	},
};

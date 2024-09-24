

import { common, typescript, prettier } from "eslint-config-neon";

export default [
	{
		files: ["**/src/*"],
		ignores: ["**/dist/*"],

	},
	...common,
	...typescript,
	...prettier,
	{
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
	},
];
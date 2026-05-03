module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "import"
  ],
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "import/no-unused-modules": [1, {"unusedExports": true}],
    "import/no-unresolved": "error",
    "import/named": "off", // TypeScript handles this better than the import plugin
    "import/default": "error",
    "import/namespace": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off" // TypeScript handles prop types
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"],
        "moduleDirectory": ["node_modules", "src/"]
      },
      "typescript": {
        "alwaysTryTypes": true
      }
    }
  }
}
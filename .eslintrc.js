module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true // Added for Node.js environment
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime", // Added for React 18's automatic JSX transform
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript" // Added for TypeScript import resolution
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest", // Updated to use latest
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "import"
  ],
  "rules": {
    "no-unused-vars": "error",
    "import/no-unused-modules": [1, {"unusedExports": true}],
    "import/no-unresolved": "error",
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "react/react-in-jsx-scope": "off", // Turned off for React 18
    "react/prop-types": "warn" // Changed to warning instead of error
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"],
        "moduleDirectory": ["node_modules", "src/"]
      }
    }
  }
}
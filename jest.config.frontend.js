const config = {
    "testEnvironment": "jest-environment-jsdom",
    "transform": {
      "^.+\\.jsx?$": "babel-jest"
    },
    "moduleNameMapper": {
      "\\.(css|scss)$": "identity-obj-proxy"
    },
    "transformIgnorePatterns": [
      "/node_modules/(?!(styleMock\\.js)$)"
    ],
    "setupFiles": [
      "./setup.jest.js"
    ],
    "roots": ["./client"]
  };

export default config;

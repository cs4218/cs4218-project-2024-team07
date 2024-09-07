const config = {
    "testEnvironment": "jest-environment-node",
    "transform": {
    //   "^.+\\.jsx?$": "babel-jest"
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
    "testPathIgnorePatterns": ["./client"]
  };

export default config;

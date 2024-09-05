module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        "^.+\\.js$": "babel-jest",
        ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css"
    },
    moduleNameMapper: {
        "axios": "axios/dist/node/axios.cjs"
      },
    setupFilesAfterEnv: [
    '<rootDir>/jest.env.js',
    ],
};
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/test/polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.cjs'],
  transform: {'^.+\\.[jt]sx?$': ['babel-jest', {
    babelrc: false, configFile: false,
    plugins: ["./src/test/viteEnv.cjs"],
    presets: [['@babel/preset-env', {targets: {node: 'current'}}],
      ['@babel/preset-react', {runtime: 'automatic'}]]
  }]},
  moduleNameMapper: {'\\.(css|png|jpg|svg)$':'<rootDir>/src/test/fileMock.cjs'},
  testMatch: ['**/__tests__/**/*.test.jsx'],
  collectCoverageFrom: ['src/pages/*.jsx', '!src/pages/shared.jsx']
};

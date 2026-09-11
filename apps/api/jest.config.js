/** Ustam API — birim test yapılandırması. */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: { "^.+\\.(t|j)s$": "ts-jest" },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@ustam/shared$": "<rootDir>/../../../packages/shared/src/index.ts",
    "^@ustam/shared/i18n$": "<rootDir>/../../../packages/shared/src/i18n/index.ts",
  },
};

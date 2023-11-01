import { cdk, TextFile } from "projen";

const project = new cdk.JsiiProject({
  name: "@vincentgna/cdk8s-ssm-resolver",
  repositoryUrl: "https://github.com/vincentgna/cdk8s-ssm-resolver.git",
  jsiiVersion: "~5.0.0",
  author: "Vincent",
  authorAddress: "vincent@goodnotesapp.com",
  defaultReleaseBranch: "main",
  projenrcTs: true,
  // prettier pinned to ~2.8.8 until Jest 2.30 is released
  // see https://github.com/jestjs/jest/issues/14305#issuecomment-1745757274
  prettier: true,
  eslint: true,
  releaseToNpm: true,
  npmRegistryUrl: "https://npm.pkg.github.com",
  devDeps: [
    "aws-cdk",
    "cdk8s-cli",
    "fs-extra",
    "@types/fs-extra",
    "aws-sdk-client-mock",
    "aws-sdk-client-mock-jest",
  ],
  peerDeps: ["aws-cdk-lib", "cdk8s", "constructs"],
  bundledDeps: ["@aws-sdk/client-ssm"],
});
// ensure node version is 18
new TextFile(project, ".nvmrc", {
  lines: ["v18"],
});

// ignore integ tests because we will add a dedicated task
// for them that only runs on release
project.jest?.addIgnorePattern("/test/integ/");

const integTask = project.addTask("integ");
integTask.exec(jest("integ/ssm-producer/integ.test.ts"));
integTask.exec(jest("integ/aws-cdk-ssm-resolver/integ.test.ts"));

// TODO: run integ on release.
// // we don't run it on each PR because it brings security and operational
// // issues which are not worth the effort at this moment.
// const releaseTask = project.tasks.tryFind("release")!;
// releaseTask.exec(`npx projen ${integTask.name}`);
project.synth();

function jest(args: string) {
  // we override 'testPathIgnorePatterns' and 'testMatch' so that it matches only integration tests
  // see https://github.com/jestjs/jest/issues/7914
  return `jest --testMatch "<rootDir>/test/integ/**/*.test.ts" --testPathIgnorePatterns "/node_modules/" --passWithNoTests --all --updateSnapshot --coverageProvider=v8 ${args}`;
}

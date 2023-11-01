import { execFileSync } from "child_process";
import * as path from "path";
import { IAnyProducer } from "cdk8s";

export class SSMProducer implements IAnyProducer {
  constructor(readonly name: string) {}
  public produce(): any {
    try {
      return this.fetchParameterValueSync(this.name);
    } catch (err) {
      // if both cdk8s and AWS CDK applications are defined within the same file,
      // a cdk8s synth is going to happen before the AWS CDK deployment.
      // in this case we must swallow the error, otherwise the AWS CDK deployment
      // won't be able to go through. we replace the value with something to indicate
      // that a fetching attempt was made and failed.
      return `Failed fetching value for parameter ${this.name}: ${err}`;
    }
  }

  // Can't call async function in a blocking way
  // using execFileSync to block the execution
  // ref: https://github.com/cdk8s-team/cdk8s-awscdk-resolver/blob/v0.0.24/src/resolve.ts#L63
  private fetchParameterValueSync(name: string) {
    const script = path.join(
      __dirname,
      "..",
      "..",
      "lib",
      "common",
      "fetch-output-value-sync.js"
    );
    return JSON.parse(
      execFileSync(process.execPath, [script, name], {
        encoding: "utf-8",
        stdio: ["pipe"],
      })
        .toString()
        .trim()
    );
  }
}

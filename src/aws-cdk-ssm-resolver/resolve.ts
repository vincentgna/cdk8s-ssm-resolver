import { execFileSync } from "child_process";
import * as path from "path";
import { Token, Stack, Tokenization, Reference } from "aws-cdk-lib";
import { CfnParameter, StringParameter } from "aws-cdk-lib/aws-ssm";
import { IResolver, ResolutionContext } from "cdk8s";

export class AwsCdkSSMResolver implements IResolver {
  /**
   * lookup table to reverse lookup ssm stringValue token to ssm parameterName
   */
  public resolve(context: ResolutionContext) {
    if (!Token.isUnresolved(context.value)) {
      return;
    }

    if (typeof context.value !== "string") {
      // should be ok because we only resolve StringParameter values, which
      // must be strings.
      throw new Error(
        `Invalid value type: ${typeof context.value} (Expected 'string')`
      );
    }

    const parameter = this.findParam(context.value);
    if (!parameter.name || Token.isUnresolved(parameter.name)) {
      // CfnParameter.name is core.Resource physicalName
      // https://github.com/aws/aws-cdk/blob/24ffb6a722a32c8727fbc843234f8ad39028f01a/packages/aws-cdk-lib/core/lib/resource.ts#L178C15-L178C27
      throw new Error("Parameter name must be a string literal");
    }
    try {
      const parameterValue = this.fetchParameterValueSync(parameter);
      context.replaceValue(parameterValue);
    } catch (err) {
      // if both cdk8s and AWS CDK applications are defined within the same file,
      // a cdk8s synth is going to happen before the AWS CDK deployment.
      // in this case we must swallow the error, otherwise the AWS CDK deployment
      // won't be able to go through. we replace the value with something to indicate
      // that a fetching attempt was made and failed.
      context.replaceValue(
        `Failed fetching value for parameter ${parameter.node.path}: ${err}`
      );
    }
  }

  private findParam(value: string): CfnParameter {
    const inspectedStacks: Stack[] = [];
    for (const token of Tokenization.reverseString(value).tokens) {
      if (Reference.isReference(token)) {
        const stack = Stack.of(token.target);
        inspectedStacks.push(stack);
        for (const c of stack.node.findAll()) {
          if (c instanceof StringParameter && c.stringValue === value) {
            // we don't really care if there are more parameters
            // that point to the same value. the first will suffice.
            // find the CfnParameter node contained in the StringParameter
            for (const n of c.node.children) {
              if (n instanceof CfnParameter) return n;
            }
          }
        }
      }
    }

    // This can happen if either:
    // --------------------------
    //  1. User didn't create a StringParameter.
    //  2. StringParameter was defined in a different stack than the tokens comprising its value.
    //  3. None of the tokens comprising the value are a Reference.
    throw new Error(
      `Unable to find parameter defined for ${value} (Inspected stacks: ${inspectedStacks
        .map((s) => s.stackName)
        .join(",")})`
    );
  }

  // Can't call async function in a blocking way
  // use child_process execFileSync to block the execution
  // ref: https://github.com/cdk8s-team/cdk8s-awscdk-resolver/blob/v0.0.24/src/resolve.ts#L63
  private fetchParameterValueSync(parameter: CfnParameter) {
    const script = path.join(
      __dirname,
      "..",
      "..",
      "lib",
      "common",
      "fetch-output-value-sync.js"
    );
    return JSON.parse(
      execFileSync(process.execPath, [script, parameter.name!], {
        encoding: "utf-8",
        stdio: ["pipe"],
      })
        .toString()
        .trim()
    );
  }
}

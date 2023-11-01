import { Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ApiObject, Chart, Testing } from "cdk8s";
import { AwsCdkSSMResolver } from "../src";

// mock resolver internal fetchParameterValueSync function
const mockResolver = new AwsCdkSSMResolver();
(mockResolver as any).fetchParameterValueSync = fetchParameterValueSync;
function fetchParameterValueSync(parameter: StringParameter) {
  return parameter.node.path;
}

test("SSM ParameterStore resolution", () => {
  const stack = new Stack();
  const app = Testing.app({ resolvers: [mockResolver] });
  const chart = new Chart(app, "test");

  const bucket = new Bucket(stack, "Bucket");
  const bucketRef = new StringParameter(stack, "BucketRef", {
    parameterName: "/buckets/bucket1",
    stringValue: bucket.bucketName,
  });

  // WHEN
  const apiObject = new ApiObject(chart, "resource1", {
    kind: "Resource1",
    apiVersion: "v1",
    spec: {
      foo: bucketRef.stringValue,
    },
  });
  const synthResult = apiObject.toJson();

  // THEN
  expect(synthResult).toMatchInlineSnapshot(`
    {
      "apiVersion": "v1",
      "kind": "Resource1",
      "metadata": {
        "name": "test-resource1-c85cb0fc",
      },
      "spec": {
        "foo": "Default/BucketRef/Resource",
      },
    }
  `);
});

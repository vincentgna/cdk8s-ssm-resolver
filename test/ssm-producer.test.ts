import { ApiObject, Chart, Lazy, Testing } from "cdk8s";
import { SSMProducer } from "../src";

// mock resolver internal fetchParameterValueSync function
const mockResolver = new SSMProducer("/foo/bar");
(mockResolver as any).fetchParameterValueSync =
  function fetchParameterValueSync(name: string) {
    return name;
  };

test("SSM ParameterStore resolution", () => {
  const app = Testing.app();
  const chart = new Chart(app, "test");

  // WHEN
  const apiObject = new ApiObject(chart, "resource1", {
    kind: "Resource1",
    apiVersion: "v1",
    spec: {
      foo: Lazy.any(mockResolver),
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
        "foo": "/foo/bar",
      },
    }
  `);
});

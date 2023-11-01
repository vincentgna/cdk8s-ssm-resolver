import {
  SSMClient,
  GetParameterCommand,
  GetParameterCommandInput,
} from "@aws-sdk/client-ssm";
import "aws-sdk-client-mock-jest";
import { mockClient } from "aws-sdk-client-mock";
import { mockResponse } from "./fixtures";
import { fetchParameterValue } from "../src/common";

const ssmMock = mockClient(SSMClient);
beforeEach(() => {
  ssmMock.reset();
});

afterAll(() => {
  ssmMock.restore();
});

test("Fetch Param Value", () => {
  ssmMock.on(GetParameterCommand).resolves(mockResponse);

  // WHEN
  fetchParameterValue("/foo/bar")
    .then((d) => {
      expect(d).toEqual("Value1");
    })
    .catch((e) => {
      throw e;
    });

  // THEN
  expect(ssmMock.calls()).toHaveLength(1);
  const callArgs = ssmMock.calls()[0].args[0].input as GetParameterCommandInput;
  expect(callArgs.Name).toEqual("/foo/bar");
});

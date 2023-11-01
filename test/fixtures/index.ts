import { GetParameterCommandOutput } from "@aws-sdk/client-ssm";

export const mockResponse: GetParameterCommandOutput = {
  $metadata: {
    requestId: "1234567890",
  },
  Parameter: {
    Value: "Value1",
  },
};

import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export async function fetchParameterValue(parameterName: string) {
  const ssm = new SSMClient();

  const response = await ssm.send(
    new GetParameterCommand({
      Name: parameterName,
    })
  );

  if (!response.Parameter) {
    throw new Error(`Unable to find parameter ${parameterName}`);
  }

  if (!response.Parameter.Value) {
    throw new Error(`Parameter ${parameterName} value is undefined or empty`);
  }

  return response.Parameter.Value;
}

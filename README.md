# CDK8s SSM Resolver

Producers and Resolvers for CDK8s to fetch values from AWS SSM Parameter Store.

## AWS CDK SSM Resolver

The `AwsCdkSSMResolver` is able to resolve any [`StringParameter`](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ssm.StringParameter.html).
defined by your AWS CDK application.

In this example, we create an S3 `Bucket` with the AWS CDK, and register the bucketName into the
SSM Parameter Store. This decouples our IaC from the CloudFormation Stacks. We can then pass its
(deploy time generated) name as an environment variable to a Kubernetes `CronJob` resource.

```ts
import * as aws from "aws-cdk-lib";
import * as k8s from "cdk8s";
import * as kplus from "cdk8s-plus-27";

import { AwsCdkSSMResolver } from "@vincentgna/cdk8s-ssm-resolver";

const awsApp = new aws.App();
const stack = new aws.Stack(awsApp, "aws");

const k8sApp = new k8s.App({ resolvers: [new AwsCdkSSMResolver()] });
const manifest = new k8s.Chart(k8sApp, "Manifest");

const bucket = new aws.aws_s3.Bucket(stack, "Bucket");
const bucketName = new StringParameter(stack, "BucketRef", {
  parameterName: "/buckets/bucket1",
  stringValue: bucket.bucketName,
});

new kplus.CronJob(manifest, "CronJob", {
  schedule: k8s.Cron.daily(),
  containers: [
    {
      image: "job",
      envVariables: {
        // directly passing the value of the ParameterStore `StringParameter` containing
        // the deploy time bucket name
        BUCKET_NAME: kplus.EnvValue.fromValue(bucketName.stringValue),
      },
    },
  ],
});

awsApp.synth();
k8sApp.synth();
```

During cdk8s synthesis, the custom resolver will detect that `bucketName.stringValue` is not a concrete value,
but rather a value of a `StringParameter`. It will then perform AWS service calls in order to fetch the
actual value from SSM ParameterStore created by the deployed infrastructure in your account. This means that in order
for `cdk8s synth` to succeed, it must be executed _after_ the AWS CDK resources
have been deployed. So your deployment workflow should (conceptually) be:

1. `cdk deploy`
2. `cdk8s synth`

> Note that the `AwsCdkSSMResolver` is **only** able to fetch tokens that have a `StringParameter` defined for them with a `parameterName` known at synthesis time.

##### Permissions

Since running `cdk8s synth` will now require performing AWS service calls, it must have access
to a set of AWS credentials. Following are the set of actions the credentials must allow:

- `ssm:DescribeParameters`
- `ssm:GetParameters`
- `ssm:GetParameter`
- `ssm:GetParameterHistory`

Note that the actions cdk8s require are far more scoped down than those normally required for the
deployment of AWS CDK applications. It is therefore recommended to not reuse the same set of credentials,
and instead create a scoped down `ReadOnly` role dedicated for cdk8s resolvers.

## Cross Repository Workflow

Given the Bucket Name is stored in the SSM Parameter Store, all we need is the `parameterName` to look up the bucket value at deploy time. We can use the `SSMProducer` to produce the value from the SSM Parameter Store.

```ts
import * as k8s from "cdk8s";
import * as kplus from "cdk8s-plus-27";

import { SSMProducer } from "@vincentgna/cdk8s-ssm-resolver";
const k8sApp = new k8s.App();
const manifest = new k8s.Chart(k8sApp, "Manifest");
new kplus.CronJob(manifest, "CronJob", {
  schedule: k8s.Cron.daily(),
  containers: [
    {
      image: "job",
      envVariables: {
        // directly resolve the bucketName from the SSM Parameter Store
        // at deploy time
        BUCKET_NAME: kplus.EnvValue.fromValue(
          k8s.Lazy.any(new SSMProducer("/buckets/bucket1"))
        ),
      },
    },
  ],
});
k8sApp.synth();
```

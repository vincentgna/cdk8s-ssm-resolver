import * as aws from "aws-cdk-lib";
import * as k8s from "cdk8s";
// import { registryPaths } from "./registry";
import { SSMProducer } from "../../../src";

const cdkOutDir = process.env.CDK_OUT_DIR;
const cdk8sOutDir = process.env.CDK8S_OUT_DIR;
const stackName = process.env.STACK_NAME!;
const chartName = process.env.CHART_NAME!;

const awsApp = new aws.App({ outdir: cdkOutDir });
const k8sApp = new k8s.App({
  outdir: cdk8sOutDir,
});

const stack = new aws.Stack(awsApp, stackName);
const chart = new k8s.Chart(k8sApp, chartName);

const topic1 = new aws.aws_sns.Topic(stack, "Topic1");
new aws.aws_ssm.StringParameter(stack, "SSMEntry", {
  parameterName: "/topics/topic1",
  stringValue: topic1.topicName,
});
new aws.CfnOutput(stack, "snsTopic1", {
  value: topic1.topicName,
});

new k8s.ApiObject(chart, "ConfigMap", {
  apiVersion: "v1",
  kind: "ConfigMap",
  data: {
    Entries: {
      [stackName]: {
        snsTopic1: k8s.Lazy.any(new SSMProducer("/topics/topic1")),
      },
    },
  },
});

awsApp.synth();
k8sApp.synth();

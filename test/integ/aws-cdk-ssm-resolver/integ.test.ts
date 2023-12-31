import * as child from "child_process";
import * as os from "os";
import * as path from "path";
import { Yaml } from "cdk8s";
import * as fs from "fs-extra";

/*************************************************************
 * ------------------ NOTICE -------------------------------
 * Make sure you `yarn compile` before running these
 * tests to operate against the latest compiled version
 * of `common/fetch-output-value-sync.ts`
 ***************************************/

test("app", () => {
  const appFile = "app.ts";
  const appDir = __dirname;
  const program = `npx ts-node ${path.join(appDir, appFile)}`;
  const stackName = "cdk8s-awscdk-resolver-single-stack-app-integ-stack";
  const chartName = "cdk8s-awscdk-resolver-single-stack-app-integ-chart";

  const outTempDir = fs.mkdtempSync(path.join(os.tmpdir(), "app-test-"));
  const cdkOutDir = path.join(outTempDir, "cdk.out");
  const cdk8sOutDir = path.join(outTempDir, "dist");
  const outputsFilePath = path.join(outTempDir, "outputs.json");

  function execProgram(command: string) {
    child.execSync(command, {
      cwd: appDir,
      env: {
        ...process.env,
        CDK_OUT_DIR: cdkOutDir,
        CDK8S_OUT_DIR: cdk8sOutDir,
        STACK_NAME: stackName,
        CHART_NAME: chartName,
      },
      stdio: ["inherit"],
    });
  }

  const bin = path.join(__dirname, "..", "..", "..", "node_modules", ".bin");
  const cdk = path.join(bin, "cdk");
  const cdk8s = path.join(bin, "cdk8s");

  try {
    execProgram(
      `${cdk} -o ${cdkOutDir} -a '${program}' deploy --outputs-file ${outputsFilePath}`
    );

    // delete the synthesized app to make sure we don't rely on it in the resolver
    fs.removeSync(cdkOutDir);

    execProgram(
      `${cdk8s} synth -o ${cdk8sOutDir} -a '${program}' --outputs-file ${outputsFilePath}`
    );

    const outputs = JSON.parse(
      fs.readFileSync(outputsFilePath, { encoding: "utf-8" })
    );
    const manifest = Yaml.load(path.join(cdk8sOutDir, `${chartName}.k8s.yaml`));

    // validate that the manifest indeed includes the correct SSM ParameterStore values
    expect(outputs).toStrictEqual(manifest[0].data.Entries);
  } finally {
    execProgram(`${cdk} -o ${cdkOutDir} -a '${program}' destroy --force`);
  }
});

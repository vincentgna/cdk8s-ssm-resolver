import { fetchParameterValue } from ".";

fetchParameterValue(process.argv[2])
  .then((d) => {
    console.log(JSON.stringify(d));
  })
  .catch((e) => {
    throw e;
  });

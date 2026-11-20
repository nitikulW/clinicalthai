/**
 * Pre-fetch the ClinicalTrials.gov dataset into .cache/trials.json so the
 * first page load is instant. Usage: npm run sync
 */
import { getDataset } from "../src/lib/ctgov";

const started = Date.now();
getDataset({ force: true })
  .then((d) => {
    const open = d.trials.filter((t) => ["RECRUITING", "NOT_YET_RECRUITING"].includes(t.status)).length;
    const unknown = d.trials.flatMap((t) => t.sites).filter((s) => !s.province).length;
    console.log(`fetched ${d.trials.length} Thai studies (${open} open) in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    console.log(`sites without province: ${unknown}`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

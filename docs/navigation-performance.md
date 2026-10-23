# Hosted navigation performance — October 23, 2026

## Reproduction

Run npm run measure:navigation against the actual production alias. It signs in through the intentionally public demo popup, clicks Knowledge library, Ask FirstDay and Overview twice, and waits for each destination heading to render. It records completed navigation, not merely a URL change or a loading skeleton. The default budget is 1000 ms for the slowest route's two-sample median. This is a reproducible operational benchmark, not a timing assertion in CI.

The original production deployment dpl_9zY2yXUBv69XbfJMjSdk3sr9anaK served main c386c3b in iad1. Repeated baseline reproduced the library symptom: 1961/1413 ms, then 2063/1457 ms. Chat/overview were roughly 625–922 ms. The second baseline failed the explicit route budget (1760 ms).

## Hypotheses and probe

Ranked predictions were: cross-region function/database calls dominate and moving compute near data reduces full navigation; serial data reads add library latency; a missing loading boundary delays visual feedback without changing completion time. Probe the first by changing only deployment region, retaining all auth checks, RLS, data queries and browser behavior.

Set the single Hobby function region to sin1 in vercel.json, alongside the existing Supabase project in Singapore. [Vercel region guidance](https://vercel.com/docs/functions/configuring-functions/region) recommends locating compute near its data source; the [region list](https://vercel.com/docs/regions) identifies sin1 as Singapore. One region fits the existing free-plan limit.

## Measured result

App commit 000a48c459db4ef48192fafd72c737220833af0e was source-deployed to the existing project as READY dpl_Gv8UkXSwby2UG8wneFngGxqRKW8w at https://qw-firstday.vercel.app. Deployment metadata confirms source cli, region sin1 and the exact commit. It is ahead of GitHub main. After measurement, the existing FirstDay project default was also changed from iad1 to sin1 and independently read back (serverlessFunctionRegion and functionDefaultRegions both sin1), so future Git deployments inherit Singapore. The repository changes still require a later approved push/merge.

The unchanged benchmark passed: Knowledge 486/380 ms; Chat 200/143 ms; Overview 285/208 ms. The slowest-route median dropped from 1760 to 433 ms (about 75% lower); the overall six-transition median was 247 ms. No query/auth code, shared cache or authorization boundary changed, and no loading-UI change was needed to meet this benchmark. No model calls or live data mutations were made by measurement.

Results describe this client and these samples, not a latency guarantee. Free-plan cold starts, network conditions, backend availability and provider requests remain variable. Keep the existing same-region setting on future releases and rerun the benchmark if slowness returns. Remove no authentication check solely to improve a benchmark.

# Lumen Backend Developer onboarding

Lumen is a fictional company. This guide describes an imaginary exercise repository, not the FirstDay source code or a real employer's systems. The commands below are reference examples for that imaginary repository; FirstDay does not provide or provision it. Read, reason about and sketch the exercise locally. Do not run these examples against real services, request credentials, provision infrastructure or send messages.

## Before you start: sequence and tools

The learning sequence is: read this guide, check tools, describe the sample environment, review startup, inspect the health endpoint, outline an API test, review service conventions and sketch a small response-field change. The exercise prerequisites are Node.js 22 and npm 10. Git and a text editor help inspect an imaginary checkout. Use only invented request data. A written walkthrough is sufficient when the exercise repository is unavailable.

## Day 1: environment and startup

In the imaginary Lumen API workspace, copy `.env.example` to `.env.local`. Set `LUMEN_API_PORT=4102` for the local exercise and retain only dummy placeholders for any other settings. Never paste actual tokens, credentials or customer data into the exercise, chat or committed files.

The exact sample startup command is `npm run api:dev -- --port 4102`. It starts the fictional API on local port 4102 at `http://localhost:4102`. This is documentation of the exercise command, not a command available in the FirstDay repository. Confirm the port in the hypothetical startup output before describing a request. If the port is occupied, stop and note the conflict instead of terminating another application's process.

## Day 1: health endpoint and project layout

The sample request is `GET /health`. A successful sample response uses HTTP 200 with JSON `{"status":"ok"}`. Route handlers live in `src/routes`, business service logic in `src/services` and API tests in `tests/api`. For a paper walkthrough, trace the health route in `src/routes/health.ts`: it calls the health service and maps the returned result to the HTTP response. The route handles transport concerns; the service returns domain data without reaching into request or response objects.

Inspect the request method, path, status and body shape separately. Compare the response with the expected status value rather than treating any successful connection as proof of correctness. Do not substitute a real production endpoint for this sample.

## Week 1: tests

The fictional test command is `npm run test:api`; API tests belong in `tests/api`. Outline a health test that sends a local GET /health request, expects HTTP 200 and checks that the JSON status equals `ok`. Keep test inputs invented and repeatable. For a failing assertion, inspect the smallest local route/service path and test output first. Do not disable the assertion or contact a real external dependency to make an exercise pass.

## Week 1: service conventions and safe debugging

Validate input at the route boundary before passing a typed value to a service. Reject malformed input with a clear client error, rather than letting unchecked request data reach service logic. Keep business decisions in `src/services` and HTTP status/serialization in `src/routes`. Prefer small named functions with explicit input and output shapes.

For debugging, first reproduce the hypothetical problem with a focused test. Review the route, service result and expected response. Logs may contain an invented request label and a coarse error category; redact authorization headers, tokens and personal fields. Never print an entire environment file, request body or real customer record. Review error paths as well as the successful example. Keep this an offline exercise with fake values.

## Week 1: small practice change and self-review

Sketch adding `serviceName: "lumen-api-demo"` to the fictional health response while retaining `status: "ok"`. Add an API test for the new field and the existing status. Keep the route/service boundary intact and run the fictional test command only in an intentionally prepared imaginary exercise workspace. A written expected-response example and test outline are also valid practice outputs.

Write a short self-review note containing the changed response contract, the added assertion, the validation and logging checks and one open question. Check that the example contains no credentials, no personal data and no real network operations. Completing this checklist records your own practice; it does not deploy code or require manager approval.

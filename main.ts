// @ts-ignore
import { listenAndServe } from "https://deno.land/std@0.91.0/http/server.ts"
// @ts-ignore
import { Status } from "https://deno.land/std@0.91.0/http/http_status.ts"

const HTTP_PORT = 8080;
const options = { hostname: "0.0.0.0", port: HTTP_PORT }
console.log(`HTTP server running on localhost:${HTTP_PORT}`)

listenAndServe(options, (request) => {
  if (request.method !== "GET") {
    request.respond({ status: Status.MethodNotAllowed, body: "must GET" })
    return
  }

  const start = new Date()
  const url = `https://${request.url.substring(1)}`
  let completed = false

  const p = Deno.run({
    cmd: [ "deno", "run", url ],
    stdout: "piped",
    stderr: "null"
  });

  // pipe the stdout of the process to the http response
  request.respond({ body: p.stdout })

  // whenever the process exits, mark it as done
  p.status().finally(() => {
    completed = true
    let elapsed = (new Date()).getTime() - start.getTime()
    console.log({ url, time: `${elapsed}ms` })
  })

  // once the request is done (or cancelled)
  Deno.readAll(request.r).then(async () => {
    // if the process hasn't completed, end it
    if (!completed) p.kill(2)
  })

  // don't let requests run indefinitely
  setTimeout(() => {
    if (!completed) p.kill(2)
  }, 10*1000)
});

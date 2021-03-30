FROM hayd/ubuntu-deno:1.8.2

USER deno
ADD main.ts main.ts
RUN deno cache main.ts

ENTRYPOINT [ "deno" ]
CMD ["run", "--allow-net", "--allow-run", "--unstable", "main.ts"]

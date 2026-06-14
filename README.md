# slskdim

> **Work in progress.** If you're looking to actually use this software, check out the official [slskd](https://github.com/slskd/slskd) repo instead, it's relatively maintained, well documented, and gets real releases.

slskdim (name comes form slskd **im**proved, similar to vim) is a fork of [slskd](https://github.com/slskd/slskd) focused on overhauling the UI to be more customizable and generally more appealing.

## Goals

- A more flexible, configurable interface
- Better aesthetics out of the box
- Everything slskd already does, just prettier

## Status

Early stages. I'll keep writing things in as they happen

## Using the UI

Since there are no plans to merge this into the upstream repo, you can inject the UI manually by replacing the `wwwroot` directory in your slskd installation with the output of `vite build` (found in `src/web/dist` after building).

> **Note:** building the container directly from this repo is not recommended. While I try my best to keep things in sync, I cannot guarantee that the C# backend is up to date with upstream at any given commit.

### Docker users

`inject-ui.sh` is provided to automate this for Docker users. It builds the frontend and copies it directly into a running slskd container's `wwwroot`:

```
./inject-ui.sh -c <container-name-or-id>
```

Run `./inject-ui.sh --help` for options.

## A note on AI-generated code

This project uses AI-assisted development. The code that comes out of it is reviewed and curated before it lands here, but LLMs still makes lots mistakes.

**If you want to contribute with AI: please, please, _please_ read through any AI-generated code before opening a PR.** Don't just run it and see if it works. Read it. LLMs will hallucinate APIs, introduce logic bugs that look plausible, and occasionally write code that is technically functional but completely wrong for the context.

## Official project

For a stable, production-ready Soulseek client-server application, use **https://github.com/slskd/slskd**.

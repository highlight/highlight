# Developer Onboarding

Want to contribute to Highlight? Here's your getting started guide to developing on Highlight.

## Prerequisites

* [git](https://git-scm.com/downloads) (2.13+)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (19.03.0+) with the following resources (Docker icon -> Preferences -> Resources)

  * **CPUs**: 4
  * **Memory**: 16 GB
  * **Virtual disk limit**: 256 GB

![Screenshot 2023-03-20 at 9 21 31 AM](https://user-images.githubusercontent.com/58678/226386832-c398a37a-8ef1-4327-bd54-de4d7e7d4aa2.png)

## Installation (local machine)

```bash
git clone --recurse-submodules https://github.com/highlight/highlight
cd highlight/docker
docker compose -f compose.yml -f compose.dev.yml up --build -d
```

After all services are built and running, you can visit [https://localhost:3000](https://localhost:3000) to view the dashboard and go through the login flow (there are no credentials).

## Running on GitHub Codepsaces (in browser or in VS Code)
* Make sure you've forked the repo
* Visit https://github.com/codespaces and start a codepsace for highlight/highlight
* Using VS Code, enter codespace - `CMD + Shift + P`, type `codespace`, select the Highlight codespace
```bash
# from highlight/
yarn
cd docker
COMPOSE_FILE=compose.yml:compose.dev.yml docker compose up --build -d
# View `https://localhost:3000`
```

## Debugging

### Frontend

We recommend using the Chrome DevTools if you need a debugger.

* Open the Developer Tools (View -> Developer -> Developer Tools)
* Click the Sources tab
* `⌘ + P` and search for the filename to set a breakpoint

![Kapture 2023-03-20 at 09 09 36](https://user-images.githubusercontent.com/58678/226383772-52c28ff4-f1f7-4756-8c2a-7ba89d99d036.gif)

Check out the Chrome DevTools guides for [additional debugging information](https://developer.chrome.com/docs/devtools/javascript/).
### Backend

We recommend using VSCode if you need a debugger.

* Run -> Start Debugging
* Drop a breakpoint somewhere

![Kapture 2023-03-20 at 09 33 17](https://user-images.githubusercontent.com/58678/226390040-417ab200-22a5-47d8-8b29-f56b1141817a.gif)


Learn more about [debugging with VSCode](https://code.visualstudio.com/docs/editor/debugging#_debug-actions) through their docs.
---
title: GitHub Code Spaces
slug: code-spaces
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

## Running on GitHub Codepsaces (in browser or in VS Code)

-   Make sure you've forked the repo
-   Visit https://github.com/codespaces and start a codepsace for highlight/highlight
-   Install the VS Code Extension "GitHub Codespaces"
-   Using VS Code, enter codespace - `CMD + Shift + P`, type `codespace`, select the Highlight codespace
-   If docker is not running (try `docker ps`), run a full rebuild: press `CMD + Shift + P`, select `Codespaces: Full Rebuild Container`

```bash
# from highlight/
cd docker
./run.sh
# View `http://localhost:3000`
```

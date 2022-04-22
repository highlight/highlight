import { mkdtemp, readFileSync } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { tmpdir } from 'os';
import puppeteer from 'puppeteer';

const getHtml = (): string => {
    return `<html lang="en"><head><title></title><style>
.rrwebPlayerWrapper {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    position: relative;
    width: 1920px;
    height: 1080px;
}
.rrwebPlayerDiv {
    height: 100%;
    position: relative;
}
</style></head><body style="padding: 0; margin: 0">
  <div id="player" class="rrwebPlayerWrapper">
    <div id="player" class="rrwebPlayerDiv"></div>
  </div>
</body></html>
    `;
};

export async function render(events: string) {
    events = events.replace(/\\/g, '\\\\');

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
        args: ['--no-sandbox'],
        dumpio: true,
    });

    const page = await browser.newPage();
    await page.goto('about:blank');
    await page.setContent(getHtml());

    const js = readFileSync(
        path.join(
            path.dirname(__dirname),
            'node_modules',
            '@highlight-run',
            'rrweb',
            'dist',
            'rrweb.js'
        ),
        'utf8'
    );
    await page.evaluate(js);
    await page.evaluate(
        `
        const playerMountingRoot = document.getElementById(
            'player'
        );
        const events = JSON.parse(` +
            '`' +
            events +
            '`' +
            `);
        const r = new rrweb.Replayer(events, {
            root: playerMountingRoot,
            triggerFocus: true,
            mouseTail: false,
            UNSAFE_replayCanvas: true,
            liveMode: true,
        });
        r.pause(0)
        meta = r.getMetaData()
        loaded = true
    `
    );
    await page.waitForFunction('loaded');
    const meta = (await page.evaluate('meta')) as {
        startTime: number;
        endTime: number;
        totalTime: number;
    };
    const screenshots = 100;
    const interval = Math.round(meta.totalTime / screenshots);

    const files: string[] = [];
    const prefix = path.join(tmpdir(), 'render_');
    const dir = await promisify(mkdtemp)(prefix);
    for (let i = 0; i < meta.totalTime; i += interval) {
        const file = path.join(dir, `${i}.png`);
        await page.evaluate(`r.pause(${i})`);
        await page.screenshot({ path: file });
        console.log(`made ${file}`);
        files.push(file);
    }

    await browser.close();
    return files;
}

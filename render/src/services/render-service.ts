import { mkdtemp } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { tmpdir } from 'os';
import { eventWithTime } from '@highlight-run/rrweb/dist/types';
import puppeteer from 'puppeteer';

type HighlightEvent = eventWithTime & { identifier: string };

const getHtml = (): string => {
    return `<html lang="en"><head>
    <script>
      function loadScript( url, callback ) {
        const script = document.createElement( "script" )
        script.type = "text/javascript";
        script.onload = function() {
          callback();
        };
        script.src = url;
        document.getElementsByTagName( "head" )[0].appendChild( script );
    }
    
    loadScript("https://cdn.jsdelivr.net/npm/rrweb@1.1.3/lib/rrweb-all.js", function() {
      console.log(window.rrweb);
    });
    </script><title>render</title>
    </body></head></html>
    `;
};

async function render() {
    const events: HighlightEvent[] = [];

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
        args: ['--no-sandbox'],
        dumpio: true
    });

    const page = await browser.newPage();
    await page.goto('about:blank');
    await page.setContent(getHtml());

    const prefix = path.join(tmpdir(), 'render_');
    const dir = await promisify(mkdtemp)(prefix);
    const file = path.join(dir, '1.png');
    await page.screenshot({ path: file });

    await browser.close();
    return file;
}

// Export default
export default {
    render,
} as const;

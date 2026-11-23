const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGET_URL = 'https://get.manychat.com/es/for/course-creators';
const OUTPUT_DIR = './cloned-site';

function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Use 'load' instead of 'networkidle'. The page never goes idle,
    // so networkidle will always time out.
    await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 60000 });

    // Give dynamically rendered sections a moment to populate.
    await page.waitForTimeout(3000);

    const dirs = ['css', 'js', 'images'];
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    dirs.forEach(dir => fs.mkdirSync(path.join(OUTPUT_DIR, dir), { recursive: true }));

    const html = await page.content();
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html);
    console.log('HTML saved.');

    const assetUrls = await page.evaluate(() => {
        const urls = [];
        document.querySelectorAll('link[rel="stylesheet"]').forEach(el => urls.push({ type: 'css', url: el.href }));
        document.querySelectorAll('script[src]').forEach(el => urls.push({ type: 'js', url: el.src }));
        document.querySelectorAll('img[src]').forEach(el => urls.push({ type: 'images', url: el.src }));
        return urls;
    });

    for (const asset of assetUrls) {
        try {
            const filename = path.basename(new URL(asset.url).pathname);
            const localPath = path.join(OUTPUT_DIR, asset.type, filename);
            await downloadFile(asset.url, localPath);
            console.log(`Downloaded ${asset.type}: ${filename}`);
        } catch (e) {
            console.error(`Could not download ${asset.url}: ${e.message}`);
        }
    }

    await browser.close();
    console.log('Clone complete. Check the "cloned-site" folder.');
})();
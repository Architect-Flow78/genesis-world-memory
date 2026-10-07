"use strict";
// Publication tooling only. The simulation engine and its rules are not changed.
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawnSync } = require("node:child_process");
async function main() {
  for (const dir of ["assets", "evidence", ".capture"]) fs.mkdirSync(dir, {recursive:true});
  const launch = {headless:true};
  if (process.env.GENESIS_BROWSER_CHANNEL) launch.channel = process.env.GENESIS_BROWSER_CHANNEL;
  const browser = await chromium.launch(launch);
  const result = {tool:"Playwright 1.63.0", browser:await browser.version(), captures:[], note:"Recordings of the executed model, not physical observations."};
  try {
    for (const lang of ["en", "ru"]) {
      const context = await browser.newContext({viewport:{width:1440,height:1000}, deviceScaleFactor:1, recordVideo:{dir:".capture",size:{width:1440,height:1000}}});
      const page = await context.newPage(), errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(pathToFileURL(path.resolve(lang === "en" ? "index.html" : "GENESIS_11_RU.html")).href);
      await page.waitForFunction(() => window.genesisApp && window.genesisApp.world.agents.length > 0);
      await page.evaluate(() => window.genesisApp.pause());
      await page.waitForTimeout(600);
      if (lang === "en") await page.screenshot({path:"assets/demo-en.png", fullPage:true});
      const initial = await page.evaluate(() => window.genesisApp.world.stats());
      await page.waitForTimeout(1600);
      await page.click("#releaseMain");
      const source = await page.evaluate(() => window.genesisApp.world.scars.at(-1).agentId);
      await page.waitForTimeout(1200);
      for (let i = 0; i < 144; i++) {
        await page.evaluate(() => window.genesisApp.advance(8));
        await page.waitForTimeout(45);
      }
      if (lang === "ru") await page.screenshot({path:"assets/inheritance-ru.png", fullPage:true});
      await page.click("#compare");
      await page.waitForFunction(() => getComputedStyle(document.getElementById("trial")).display !== "none");
      await page.waitForTimeout(1800);
      const final = await page.evaluate(() => window.genesisApp.world.stats());
      const descendants = await page.evaluate(id => {
        const w = window.genesisApp.world;
        return {living:w.agents.filter(a => a.parentId === id).map(a => ({id:a.id,parentId:a.parentId,generation:a.generation})), scars:w.scars.filter(s => s.agentId === id).map(s => ({id:s.id,agentId:s.agentId,childId:s.childId,used:s.used}))};
      }, source);
      const video = page.video();
      await context.close();
      const raw = await video.path(), output = `assets/preview-${lang}.mp4`;
      const proc = spawnSync(process.env.GENESIS_FFMPEG || "ffmpeg", ["-y", "-i", raw, "-vf", "scale=1440:-2", "-c:v", "libx264", "-preset", "fast", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", output], {encoding:"utf8", timeout:90000, maxBuffer:4*1024*1024});
      if (proc.error || proc.status !== 0) throw new Error(proc.error?.message || proc.stderr);
      if (errors.length) throw new Error(errors.join("\n"));
      result.captures.push({lang,initial,final,source,descendants,errors,video:output});
    }
    const mobile = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true});
    const page = await mobile.newPage(), errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve("index.html")).href);
    await page.waitForFunction(() => window.genesisApp);
    await page.evaluate(() => window.genesisApp.pause());
    await page.screenshot({path:"evidence/mobile-en.png",fullPage:true});
    result.mobileHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    result.mobileErrors = errors;
    await mobile.close();
    if (result.mobileHorizontalOverflow || errors.length) throw new Error("Mobile layout or script verification failed");
    fs.writeFileSync("evidence/publication_render.json", JSON.stringify(result,null,2)+"\n");
    console.log(JSON.stringify(result,null,2));
  } finally { await browser.close(); }
}
main().catch(e => {console.error(e);process.exitCode=1;});

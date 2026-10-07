'use strict';
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname,p),'utf8');
const template = read('docs/INTERFACE_EN.html');
const html = template.replace('/*__ENGINE__*/',read('genesis_engine.js'))
                     .replace('/*__APP__*/',read('genesis_app_en.js'));
fs.writeFileSync(path.join(__dirname,'index.html'),html);
console.log('Built index.html with the unchanged engine.');

// Contact sheets: six pages per image, for visual review.
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1600,height:400}});
const files=fs.readdirSync('png').filter(f=>f.endsWith('.png')).sort();fs.mkdirSync('sheets',{recursive:true});
for(let i=0;i<files.length;i+=6){const g=files.slice(i,i+6).map(f=>`<img src="file://${path.resolve('png',f)}" style="width:262px;margin:2px">`).join('');
fs.writeFileSync("sheet.html",`<body style="margin:0;background:#888;display:flex">${g}</body>`);await p.goto("file://"+path.resolve("sheet.html"));await p.waitForTimeout(300);await p.screenshot({path:`sheets/s${String(i/6+1).padStart(2,'0')}.png`,clip:{x:0,y:0,width:1600,height:376}});}
await b.close();})();

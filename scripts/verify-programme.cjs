// Read-only backend verification + browser-generated September PDF.
// PLAYWRIGHT_MODULE may point to a bundled runtime; default uses installed playwright.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const people = require('./people.js');
const roles = require('./recommend.js');
const root = path.resolve(__dirname, '..');
const source = require('../data/september-2026-final.json');
const output = path.join(root,'output/pdf');
const scratch = path.join(root,'tmp/pdfs');
const base = process.env.TOASTFLOW_BASE_URL || 'http://127.0.0.1:8765/';
(async()=>{
  for(const f of ['index.html','programming-sheet.html']) {
    for(const m of fs.readFileSync(path.join(root,f),'utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
  }
  assert.equal(people.canonical('Jiaqi Xu'),'XU Jiaqi');
  assert.equal(people.label('Shuching?'),'GOH Shu Ching, PM5, EH3');
  assert.notEqual(people.canonical('Sandy W. Goh'),people.canonical('Shu Ching Goh'));
  assert.notEqual(people.canonical('Vincent CHUA'),people.canonical('Vincent CHEN'));
  assert.equal(people.label('Vincent CHUA(Cairnhill TMC)'),'Vincent CHUA*');
  assert.equal(roles.canonicalRole('SAA'),'Sergeant at Arms');
  assert.equal(roles.canonicalRole('Speech 5'),null);
  fs.mkdirSync(output,{recursive:true});fs.mkdirSync(scratch,{recursive:true});
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{})});
  try {
    const context=await browser.newContext({viewport:{width:1280,height:1000}});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>typeof backendReady!=='undefined'&&backendReady);
    const actual=await page.evaluate(()=>bookings.filter(r=>r.meeting_date==='2026-09-11'));
    assert.equal(actual.length,14);
    for(const row of source.records){const got=actual.find(r=>r.reservation_type===row.reservation_type);for(const k of ['member_name','note','confirmed'])assert.equal(got[k],row[k],row.reservation_type+' '+k);}
    // Render administrative data without authenticating or sending any write request.
    await page.evaluate(()=>{adminMeeting.innerHTML='<option value="2026-09-11">September</option>';renderAdmin();});
    assert.ok((await page.locator('select[data-role="Prepared Speech 2"]').nth(2).inputValue()).includes('L2 Project 4: How to Say It'));
    const downloadPromise=page.waitForEvent('download');await page.evaluate(()=>downloadICS(meetings.findIndex(m=>m.date==='2026-09-11')));const calendar=await downloadPromise;
    await calendar.saveAs(path.join(output,'ToastFlow-2026-09-11.ics'));
    const calendarText=fs.readFileSync(path.join(output,'ToastFlow-2026-09-11.ics'),'utf8');
    const unfolded=calendarText.replace(/\r\n /g,'');
    assert.ok(unfolded.includes('LOCATION:Classroom 3.1'));assert.ok(unfolded.includes('80 Stamford Rd'));assert.ok(unfolded.includes('Singapore 178902'));
    assert.ok(unfolded.includes('DTSTART:20260911T113000Z'));assert.ok(unfolded.includes('DTEND:20260911T135500Z'));assert.ok(calendarText.split('\r\n').every(l=>Buffer.byteLength(l,'utf8')<=75));
    await page.screenshot({path:path.join(scratch,'planner.png'),fullPage:true});
    const sheetPromise=context.waitForEvent('page');await page.evaluate(()=>generateSheet());
    const sheet=await sheetPromise;sheet.on('pageerror',e=>errors.push(e.message));await sheet.waitForLoadState('networkidle');
    const payload=await page.evaluate(()=>JSON.parse(localStorage.getItem('toastflow_sheet')));
    assert.equal(Object.keys(payload.assignments).length,14);
    const right=await sheet.locator('#agenda').innerText();
    assert.ok(right.includes('Vincent CHUA, DL5*'));assert.ok(right.includes('Marc WONG, DL5*'));
    assert.ok(!right.includes('Cairnhill'));assert.ok(!right.includes('Anchorvale'));
    assert.ok(right.includes('Jun TAY, PM5*'));assert.ok(right.includes('Suren Haris ANWAR, PM2*'));
    assert.ok(right.includes('9:55'));assert.ok(!right.includes('Get to the Point'));
    assert.ok(!(await sheet.locator('.p2').innerText()).includes('90 Stamford'));
    assert.equal(await sheet.locator('#reviewNote').isVisible(),false);
    assert.equal(await sheet.locator('.menti-qr:visible').count(),3);
    assert.equal(await sheet.locator('#locationDetails .map:visible').count(),1);
    assert.ok(!(await sheet.locator('#objectives').innerText()).includes('to be confirmed'));
    assert.ok((await sheet.locator('#objectives').innerText()).includes('10–15 min'));
    const wordPromise=sheet.waitForEvent('download');await sheet.evaluate(()=>exportWord());const word=await wordPromise;await word.saveAs(path.join(output,'NUSA-Program-2026-09-11.doc'));
    const wordHTML=fs.readFileSync(path.join(output,'NUSA-Program-2026-09-11.doc'),'utf8');assert.ok(wordHTML.includes('80 Stamford'));assert.ok(wordHTML.includes('Jun TAY'));assert.ok(wordHTML.includes('data:image/'));assert.ok(!wordHTML.includes('DontDisplayPageBoundaries'));
    const encoded=encodeURIComponent(Buffer.from(JSON.stringify(payload),'utf8').toString('base64'));
    const fresh=await context.newPage();await fresh.goto(base+'programming-sheet.html?d='+encoded,{waitUntil:'networkidle'});
    assert.equal(await fresh.locator('#agenda').innerText(),right);
    // Missing future projects stay empty even when a speaker has August history.
    await page.evaluate(()=>{adminMeeting.innerHTML='<option value="2026-10-09">October</option>';window.open=()=>null;generateSheet();});
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('toastflow_sheet')).assignments['Prepared Speech 1'].project),'');
    const october=await page.evaluate(()=>JSON.parse(localStorage.getItem('toastflow_sheet')));assert.equal(october.guests.length,0);assert.equal(october.meta.address,'');assert.equal(october.final,false);
    await fresh.goto(base+'programming-sheet.html?d='+encodeURIComponent(Buffer.from(JSON.stringify(october)).toString('base64')),{waitUntil:'networkidle'});assert.ok(!(await fresh.locator('.sheet').first().innerText()).includes('Vincent CHUA'));assert.equal(await fresh.locator('.menti-qr:visible').count(),3);
    await page.evaluate(()=>{adminMeeting.innerHTML='<option value="2026-08-14">August</option>';generateSheet();});const august=await page.evaluate(()=>JSON.parse(localStorage.getItem('toastflow_sheet')));assert.equal(august.schedule.end,'9:50');assert.equal(august.guests.length,4);assert.ok(!august.guests.some(g=>g.name==='Jun TAY'));
    await sheet.screenshot({path:path.join(scratch,'september-sheet.png'),fullPage:true});
    await sheet.pdf({path:path.join(output,'NUSA-Program-2026-09-11.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({base,verifiedRoles:actual.length,confirmed:actual.filter(r=>r.confirmed).length,tentative:actual.filter(r=>!r.confirmed).length,checks:'canonical identities, exact source roster, saved projects, evaluator names, no clubs in right column, tentative labels, snapshot round-trip, no historic project inference',pdf:path.join(output,'NUSA-Program-2026-09-11-DRAFT.pdf')},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

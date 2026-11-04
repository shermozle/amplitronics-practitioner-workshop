import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,generateBacklog,sendBatch,uploadBacklog} from '../backlog.js';
const now=Date.UTC(2026,10,5,12),run=createRun(now,'test-fixture'),data=generateBacklog(run);
test('30 complete UTC days, exactly 200 distinct daily visitors, returning users',()=>{
 const days=new Map();for(const event of data.events){const date=new Date(event.time).toISOString().slice(0,10);if(!days.has(date))days.set(date,new Set());days.get(date).add(event.device_id);assert(event.time<Math.floor(now/86400000)*86400000);assert(event.time>=run.start);assert(event.session_id<=event.time);}
 assert.equal(days.size,30);for(const ids of days.values())assert.equal(ids.size,200);
 assert.equal(data.summary.uniqueUsers,4260);assert.equal(data.summary.dailyVisitors,6000);
 assert.deepEqual(generateBacklog(run),data);
 assert.equal(new Set(data.events.map(e=>e.insert_id)).size,data.events.length);
});
test('plausible consistent funnels, revenue, attribution, recovery, and mobile regression',()=>{
 const bySession=Map.groupBy(data.events,e=>`${e.device_id}:${e.session_id}`);let sum=0;
 for(const session of bySession.values()){
  const names=session.map(e=>e.event_type),order=session.find(e=>e.event_type==='Order Completed');
  if(order){assert(names.indexOf('Product Added to Cart')<names.indexOf('Checkout Started'));assert(names.indexOf('Checkout Started')<names.indexOf('Payment Submitted'));assert(names.includes('Checkout Step Completed'));assert.equal(order.revenue,order.event_properties.total);assert.equal(order.currency,'AUD');assert.equal(order.revenue,Math.round((order.event_properties.subtotal-order.event_properties.discount+order.event_properties.shipping)*100)/100);sum+=order.revenue;}
  for(const e of session){assert.equal(e.event_properties.data_source,'synthetic');assert(e.event_properties.utm_source);assert(e.device_id.length>=5);}
 }
 assert.equal(Math.round(sum*100)/100,data.summary.revenue);assert(data.summary.purchases>600);assert(data.summary.recoveredPurchases>50);assert.equal(Object.keys(data.summary.channels).length,6);
 const regression=data.events.filter(e=>e.event_type==='Checkout Error'&&e.event_properties.error_code==='payment_timeout'&&e.event_properties.device_type==='Mobile');
 assert(regression.length>40);
});
function response(status,count,error){return {status,headers:{get:()=>null},json:async()=>({code:status,events_ingested:count,error})};}
test('HTTP payload, region, backoff, 413 splitting and stable retry identities',async()=>{
 const requests=[],waits=[];let call=0;
 await sendBatch(data.events.slice(0,10),{apiKey:'placeholder_key',region:'EU',fetchFn:async(url,req)=>{requests.push({url,body:JSON.parse(req.body)});return ++call===1?response(429):response(200,10);},sleep:async ms=>waits.push(ms)});
 assert.equal(requests[0].url,'https://api.eu.amplitude.com/2/httpapi');assert.equal(waits[0],60000);assert.deepEqual(requests[0].body.events,requests[1].body.events);
 let sizes=[];await sendBatch(data.events.slice(0,10),{apiKey:'placeholder_key',region:'US',fetchFn:async(_,req)=>{const n=JSON.parse(req.body).events.length;sizes.push(n);return n>5?response(413):response(200,n);}});assert.deepEqual(sizes,[10,5,5]);
});
test('invalid key and partial ingestion do not advance the checkpoint',async()=>{
 const checkpoint={cursor:0};await assert.rejects(uploadBacklog(data.events.slice(0,30),checkpoint,{apiKey:'bad',region:'US',fetchFn:async()=>response(400,0,'Invalid API key'),sleep:async()=>{}}),/Invalid API key/);assert.equal(checkpoint.cursor,0);
 await assert.rejects(sendBatch(data.events.slice(0,10),{apiKey:'placeholder',region:'US',fetchFn:async()=>response(200,9)}),/count did not match/);
});
test('concurrent upload resumes from contiguous acknowledged watermark with batches of 10',async()=>{
 const sample=data.events.slice(0,75),checkpoint={cursor:20},sent=[],saved=[];
 await uploadBacklog(sample,checkpoint,{apiKey:'placeholder',region:'US',fetchFn:async(_,req)=>{const e=JSON.parse(req.body).events;sent.push(...e.map(x=>x.insert_id));await new Promise(r=>setTimeout(r,e[0]===sample[20]?10:1));return response(200,e.length);},sleep:async()=>{},save:r=>saved.push(r.cursor)});
 assert.equal(checkpoint.cursor,75);assert.equal(sent.length,55);assert.equal(new Set(sent).size,55);assert(saved.every(n=>n>=20&&n<=75));
});
test('pause stops outstanding work without losing resumable position',async()=>{
 const checkpoint={cursor:0},controller=new AbortController();
 await assert.rejects(uploadBacklog(data.events.slice(0,100),checkpoint,{apiKey:'placeholder',region:'US',signal:controller.signal,fetchFn:async(_,req)=>response(200,JSON.parse(req.body).events.length),sleep:async()=>{},onProgress:n=>{if(n>=30)controller.abort();}}),{name:'AbortError'});
 assert(checkpoint.cursor>=30&&checkpoint.cursor<100);
});

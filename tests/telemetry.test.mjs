import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {personas} from '../catalog.js';
const source=(await readFile(new URL('../telemetry.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export /g,'');
function harness(overrides={}){
 const calls=[],logs=[],plugins=[];const config={apiKey:'public-placeholder-key',region:'US',replay:true,engagement:true,experiment:true,autocapture:true,...overrides};const identity={deviceId:'device-original',sessionId:123456,userId:null};let n=0;
 const amp={add:plugin=>{plugins.push(plugin);calls.push(['add',plugin.name||plugin.kind]);return {promise:Promise.resolve()};},init:(key,user,options)=>{calls.push(['init',key,user,options]);return {promise:Promise.resolve()};},track:event=>{calls.push(['track',event]);return {promise:Promise.resolve({code:200})};},setUserId:id=>calls.push(['setUserId',id]),setDeviceId:id=>calls.push(['setDeviceId',id]),setSessionId:id=>calls.push(['setSessionId',id]),reset:()=>calls.push(['reset']),flush:()=>({promise:Promise.resolve()}),identify:traits=>calls.push(['identify',traits.values]),Identify:class{values={};set(k,v){this.values[k]=v;return this;}}};
 const window={amplitude:amp,sessionReplay:{plugin:options=>{calls.push(['replay',options]);return {kind:'replay'};}},engagement:{plugin:options=>{calls.push(['engagement',options]);return {kind:'engagement'};}},dispatchEvent:()=>{}};
 const api=new Function('config','identity','saveIdentity','uuid','window','location','CustomEvent','personas',`${source};return {startTelemetry,track,identify,newAnonymous,sdkStatus,eventLog};`)(config,identity,()=>{},()=>`uuid-${n++}`,window,{search:'?utm_source=google&utm_medium=cpc'},class{},personas);
 return {api,config,identity,calls,plugins,loader:async src=>logs.push(src),logs};
}
test('real product startup order, sharing identity and full auto tracking options',async()=>{
 const h=harness();const promise=h.api.startTelemetry(h.loader);h.api.track('Product Viewed',{product_id:'aurora-x7'});await promise;
 const init=h.calls.find(c=>c[0]==='init'),initIndex=h.calls.indexOf(init);assert.equal(init[1],h.config.apiKey);assert.equal(init[3].deviceId,h.identity.deviceId);assert.equal(init[3].serverZone,'US');const resolver=init[3].autocapture.elementInteractions.shouldTrackEventResolver;assert.equal(resolver('click',{closest:selector=>selector.includes('.amp-private')?{}:null}),false);assert.equal(resolver('click',{closest:selector=>selector.startsWith('a,button')?{}:null}),true);assert.equal(init[3].autocapture.frustrationInteractions.errorClicks,true);
 assert(h.calls.findIndex(c=>c[0]==='replay')<initIndex);assert(h.calls.findIndex(c=>c[0]==='engagement')<initIndex);assert(h.logs.at(-1).endsWith('.experiment.js'));
 const event=h.calls.find(c=>c[0]==='track')[1];assert.equal(event.event_properties.product_id,'aurora-x7');assert.equal(event.event_properties.utm_source,'google');assert.equal(event.event_properties.data_source,'live');
 await h.api.startTelemetry(h.loader);assert.equal(h.calls.filter(c=>c[0]==='init').length,1);
});
test('known user identification and anonymous session reset use actual SDK methods',async()=>{
 const h=harness({region:'EU'});await h.api.startTelemetry(h.loader);h.api.identify(personas[0]);assert.equal(h.identity.userId,personas[0].id);assert(h.calls.some(c=>c[0]==='identify'&&c[1].rewards_tier==='Gold'));
 const old=h.identity.deviceId;await h.api.newAnonymous();assert.notEqual(h.identity.deviceId,old);assert.equal(h.identity.userId,null);assert(h.calls.some(c=>c[0]==='reset'));assert(h.logs.some(s=>s.includes('cdn.eu.amplitude.com')&&s.endsWith('.experiment.js')));
});
test('no key sends nothing, broken SDK does not break shopping, private properties scrubbed',async()=>{
 const offline=harness({apiKey:''});await offline.api.startTelemetry(offline.loader);offline.api.track('Product Viewed');assert.equal(offline.calls.length,0);assert.equal(offline.api.eventLog[0].status,'local');
 const broken=harness();await broken.api.startTelemetry(async()=>{throw new Error('blocked');});assert.match(broken.api.sdkStatus.analytics,/Unavailable/);
 const h=harness();await h.api.startTelemetry(h.loader);const plugin=h.plugins.find(p=>p.name==='amplitronics-event-inspector');const event=await plugin.execute({event_type:'[Amplitude] Element Clicked',event_properties:{card_number:'4242',input_value:'secret',label:h.config.apiKey}});assert.equal(event.event_properties.card_number,undefined);assert.equal(event.event_properties.input_value,undefined);assert.equal(event.event_properties.label,'[redacted]');
});

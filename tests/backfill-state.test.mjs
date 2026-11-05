import test from 'node:test';
import assert from 'node:assert/strict';
import {selectBacklogRun,saveBacklogRun} from '../backfill-state.js';
import {createRun,projectFingerprint,uploadBacklog} from '../backlog.js';
function memory(entries={}){const data=new Map(Object.entries(entries));return {get:(key,fallback)=>structuredClone(data.has(key)?data.get(key):fallback),set:(key,value)=>{data.set(key,structuredClone(value));return true;}};}
const makeRun=()=>createRun(Date.UTC(2026,10,5),'state-fixture');
test('a completed upload to one key does not block a new key and switching back restores progress',async()=>{
 const a=await projectFingerprint('project-api-key-a','US'),b=await projectFingerprint('project-api-key-b','US');
 const storage=memory({'backlog-run':{...makeRun(),version:2,project:a,cursor:100,startedAt:1}});
 let run=selectBacklogRun(storage,b,makeRun);assert.equal(run.cursor,0);assert.equal(run.project,b);assert.equal(run.version,3);
 const sent=[];const events=Array.from({length:30},(_,i)=>({event_type:'[Amplitude] Page Viewed',device_id:`device-${i}`,insert_id:`insert-${i}`}));
 await uploadBacklog(events,run,{apiKey:'project-api-key-b',region:'US',sleep:async()=>{},save:r=>saveBacklogRun(storage,r),fetchFn:async(_,request)=>{const body=JSON.parse(request.body);sent.push(body);return {status:200,json:async()=>({code:200,events_ingested:body.events.length})};}});
 assert.equal(sent.flatMap(body=>body.events).length,30);assert(sent.every(body=>body.api_key==='project-api-key-b'));assert.equal(run.cursor,30);
 assert.equal(selectBacklogRun(storage,a,makeRun).cursor,100);assert.equal(selectBacklogRun(storage,b,makeRun).cursor,30);
});
test('partial uploads and regions keep independent checkpoints',async()=>{
 const storage=memory(),a=await projectFingerprint('project-api-key','US'),eu=await projectFingerprint('project-api-key','EU');assert.notEqual(a,eu);
 const original=selectBacklogRun(storage,a,makeRun);original.cursor=70;original.startedAt=123;saveBacklogRun(storage,original);
 const alternate=selectBacklogRun(storage,eu,makeRun);assert.equal(alternate.cursor,0);alternate.cursor=20;saveBacklogRun(storage,alternate);
 const restored=selectBacklogRun(storage,a,makeRun);assert.equal(restored.cursor,70);assert.equal(restored.startedAt,123);assert.equal(restored.seed,original.seed);assert.equal(selectBacklogRun(storage,eu,makeRun).cursor,20);
});
test('fresh previews upgrade the traffic model without rewriting started recipes',()=>{
 const storage=memory({'backlog-run:project-a':{...makeRun(),version:2,project:'project-a',cursor:0}});
 assert.equal(selectBacklogRun(storage,'project-a',makeRun).version,3);
 const started={...makeRun(),version:2,project:'project-b',cursor:0,startedAt:123};saveBacklogRun(storage,started);
 assert.equal(selectBacklogRun(storage,'project-b',makeRun).version,2);
});
test('failed checkpoint migration keeps the original legacy recipe available',()=>{
 const legacy={...makeRun(),project:'project-a',version:2,cursor:10,startedAt:123};
 const storage={get:(key,fallback)=>key==='backlog-run'?structuredClone(legacy):fallback,set:()=>false};
 assert.equal(selectBacklogRun(storage,'project-a',makeRun).cursor,10);assert.equal(saveBacklogRun(storage,legacy),false);
});

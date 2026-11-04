import {personas} from './catalog.js';
import {config,identity,saveIdentity,uuid} from './storage.js';
export const sdkStatus = {analytics:'Not connected',replay:'Not connected',experiment:'Not connected',engagement:'Not connected',autocapture:'Not connected'};
export const eventLog=[];
let ready=false, starting=false, pending=[];
const attribution = {};
for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']) {
 const value=new URLSearchParams(location.search).get(key); if(value) attribution[key]=value.slice(0,120);
}
function shouldCaptureElement(_action,element){if(element.closest('.amp-private,.payment-fields,[data-private]'))return false;return !!element.closest('a,button,input,select,textarea,label,video,audio,[contenteditable=true],[data-amp-default-track],.amp-default-track');}
function notify(){window.dispatchEvent(new CustomEvent('telemetry-update'));}
function record(event,status='local') {
 const item={...event,status,loggedAt:Date.now()}; eventLog.unshift(item);eventLog.splice(120);notify();return item;
}
export function track(name,props={},extra={}) {
 identity.lastActive=Date.now();saveIdentity();
 const event={event_type:name,event_properties:{...attribution,...props,data_source:'live',store:'Amplitronics',currency:'AUD'},device_id:identity.deviceId,session_id:identity.sessionId,...(identity.userId?{user_id:identity.userId}:{}),insert_id:uuid(),time:Date.now(),...extra};
 const item=record(event);
 if(ready) send(event,item);
 else if(starting) pending.push([event,item]);
 return event;
}
function send(event,item) {
 item.status='queued';
 try {
  const result=window.amplitude.track(event);
  result?.promise?.then(r=>{item.status=r.code===200?'sent':`upload ${r.code}`;notify();}).catch(()=>{item.status='upload failed';notify();});
 }catch{item.status='upload failed';}notify();
}
export function identify(persona) {
 identity.userId=persona.id;saveIdentity();
 if(ready){window.amplitude.setUserId(persona.id);setTraits(persona);}
 track('User Signed In',{rewards_tier:persona.tier,segment:persona.segment});
}
function setTraits(persona){const traits=new window.amplitude.Identify();for(const [k,v] of Object.entries({name:persona.name,rewards_tier:persona.tier,rewards_points:persona.points,lifetime_orders:persona.orders,segment:persona.segment,last_order_days:persona.last_order_days}))traits.set(k,v);window.amplitude.identify(traits);}
export async function newAnonymous() {
 if(ready) {try {await window.amplitude.flush().promise;}catch{} window.amplitude.reset();}
 identity.deviceId=`amp-${uuid()}`;identity.userId=null;identity.sessionId=Date.now();saveIdentity();
 if(ready){window.amplitude.setDeviceId(identity.deviceId);window.amplitude.setSessionId(identity.sessionId);}
 track('Session Started',{entry_point:'new_anonymous_user'});
}
export function loadScript(src) {
 return new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=src;script.async=false;
  const timeout=setTimeout(()=>reject(new Error('Script timed out')),15000);
  script.onload=()=>{clearTimeout(timeout);resolve();};script.onerror=()=>{clearTimeout(timeout);reject(new Error('Script blocked or unavailable'));};document.head.appendChild(script);
 });
}
export async function startTelemetry(loader=loadScript) {
 if(!config.apiKey || ready || starting) return;
 starting=true;const zone=config.region;
 try{
  sdkStatus.analytics='Loading';notify();
  await loader('https://cdn.amplitude.com/libs/analytics-browser-2.49.1-min.js.gz');
  const amp=window.amplitude;
  if(config.replay){try{await loader('https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.36.6-min.js.gz');amp.add(window.sessionReplay.plugin({sampleRate:1,serverZone:zone,privacyConfig:{blockSelector:['.amp-private','.payment-fields'],defaultMaskLevel:'medium'}}));sdkStatus.replay='Plugin registered · 100% sample';}catch{sdkStatus.replay='Script failed';}}else sdkStatus.replay='Disabled';
  if(config.engagement){try{await loader(`https://${zone==='EU'?'cdn.eu.amplitude.com':'cdn.amplitude.com'}/script/${encodeURIComponent(config.apiKey)}.engagement.js`);amp.add(window.engagement.plugin({serverZone:zone}));sdkStatus.engagement='Plugin registered · project targeting applies';}catch{sdkStatus.engagement='Script failed';}}else sdkStatus.engagement='Disabled';
  amp.add({name:'amplitronics-event-inspector',type:'enrichment',setup:async()=>{},execute:async(event)=>{
   // Never echo API keys or checkout input values into the inspector or custom properties.
   const properties=event.event_properties||{};
   if(event.event_type?.startsWith('[Amplitude] Form')&&properties['[Amplitude] Form ID']==='settings-form')return null;
   for(const key of Object.keys(properties)){
    if(/value|password|card_number|cvv|email|address/i.test(key)) delete properties[key];
    else if(typeof properties[key]==='string'&&properties[key].includes(config.apiKey))properties[key]='[redacted]';
   }
   event.event_properties={...properties,data_source:'live'};
   if(event.event_type?.startsWith('[Amplitude]'))record(event,'autocaptured');
   return event;
  }});
  await amp.init(config.apiKey,identity.userId||undefined,{
   serverZone:zone,deviceId:identity.deviceId,sessionId:identity.sessionId,identityStorage:'localStorage',
   autocapture:config.autocapture?{attribution:true,pageViews:true,sessions:true,formInteractions:{shouldTrackSubmit:event=>!event.target.closest('.amp-private')},fileDownloads:true,elementInteractions:{shouldTrackEventResolver:shouldCaptureElement},frustrationInteractions:{rageClicks:true,deadClicks:true,errorClicks:true,thrashedCursor:true,shouldTrackEventResolver:shouldCaptureElement},networkTracking:true,webVitals:true}:false,
   fetchRemoteConfig:true
  }).promise;
  ready=true; sdkStatus.analytics='Initialized · check upload results below'; sdkStatus.autocapture=config.autocapture?'Enabled · payment forms excluded':'Disabled';
  // Reconcile current identity if the visitor switched persona while scripts were loading.
  amp.setDeviceId(identity.deviceId);amp.setUserId(identity.userId||undefined);amp.setSessionId(identity.sessionId);
  const persona=personas.find(p=>p.id===identity.userId);if(persona)setTraits(persona);
  for(const [event,item] of pending)send(event,item);pending=[];
  if(config.experiment){try{
   // Actual Web Experiment tag, distinct from the Feature Experiment SDK.
   await loader(`https://${zone==='EU'?'cdn.eu.amplitude.com':'cdn.amplitude.com'}/script/${encodeURIComponent(config.apiKey)}.experiment.js`);
   sdkStatus.experiment='Tag loaded · publish an experiment in Amplitude';
  }catch{sdkStatus.experiment='Script failed';}}else sdkStatus.experiment='Disabled';
 }catch(error){sdkStatus.analytics=`Unavailable: ${error.message}`;pending.forEach(([,i])=>i.status='SDK unavailable');pending=[];}
 starting=false;notify();
}
export function isReady(){return ready;}

import {products,productProperties} from './catalog.js';
const DAY=86400000;
export const channels=[
 {name:'Paid Search',source:'google',medium:'cpc',campaign:'spring_tech_search',weight:24,intent:.57,referrer:'https://www.google.com/'},
 {name:'Paid Social',source:'instagram',medium:'paid_social',campaign:'spring_creator_edit',weight:23,intent:.30,referrer:'https://www.instagram.com/'},
 {name:'Organic Search',source:'google',medium:'organic',campaign:'(none)',weight:20,intent:.48,referrer:'https://www.google.com/'},
 {name:'Email',source:'amplitronics',medium:'email',campaign:'amp_rewards_weekly',weight:13,intent:.65,referrer:'https://mail.google.com/'},
 {name:'Direct',source:'(direct)',medium:'(none)',campaign:'(none)',weight:15,intent:.55,referrer:'(none)'},
 {name:'Referral',source:'techreview',medium:'referral',campaign:'creator_desk_guide',weight:5,intent:.46,referrer:'https://techreview.example/creator-desks'}
];
function hash(text){let n=2166136261;for(const ch of text){n^=ch.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
function rng(seed){let n=hash(seed);return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function choose(list,r){return list[Math.floor(r()*list.length)];}
function channel(r){let n=r()*100;return channels.find(c=>(n-=c.weight)<0)||channels.at(-1);}
export function createRun(now=Date.now(),seed='spring-tech-v1') {return {version:1,seed,start:Math.floor(now/DAY)*DAY-30*DAY,days:30,usersPerDay:200,cursor:0,createdAt:now};}
export function generateBacklog(run) {
 if(run.version!==1||run.days!==30||run.usersPerDay!==200||!Number.isFinite(run.start))throw new Error('Unsupported backlog recipe');
 const r=rng(`${run.seed}:${run.start}`),events=[],daily=[],unique=new Set();
 const summary={dailyVisitors:6000,uniqueUsers:0,sessions:0,purchases:0,errors:0,recoveredPurchases:0,revenue:0,channels:{},daily};
 for(let day=0;day<30;day++){
  const date=run.start+day*DAY,stat={date:new Date(date).toISOString().slice(0,10),visitors:200,purchases:0,errors:0};daily.push(stat);
  for(let visitor=0;visitor<200;visitor++){
   // Sixty visitors return across days; 140 are new. Exactly 200 distinct devices on each day.
   const person=visitor<60?`returning-${visitor}`:`new-${day}-${visitor}`;
   const device=`seed-${hash(run.seed).toString(16)}-${person}`,known=visitor<60||r()<.30;
   unique.add(device);const user=known?`shopper-${hash(run.seed).toString(16)}-${person}`:null;
   const personRng=rng(`${run.seed}:${person}`);const mobile=personRng()<.59,ch=channel(r),p=choose(products.filter(p=>p.category!=='games'||r()<.5),r);
   const country=choose(['Australia','Australia','Australia','New Zealand','United States','United Kingdom'],personRng);
   const userProps={rewards_tier:visitor<60?'Gold':known?'Bronze':'None',customer_type:visitor<60?'Returning':'New',preferred_category:p.category};
   const common={...productProperties(p),channel:ch.name,utm_source:ch.source,utm_medium:ch.medium,utm_campaign:ch.campaign,referrer:ch.referrer,device_type:mobile?'Mobile':'Desktop',customer_type:userProps.customer_type,data_source:'synthetic',dataset:run.seed,store:'Amplitronics'};
   summary.channels[ch.name]=(summary.channels[ch.name]||0)+1;
   const sessions=r()<.18?2:1;
   for(let session=0;session<sessions;session++){
    summary.sessions++;const sid=date+(7*60*60+Math.floor(r()*11*60*60)+session*3*60*60)*1000;let time=sid,index=0;
    const emit=(name,props={},extra={})=>{time+=Math.floor(3+r()*35)*1000;events.push({event_type:name,device_id:device,...(user?{user_id:user}:{}),session_id:sid,time,insert_id:`${device}-${date}-${session}-${index++}`,platform:'Web',os_name:mobile?'iOS':'Windows',country,language:'en',user_properties:userProps,event_properties:{...common,...props},...extra});};
    emit('Session Started',{landing_page:ch.medium==='cpc'?`#/product/${p.id}`:'#/'});
    emit('Page Viewed',{page_type:'home',page_path:'/'});
    if(r()<.24)continue;
    if(r()<.34)emit('Search Performed',{query:p.category,result_count:products.filter(x=>x.category===p.category).length});
    emit('Category Viewed',{category:p.category});
    emit('Product Viewed');
    if(r()<.16)emit('Wishlist Updated',{action:'added'});
    if(r()>ch.intent)continue;
    const qty=r()<.09?2:1;
    emit('Product Added to Cart',{quantity:qty,cart_value:p.price*qty});
    emit('Cart Viewed',{item_count:qty,subtotal:p.price*qty});
    if(r()<.24)continue;
    const discounted=ch.medium==='email'||r()<.14;
    if(discounted)emit('Coupon Applied',{coupon:'AMP10',discount:p.price*qty*.1});
    const subtotal=p.price*qty,discount=discounted?Math.round(subtotal*10)/100:0,shipping=subtotal-discount>=150?0:9.95,total=Math.round((subtotal-discount+shipping)*100)/100;
    emit('Checkout Started',{item_count:qty,subtotal,total});
    if(r()<.14)continue;
    emit('Checkout Step Completed',{step:'delivery',shipping_method:'standard'});
    if(r()<.12)continue;
    emit('Payment Submitted',{payment_method:'card',attempt:1,total});
    // A planted mobile payment regression in the middle of the period for diagnosis exercises.
    const regression=mobile&&day>=17&&day<=23;
    let error=r()<(regression?.52:.16);
    if(error){
     summary.errors++;stat.errors++;
     const code=regression?'payment_timeout':choose(['invalid_card','transaction_declined','payment_timeout'],r);
     emit('Checkout Error',{error_code:code,step:'payment',field:code==='invalid_card'?'card':'payment',attempt:1});
     if(r()<(regression?.71:.48))continue;
     emit('Payment Submitted',{payment_method:'card',attempt:2,total});
    }else if(r()<.05)continue;
    emit('Order Completed',{order_id:`SEED-${day}-${visitor}-${session}`,item_count:qty,subtotal,discount,shipping,total,products:[{product_id:p.id,quantity:qty,price:p.price}]},{revenue:total,currency:'AUD',revenueType:'purchase'});
    summary.purchases++;stat.purchases++;summary.revenue+=total;if(error)summary.recoveredPurchases++;
    if(r()<.23)emit('Store Feedback Submitted',{rating:choose([4,4,5,5,5],r),context:'post_purchase'});
   }
  }
 }
 events.sort((a,b)=>a.time-b.time||a.insert_id.localeCompare(b.insert_id));summary.uniqueUsers=unique.size;summary.revenue=Math.round(summary.revenue*100)/100;
 return {events,summary};
}
export const endpoint = region => region==='EU'?'https://api.eu.amplitude.com/2/httpapi':'https://api2.amplitude.com/2/httpapi';
export async function projectFingerprint(key,region) {
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${region}:${key}`));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
export const pause = (ms,signal) => new Promise((resolve,reject)=>{
 if(signal?.aborted)return reject(new DOMException('Paused','AbortError'));
 const abort=()=>{clearTimeout(timer);reject(new DOMException('Paused','AbortError'));};
 const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},ms);signal?.addEventListener('abort',abort,{once:true});
});
export async function sendBatch(events,{apiKey,region,signal,fetchFn=fetch,sleep=pause,onRetry=()=>{}},attempt=0) {
 signal?.throwIfAborted();
 const controller=new AbortController(); const abort=()=>controller.abort(); signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(()=>controller.abort(),20000);
 let response,body;
 try{response=await fetchFn(endpoint(region),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:apiKey,events}),signal:controller.signal});body=await response.json();}
 catch(error){if(signal?.aborted)throw new DOMException('Paused','AbortError');if(attempt>=4)throw new Error('Network request failed after retries. Resume to try again.');clearTimeout(timer);signal?.removeEventListener('abort',abort);onRetry('Network unavailable; retrying');await sleep(1000*2**attempt,signal);return sendBatch(events,{apiKey,region,signal,fetchFn,sleep,onRetry},attempt+1);}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 if(response.status===413&&events.length>1){const middle=Math.floor(events.length/2);await sendBatch(events.slice(0,middle),{apiKey,region,signal,fetchFn,sleep,onRetry});await sendBatch(events.slice(middle),{apiKey,region,signal,fetchFn,sleep,onRetry});return;}
 if(response.status===429||response.status>=500){if(attempt>=4)throw new Error(`Amplitude HTTP ${response.status}: paused after repeated retries.`);const retryHeader=Number(response.headers?.get('retry-after'));const delay=response.status===429?Math.max(60000,Number.isFinite(retryHeader)?retryHeader*1000:0):1000*2**attempt;onRetry(`HTTP ${response.status}; retrying in ${Math.round(delay/1000)}s`);await sleep(delay,signal);return sendBatch(events,{apiKey,region,signal,fetchFn,sleep,onRetry},attempt+1);}
 if(response.status!==200||body.code!==200||body.events_ingested!==events.length)throw new Error(`Amplitude HTTP ${response.status}: ${body.error||'ingestion count did not match'}. Check the API key and region, then resume.`);
}
export async function uploadBacklog(events,run,options) {
 const {signal,onProgress=()=>{},save=()=>{},sleep=pause}=options;
 let next=run.cursor; const completed=new Map();let failure;
 const worker=async()=>{
  while(next<events.length&&!signal?.aborted&&!failure){const start=next,end=Math.min(start+10,events.length);next=end;
   try{await sendBatch(events.slice(start,end),options);completed.set(start,end);
    while(completed.has(run.cursor)){const endAt=completed.get(run.cursor);completed.delete(run.cursor);run.cursor=endAt;}
    save(run);onProgress(run.cursor,events.length);await sleep(100,signal);
   }catch(error){failure=error;}
  }
 };
 await Promise.all([worker(),worker(),worker()]);
 if(failure)throw failure;signal?.throwIfAborted();return run.cursor;
}

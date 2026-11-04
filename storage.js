export const storage = {
 get(key,fallback) {try {const value=localStorage.getItem(`amplitronics:${key}`);return value===null?fallback:JSON.parse(value);} catch{return fallback;}},
 set(key,value) {try {localStorage.setItem(`amplitronics:${key}`,JSON.stringify(value));return true;} catch {window.dispatchEvent(new CustomEvent('storage-error'));return false;}},
 remove(key) {try {localStorage.removeItem(`amplitronics:${key}`);} catch {}}
};
export const uuid = () => crypto.randomUUID();
export const defaults = {apiKey:'',region:'US',replay:true,experiment:true,engagement:true,autocapture:true,errorMode:'normal',randomRate:20};
export const config = {...defaults,...storage.get('config',{})};
export const identity = storage.get('identity',{deviceId:`amp-${uuid()}`,sessionId:Date.now(),userId:null});
if(Date.now()-(identity.lastActive||identity.sessionId)>30*60*1000)identity.sessionId=Date.now();
identity.lastActive=Date.now();
storage.set('identity',identity);
export function saveIdentity(){storage.set('identity',identity);}

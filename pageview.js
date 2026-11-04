// Shared titles keep synthetic page views aligned with the real hash-routed store.
export const DEFAULT_SITE_URL = 'https://shermozle.github.io/amplitronics-practitioner-workshop/';
export function pageTitle(route) {
 const path=route.split('?')[0];
 return `${path==='/'?'Good tech. Great energy.':path.split('/')[1].replace(/^./,c=>c.toUpperCase())} · Amplitronics`;
}
export function historicalPageProperties({siteUrl=DEFAULT_SITE_URL,route,campaign={},pageViewId,counter}) {
 const url=new URL(siteUrl);
 url.hash=route;
 for(const [key,value] of Object.entries(campaign))url.searchParams.set(key,value);
 const href=decodeURI(url.href);
 return {
  '[Amplitude] Page Domain':url.hostname,
  '[Amplitude] Page Location':href,
  '[Amplitude] Page Path':decodeURI(url.pathname),
  '[Amplitude] Page Title':pageTitle(route),
  // Matches Browser SDK 2's location.href.split('?')[0], including hash routes.
  '[Amplitude] Page URL':href.split('?')[0],
  '[Amplitude] Page View ID':pageViewId,
  '[Amplitude] Page Counter':counter
 };
}

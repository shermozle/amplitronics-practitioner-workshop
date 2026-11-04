export const categories = [
  {id:'phones',name:'Phones',icon:'phone',color:'#eee4ff',tag:'Stay connected'},
  {id:'laptops',name:'Laptops',icon:'laptop',color:'#e1edf8',tag:'Make it happen'},
  {id:'gaming',name:'Gaming',icon:'game',color:'#e5efda',tag:'Level up'},
  {id:'audio',name:'Audio & music',icon:'headphones',color:'#fbe6dc',tag:'Find your sound'},
  {id:'computing',name:'PC & accessories',icon:'cpu',color:'#e5e4f6',tag:'Build your setup'},
  {id:'games',name:'Games',icon:'disc',color:'#f6e3ef',tag:'One more round'}
];
export const products = [
{id:'aurora-x7',brand:'LUMEN',name:'Aurora X7 5G',subtitle:'256GB · Midnight violet',category:'phones',art:'phone',color:'#8270b3',price:999,was:1199,rating:4.8,reviews:156,badge:'SAVE $200',specs:['6.7-inch OLED display · 120Hz','50MP triple camera system','256GB storage · all-day battery'],stock:24},
{id:'nimbus-16',brand:'VEKTOR',name:'Nimbus 16 Creator',subtitle:'32GB RAM · 1TB SSD',category:'laptops',art:'laptop',color:'#8c92ae',price:2299,was:2799,rating:4.9,reviews:84,badge:'CREATOR FAVOURITE',specs:['16-inch 2.5K colour-accurate display','32GB memory · 1TB SSD','Up to 18 hours of battery life'],stock:12},
{id:'pulse-pad',brand:'ORBIT',name:'Pulse Pro Controller',subtitle:'Wireless · Sage edition',category:'gaming',art:'game',color:'#9ca889',price:89,was:119,rating:4.7,reviews:225,badge:'SAVE $30',specs:['Precision hall-effect thumbsticks','40-hour rechargeable battery','Compatible with PC and console'],stock:42},
{id:'studio-pro',brand:'SONORA',name:'Studio Pro Wireless',subtitle:'Noise cancelling · Warm white',category:'audio',art:'headphones',color:'#c6b7a5',price:249,was:349,rating:4.9,reviews:312,badge:'BESTSELLER',specs:['Adaptive active noise cancellation','40mm high-resolution drivers','50-hour battery · fast charge'],stock:18},
{id:'zenith-15',brand:'POMME',name:'Zenith 15 Pro',subtitle:'512GB · Titanium',category:'phones',art:'phone',color:'#a4a9a6',price:1699,was:1899,rating:4.7,reviews:91,badge:'SAVE $200',specs:['6.1-inch Super Retina display','Pro-grade 48MP camera','512GB storage · titanium frame'],stock:8},
{id:'airbook-14',brand:'VEKTOR',name:'Airbook 14',subtitle:'16GB RAM · 512GB SSD',category:'laptops',art:'laptop',color:'#b4b5bd',price:1099,was:1399,rating:4.6,reviews:178,badge:'SAVE $300',specs:['14-inch edge-to-edge display','16GB memory · 512GB SSD','Lightweight 1.2kg aluminium build'],stock:22},
{id:'glide-mouse',brand:'VEKTOR',name:'Glide Wireless Mouse',subtitle:'Silent clicks · Graphite',category:'computing',art:'mouse',color:'#737681',price:69,was:89,rating:4.8,reviews:727,badge:'DESK ESSENTIAL',specs:['Multi-device Bluetooth connection','Ergonomic precision grip','90-day rechargeable battery'],stock:66},
{id:'core-x9',brand:'SILICA',name:'Core X9 Processor',subtitle:'16 cores · Built for more',category:'computing',art:'cpu',color:'#87809e',price:749,was:899,rating:4.9,reviews:135,badge:'SAVE $150',specs:['16 cores · 32 threads','Up to 5.4GHz boost clock','Unlocked for performance tuning'],stock:15},
{id:'nova-console',brand:'ORBIT',name:'Nova Digital Console',subtitle:'1TB · Glacier white',category:'gaming',art:'console',color:'#d5d5dc',price:599,was:699,rating:4.8,reviews:234,badge:'READY TO PLAY',specs:['4K gaming at up to 120fps','Ultra-fast 1TB SSD','One wireless controller included'],stock:11},
{id:'echo-mini',brand:'SONORA',name:'Echo Mini Speaker',subtitle:'Portable · Terracotta',category:'audio',art:'speaker',color:'#be8069',price:99,was:149,rating:4.5,reviews:206,badge:'SAVE $50',specs:['Rich 360-degree sound','IP67 waterproof design','16 hours of portable listening'],stock:35},
{id:'stellar-odyssey',brand:'ORBIT STUDIOS',name:'Stellar Odyssey',subtitle:'Open-world adventure · PC',category:'games',art:'disc',color:'#7563a4',price:59,was:89,rating:4.9,reviews:482,badge:'FAN FAVOURITE',specs:['Explore a galaxy of possibilities','Single player · ages 12+','Digital download · PC edition'],stock:999},
{id:'velocity-racing',brand:'ORBIT STUDIOS',name:'Velocity Racing',subtitle:'Next-gen racing · Console',category:'games',art:'disc',color:'#b56e5a',price:49,was:79,rating:4.6,reviews:164,badge:'SAVE $30',specs:['Race across 40 stunning tracks','Local and online multiplayer','Console digital edition'],stock:999}
];
export const personas = [
{id:'demo-jess-nakamura',name:'Jess Nakamura',initials:'JN',tier:'Gold',points:8400,orders:14,segment:'Loyal tech enthusiast',last_order_days:7},
{id:'demo-sam-okafor',name:'Sam Okafor',initials:'SO',tier:'Bronze',points:200,orders:1,segment:'First-time shopper',last_order_days:2},
{id:'demo-priya-shah',name:'Priya Shah',initials:'PS',tier:'Silver',points:3200,orders:6,segment:'Creative professional',last_order_days:21},
{id:'demo-leo-martin',name:'Leo Martin',initials:'LM',tier:'Gold',points:6100,orders:11,segment:'Lapsed customer',last_order_days:120}
];
export const productProperties = p => ({product_id:p.id,product_name:p.name,category:p.category,brand:p.brand,price:p.price,currency:'AUD'});
export const money = value => new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:2}).format(value);

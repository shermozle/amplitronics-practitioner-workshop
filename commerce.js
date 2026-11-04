import {products} from './catalog.js';
export function totals(cart,coupon='',shipping='standard') {
 const subtotal=cart.reduce((sum,row)=>sum+(products.find(p=>p.id===row.id)?.price||0)*row.qty,0);
 const discount=coupon==='AMP10'?Math.round(subtotal*10)/100:0;
 const delivery=shipping==='express'?19.95:subtotal-discount>=150||subtotal===0?0:9.95;
 return {subtotal,discount,shipping:delivery,total:Math.round((subtotal-discount+delivery)*100)/100};
}
export function luhn(value){const digits=value.replace(/[ -]/g,'');if(!/^\d{13,19}$/.test(digits))return false;let sum=0;for(let i=digits.length-1,double=false;i>=0;i--,double=!double){let n=+digits[i];if(double){n*=2;if(n>9)n-=9;}sum+=n;}return sum%10===0&&!/^0+$/.test(digits);}
export function validatePayment(data,now=new Date()) {
 const errors={};
 if(!luhn(data.card||''))errors.card='Enter a valid test card number. Try 4242 4242 4242 4242.';
 const expiry=/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/.exec(data.expiry||'');
 if(!expiry||new Date(2000+Number(expiry[2]),Number(expiry[1]),1)<=now)errors.expiry='Enter a future expiry date (MM/YY).';
 if(!/^\d{3,4}$/.test(data.cvv||''))errors.cvv='Enter a 3 or 4 digit test security code.';
 if(!data.cardName?.trim())errors.cardName='Enter a name for this demo card.';
 return errors;
}
export function paymentOutcome(card,mode='normal',rate=20,random=Math.random) {
 if(mode==='decline'||card.replace(/\D/g,'')==='4000000000000002')return 'transaction_declined';
 if(mode==='network')return 'payment_timeout';
 if(mode==='random'&&random()<rate/100)return random()<.5?'transaction_declined':'payment_timeout';
 return null;
}

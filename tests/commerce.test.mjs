import test from 'node:test';
import assert from 'node:assert/strict';
import {totals,luhn,validatePayment,paymentOutcome} from '../commerce.js';
test('cart discounts, delivery threshold, express and cent rounding',()=>{
 assert.deepEqual(totals([{id:'studio-pro',qty:1}],'AMP10'),{subtotal:249,discount:24.9,shipping:0,total:224.1});
 assert.equal(totals([{id:'glide-mouse',qty:2}],'AMP10').total,134.15);
 assert.equal(totals([{id:'studio-pro',qty:1}],'AMP10','express').total,244.05);
 assert.equal(totals([]).total,0);
});
test('test cards, input formats and expiry validation',()=>{
 assert(luhn('4242 4242 4242 4242'));assert(luhn('4000 0000 0000 0002'));assert(!luhn('1234'));assert(!luhn('0000000000000000'));
 assert(!luhn('4242 4242 4242 424A'));
 assert.deepEqual(validatePayment({card:'4242424242424242',expiry:'12/35',cvv:'123',cardName:'Alex'},new Date('2026-11-05')),{});
 assert(validatePayment({card:'1234',expiry:'10/26',cvv:'2',cardName:''},new Date('2026-11-05')).expiry);
 assert(!validatePayment({card:'4242424242424242',expiry:'11/26',cvv:'123',cardName:'Alex'},new Date('2026-11-05')).expiry);
});
test('deterministic failure controls',()=>{
 assert.equal(paymentOutcome('4242424242424242'),null);
 assert.equal(paymentOutcome('4000000000000002'),'transaction_declined');
 assert.equal(paymentOutcome('4242424242424242','decline'),'transaction_declined');
 assert.equal(paymentOutcome('4242424242424242','network'),'payment_timeout');
 assert.equal(paymentOutcome('4242424242424242','random',20,()=>.8),null);
 assert.equal(paymentOutcome('4242424242424242','random',20,()=>.1),'transaction_declined');
});

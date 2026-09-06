import fs from 'node:fs';
const SR=48000,D=225,N=SR*D,b=new Float32Array(N);
const add=(t,f,d,a=0.08,type='sin')=>{const s=Math.floor(t*SR),n=Math.floor(d*SR);for(let i=0;i<n&&s+i<N;i++){const x=i/SR,e=Math.min(1,x/.03,Math.max(0,(d-x)/.12));let w=Math.sin(2*Math.PI*f*x);if(type==='square')w=Math.sign(w);if(type==='noise')w=(Math.random()*2-1);b[s+i]+=w*a*e}};
// low stadium drone
for(let t=0;t<D;t+=4){add(t,55,4,.025);add(t,82.5,4,.012)}
// heartbeat intro and final tension
for(let t=5;t<24;t+=1.35){add(t,48,.13,.18);add(t+.18,42,.09,.12)}
// race percussion gradually accelerates
for(let t=24;t<175;){const phase=(t-24)/151,step=.62-.24*phase;add(t,72,.09,.13,'noise');add(t,110,.08,.07);if(Math.floor(t/step)%4===0)add(t,48,.15,.13);t+=step}
// harmonic rises
for(let t=45;t<175;t+=8){const k=Math.floor((t-45)/8)%4;[110,138.59,164.81,196][k]&&add(t,[110,138.59,164.81,196][k],7,.025)}
// final moves: heartbeat and impacts
for(let t=175;t<204;t+=1.5){add(t,46,.14,.20);add(t+.2,40,.10,.12)}
// climax stabs
for(const [t,f] of [[204,110],[204,164.81],[204,220],[209,130.81],[209,196],[209,261.63],[216,146.83],[216,220],[216,293.66]])add(t,f,4,.09);
for(let t=216;t<225;t+=.5)add(t,82,.08,.08,'noise');
let peak=0;for(const v of b)peak=Math.max(peak,Math.abs(v));const scale=peak?0.82/peak:1;
const data=Buffer.alloc(N*2);for(let i=0;i<N;i++)data.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(b[i]*scale*32767))),i*2);
const h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(36+data.length,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(SR,24);h.writeUInt32LE(SR*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(data.length,40);
fs.mkdirSync('video/public',{recursive:true});fs.writeFileSync('video/public/score.wav',Buffer.concat([h,data]));console.log('Original 225-second score generated.');

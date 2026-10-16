const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
(async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'carevista-api-'));
 const dataFile=path.join(directory,'test-data.json');
 const port=12000+Math.floor(Math.random()*20000);
 const server=spawn(process.execPath,['server/server.cjs'],{env:{...process.env,PORT:String(port),DATA_FILE:dataFile,TOKEN_TTL_SECONDS:'3'},stdio:['ignore','pipe','pipe']});
 try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('API did not start')),10000);server.stdout.once('data',()=>{clearTimeout(timer);resolve();});server.once('error',reject);server.once('exit',code=>{if(code)reject(Error('API startup failed: '+code));});});
  const base='http://localhost:'+port+'/api';let token='';
  async function call(method,url,status=200,data){const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(data?{body:JSON.stringify(data)}:{})});const body=await response.json();assert.equal(response.status,status,JSON.stringify(body));return body;}
  const credentials={name:'Test Patient',email:'test@example.com',password:'test123'};
  await call('GET','/appointments',401);
  await call('POST','/auth/signup',201,credentials);
  await call('POST','/auth/login',401,{...credentials,password:'wrong'});
  token=(await call('POST','/auth/login',200,credentials)).token;
  assert.equal((await call('GET','/doctors')).length,8);
  assert.equal((await call('GET','/doctors?search=Arun&specialty=Cardiologist')).length,1);
  assert.equal((await call('GET','/doctors/101')).id,1);
  const availability=await call('GET','/doctors/1/availability');
  const data={doctorId:1,date:availability.dates[0],time:availability.slots[0],patientName:'Test Patient',phone:'9876543210'};
  await call('POST','/appointments',400,{...data,phone:'123'});
  const item=(await call('POST','/appointments',201,data)).appointment;
  await call('POST','/appointments',409,data);
  const v=await call('GET','/doctors/1/availability?date='+data.date);assert(v.bookedSlots.includes(data.time));
  await call('PATCH','/appointments/'+item.id,200,{date:data.date,time:availability.slots[1]});
  await call('PATCH','/appointments/'+item.id,400,{date:'2000-01-01'});
  const patientToken=token;
  await call('POST','/auth/signup',201,{...credentials,email:'other@example.com'});
  token=(await call('POST','/auth/login',200,{email:'other@example.com',password:'test123'})).token;
  await call('DELETE','/appointments/'+item.id,404);token=patientToken;
  await call('DELETE','/appointments/'+item.id);
  assert((await call('GET','/appointments/history')).appointments.some(a=>a.id===item.id&&a.status==='Cancelled'));
  await call('POST','/auth/logout');await call('GET','/appointments',401);
  token=(await call('POST','/auth/login',200,credentials)).token;
  await new Promise(resolve=>setTimeout(resolve,3200));await call('GET','/appointments',401);
  const saved=JSON.parse(fs.readFileSync(dataFile,'utf8'));assert.notEqual(saved.users[0].password,'test123');assert.equal(saved.appointments[0].status,'Cancelled');
  console.log('PASS: doctors/search/details/aliases, availability, authentication, POST, conflicts, PATCH, cancellation/history, validation, ownership, logout, token expiry and disk persistence.');
 }finally{server.kill();await new Promise(resolve=>server.once('exit',resolve));fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});

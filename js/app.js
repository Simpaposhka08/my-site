(function(){
var KEY='qi_added',MK='qi_measures',view=document.getElementById('view');
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function all(){return SEED.concat(load(KEY,[]))}
function typeShort(k){for(var i=0;i<TYPES.length;i++)if(TYPES[i].k===k)return TYPES[i].s;return k}
function typeIdx(k){for(var i=0;i<TYPES.length;i++)if(TYPES[i].k===k)return i;return 0}
function dd(d){return(d<10?'0':'')+d+'.09.2026'}
function sum(a,f){return a.reduce(function(s,x){return s+f(x)},0)}
function pareto(D){var m={};D.forEach(function(d){m[d.type]=(m[d.type]||0)+d.hours});
var a=Object.keys(m).map(function(k){return{k:k,h:m[k]}}).sort(function(x,y){return y.h-x.h});var t=sum(a,function(x){return x.h});a.forEach(function(x){x.p=x.h/t*100});return a}
function line(D){var days=[],a=[],b=[],i;for(i=0;i<30;i++){a[i]=0;b[i]=0}
D.forEach(function(d){if(d.day>=1&&d.day<=30){a[d.day-1]++;b[d.day-1]+=d.reops}});
var mx=Math.max.apply(null,a.concat(b))+1,x0=36,x1=600,y0=10,y1=190;
function X(i){return x0+(x1-x0)*i/29}function Y(v){return y1-(y1-y0)*v/mx}
var h='';for(i=0;i<=mx;i+=2)h+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(i)+'" y2="'+Y(i)+'" stroke="#e1e6ee"/><text x="28" y="'+(Y(i)+4)+'" text-anchor="end" font-size="11" fill="#5d6c86">'+i+'</text>';
[1,5,10,15,20,25,30].forEach(function(d){h+='<text x="'+X(d-1)+'" y="210" text-anchor="middle" font-size="11" fill="#5d6c86">'+dd(d).slice(0,5)+'</text>'});
function P(v,c){return'<polyline fill="none" stroke="'+c+'" stroke-width="2.2" stroke-linejoin="round" points="'+v.map(function(n,i){return X(i)+','+Y(n)}).join(' ')+'"/>'}
return'<svg viewBox="0 0 620 220" width="100%" role="img" aria-label="Динамика дефектов и повторных операций за сентябрь">'+h+P(a,'#2563c9')+P(b,'#d9770a')+'</svg>'}
function bars(p){return p.map(function(x,i){return'<div class="bar'+(i===0?' top1':'')+'"><span>'+esc(typeShort(x.k))+'</span><div class="t"><i style="width:'+(x.h/p[0].h*100)+'%"></i></div><span>'+Math.round(x.h)+' ч</span></div>'}).join('')}
function topOps(D,n){var m={};D.forEach(function(d){if(!d.repeat)return;var k=d.op+'|'+d.type;m[k]=m[k]||{op:d.op,type:d.type,n:0,h:0};m[k].n++;m[k].h+=d.hours});
return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return b.n-a.n}).slice(0,n||5)}
function overview(){var D=all(),rep=D.filter(function(d){return d.repeat}).length,ro=sum(D,function(d){return d.reops}),hrs=sum(D,function(d){return d.hours}),p=pareto(D),ops=topOps(D),top=ops[0];
var meas=load(MK,{}),pend=MEASURES.filter(function(m){return(meas[m.id]||m.st)==='Проверка эффекта'});
return'<h1>Обзор качества производства</h1><div class="grid4">'+
[['Зафиксировано дефектов',D.length],['Повторные дефекты',rep],['Повторные операции',ro],['Затраты времени',Math.round(hrs)+' ч']].map(function(k){return'<div class="card kpi"><small>'+k[0]+'</small><strong>'+k[1]+'</strong></div>'}).join('')+'</div>'+
'<div class="grid2"><div class="card"><h2>Динамика дефектов и повторных операций</h2><div class="leg"><span><i style="background:#2563c9"></i>Дефекты</span><span><i style="background:#d9770a"></i>Повторные операции</span></div>'+line(D)+'</div>'+
'<div class="card"><h2>Потери времени по типам дефектов</h2>'+bars(p)+'</div></div>'+
'<div class="grid2"><div class="card"><h2>Операции с наибольшим числом повторов</h2><div class="tw"><table><thead><tr><th>Операция</th><th>Тип дефекта</th><th class="n">Повторы</th><th class="n">Потери времени</th></tr></thead><tbody>'+
ops.map(function(o){return'<tr><td><a href="#causes/'+encodeURIComponent(o.op)+'">'+esc(o.op)+'</a></td><td>'+esc(typeShort(o.type))+'</td><td class="n"><b>'+o.n+'</b></td><td class="n">'+o.h+' ч</td></tr>'}).join('')+'</tbody></table></div></div>'+
'<div class="card"><h2>Требуют внимания</h2>'+
(top?'<div class="alert"><div>Больше всего повторов на операции «'+esc(top.op)+'»<br><span class="tag r">Требует анализа</span></div><a href="#causes/'+encodeURIComponent(top.op)+'">Причины</a></div>':'')+
pend.map(function(m){return'<div class="alert"><div>Не подтверждена эффективность мероприятия № '+m.id+'<br><span class="tag o">На контроле</span></div><a href="#measures">Открыть</a></div>'}).join('')+
'</div></div><p class="note">Демонстрационные данные: записи сформированы для показа макета, а не взяты с предприятия.</p>'}
function defects(){var added=load(KEY,[]);
return'<h1>Дефекты</h1><div class="card"><h2>Зарегистрировать дефект</h2><form class="f" id="nf">'+
'<label>Деталь<input name="part" required placeholder="Например, ШП-214"></label>'+
'<label>Тип дефекта<select name="type">'+TYPES.map(function(t){return'<option>'+esc(t.k)+'</option>'}).join('')+'</select></label>'+
'<label>Операция<input name="op" required placeholder="Например, Фрезерная обработка"></label>'+
'<label>Затраты, ч<input name="hours" type="number" min="0.5" step="0.5" required value="4"></label>'+
'<label class="ck"><input name="repeat" type="checkbox">Повторный дефект</label>'+
'<button class="btn" type="submit">Зарегистрировать</button></form><p class="note" id="msg" role="status">Добавленные записи сохраняются в этом браузере.</p></div>'+
'<div class="card"><div class="row"><label>Тип<select id="ft"><option value="">Все</option>'+TYPES.map(function(t){return'<option>'+esc(t.k)+'</option>'}).join('')+'</select></label><label class="ck"><input type="checkbox" id="fr">Только повторные</label>'+(added.length?'<button class="btn" id="clr" type="button">Удалить добавленные ('+added.length+')</button>':'')+'</div><div class="tw" id="tb"></div></div>'}
function table(){var D=all().slice().reverse(),t=document.getElementById('ft').value,r=document.getElementById('fr').checked;
D=D.filter(function(d){return(!t||d.type===t)&&(!r||d.repeat)}).slice(0,40);
document.getElementById('tb').innerHTML='<table><thead><tr><th>№</th><th>Дата</th><th>Деталь</th><th>Тип дефекта</th><th>Операция</th><th class="n">Часы</th><th>Повтор</th></tr></thead><tbody>'+
(D.length?D.map(function(d){return'<tr><td>'+esc(d.id)+'</td><td>'+dd(d.day)+'</td><td>'+esc(d.part)+'</td><td>'+esc(typeShort(d.type))+'</td><td>'+esc(d.op)+'</td><td class="n">'+d.hours+'</td><td>'+(d.repeat?'<span class="tag r">да</span>':'нет')+'</td></tr>'}).join(''):'<tr><td colspan="7">Нет записей по выбранным условиям. Сбросьте фильтры.</td></tr>')+'</tbody></table>'}
function bindDefects(){table();document.getElementById('ft').onchange=table;document.getElementById('fr').onchange=table;
document.getElementById('nf').onsubmit=function(e){e.preventDefault();var f=e.target,a=load(KEY,[]),T=null,i;for(i=0;i<TYPES.length;i++)if(TYPES[i].k===f.type.value)T=TYPES[i];
a.push({id:'Д-'+(2001+a.length),day:30,type:f.type.value,area:T.a,op:f.op.value.trim(),part:f.part.value.trim(),hours:parseFloat(f.hours.value),repeat:f.repeat.checked,reops:f.repeat.checked?1:0});save(KEY,a);route();
var m=document.getElementById('msg');if(m)m.textContent='Дефект зарегистрирован.'};
var c=document.getElementById('clr');if(c)c.onclick=function(){save(KEY,[]);route()}}
function causes(op){var D=all(),rows=topOps(D,8);if(!rows.length)return'<h1>Причины дефектов</h1><div class="card">Повторных дефектов пока нет. Зарегистрируйте дефект в разделе «Дефекты».</div>';
var s=rows.filter(function(r){return r.op===op})[0]||rows[0],ti=0,i;for(i=0;i<TYPES.length;i++)if(TYPES[i].k===s.type)ti=i;
var rep=D.filter(function(d){return d.repeat}).length,cs=TCAUSES[ti].map(function(c){return CAUSES.filter(function(x){return x.code===c})[0]}),own=cs.filter(function(c){return c.g===1}).length;
return'<h1>Причины дефектов</h1><div class="card"><h2>Операция «'+esc(s.op)+'»: почему дефекты повторяются</h2><div class="sum"><div><strong>'+s.n+'</strong><br>повторов за период</div><div><strong>'+s.h+' ч</strong><br>потери времени</div><div><strong>'+Math.round(s.n/rep*100)+' %</strong><br>от всех повторных дефектов</div></div>'+
'<p>Тип дефекта: <b>'+esc(TYPES[ti].k)+'</b></p><p class="root"><b>Главная причина.</b> '+esc(WHY[TYPES[ti].k][4])+'</p>'+
'<h2>Вероятные причины</h2><div class="tw"><table><thead><tr><th>Код</th><th>Причина</th><th>Группа</th><th>Что сделать</th></tr></thead><tbody>'+cs.map(function(c){return'<tr><td class="code"><a href="#reference/'+encodeURIComponent(c.code)+'" title="Открыть в справочнике">'+c.code+'</a></td><td>'+esc(c.text)+'</td><td>'+gtag(c.g)+'</td><td>'+esc(c.meas)+'</td></tr>'}).join('')+'</tbody></table></div>'+
'<p class="note">Из '+cs.length+' причин '+own+' можно устранить на производстве (группа А). Причины — рабочие гипотезы: их подтверждают выборка извещений о несоответствии и интервью с ОТК и технологами. Код ведёт в справочник.</p></div>'+
'<div class="card"><h2>Другие операции</h2><div class="tw"><table><thead><tr><th>Операция</th><th>Тип дефекта</th><th class="n">Повторы</th><th class="n">Потери времени</th></tr></thead><tbody>'+rows.map(function(r){return'<tr'+(r===s?' class="hl"':'')+'><td><a href="#causes/'+encodeURIComponent(r.op)+'">'+esc(r.op)+'</a></td><td>'+esc(typeShort(r.type))+'</td><td class="n"><b>'+r.n+'</b></td><td class="n">'+r.h+' ч</td></tr>'}).join('')+'</tbody></table></div></div>'}
function gtag(g){var o=GROUPS[g];return'<span class="tag '+o.c+'" title="'+esc(o.t)+'">'+o.n+'</span>'}
function causeTable(f,hl){return'<table><thead><tr><th>Код</th><th>Причина</th><th>Группа</th><th>Мера / функция системы</th></tr></thead><tbody>'+CAUSES.filter(function(c){return!f||c.g==f}).map(function(c){var on=hl&&c.code===hl;return'<tr id="c-'+c.code+'"'+(on?' class="hl"':'')+'><td class="code">'+(hl!==undefined?c.code:'<a href="#reference/'+encodeURIComponent(c.code)+'" title="Открыть в справочнике">'+c.code+'</a>')+'</td><td>'+esc(c.text)+'</td><td>'+gtag(c.g)+'</td><td>'+esc(c.meas)+'</td></tr>'}).join('')+'</tbody></table>'}
function causeClass(){var n=[0,0,0,0];CAUSES.forEach(function(c){n[c.g]++});
return'<div class="card"><h2>Классификация причин по возможности контроля</h2><div class="sum">'+[1,2,3].map(function(g){return'<div><strong>'+n[g]+' из '+CAUSES.length+'</strong> <span class="note">('+Math.round(n[g]/CAUSES.length*100)+' %)</span><br>'+gtag(g)+' '+esc(GROUPS[g].t)+'</div>'}).join('')+'</div>'+
'<p class="note">Код причины: К + номер группы + номер в группе. Например, <b>К2.3</b> — группа 2 (Б), причина № 3: деформации тонкостенных деталей. Все девять причин группы А связаны с учётом дефектов, ранним контролем и обратной связью, их решает система.</p>'+
'<div class="row"><label>Группа<select id="cg"><option value="">Все</option><option value="1">А — на производстве</option><option value="2">Б — частично</option><option value="3">В — вне контроля</option></select></label></div><div class="tw" id="ct">'+causeTable('')+'</div></div>'}
function reference(code){return'<h1>Справочник</h1>'+'<div class="card"><h2>Классификатор причин дефектов</h2>'+(code?'<p class="note"><a href="#causes">← К причинам дефектов</a></p>':'')+'<div class="tw">'+causeTable('',code||'')+'</div></div>'+
'<div class="card"><h2>Типы дефектов</h2><div class="tw"><table><thead><tr><th>Код</th><th>Тип дефекта</th><th>Участок</th><th class="n">Доля случаев</th><th class="n">Н-ч на случай</th></tr></thead><tbody>'+TYPES.map(function(t,i){return'<tr><td class="code">Т'+(i+1)+'</td><td>'+esc(t.k)+'</td><td>'+esc(t.a)+'</td><td class="n">'+t.w+' %</td><td class="n">'+t.h+'</td></tr>'}).join('')+'</tbody></table></div><p class="note">Доли и трудоёмкость — отраслевые оценки, заменяются фактическими данными предприятия.</p></div>'+
'<div class="card"><h2>Условные обозначения причин</h2><div class="legend">'+[1,2,3].map(function(g){return'<span>'+gtag(g)+' '+esc(GROUPS[g].t)+'</span>'}).join('')+'</div><p class="note">Формат кода: <b>К2.3</b> = причина № 3 в группе 2 (Б). Полный перечень из 16 причин — в разделе «Причины дефектов».</p></div>'+
'<div class="card"><h2>Статусы мероприятий</h2><div class="tw"><table><tbody>'+STATUSES.map(function(s){return'<tr><td><b>'+s+'</b></td><td>'+esc(STDESC[s])+'</td></tr>'}).join('')+'</tbody></table></div></div>'+
'<div class="grid2"><div class="card"><h2>Роли пользователей</h2><table><tbody>'+ROLES.map(function(r){return'<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table></div>'+
'<div class="card"><h2>Сокращения и термины</h2><table><tbody>'+ABBR.map(function(r){return'<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td></tr>'}).join('')+'</tbody></table></div></div>'}
function measures(){var st=load(MK,{});
return'<h1>Корректирующие мероприятия</h1><div class="card"><div class="tw"><table><thead><tr><th>№</th><th>Мероприятие</th><th>Участок</th><th>Ответственный</th><th>Срок</th><th>Статус</th></tr></thead><tbody>'+
MEASURES.map(function(m){var s=st[m.id]||m.st;return'<tr><td>'+m.id+'</td><td>'+esc(m.text)+'</td><td>'+esc(m.area)+'</td><td>'+esc(m.who)+'</td><td>'+m.due+'</td><td><select data-id="'+m.id+'" aria-label="Статус мероприятия '+m.id+'">'+STATUSES.map(function(x){return'<option'+(x===s?' selected':'')+'>'+x+'</option>'}).join('')+'</select></td></tr>'}).join('')+'</tbody></table></div><p class="note">После выполнения мероприятия система сравнивает число случаев и потери времени до и после. Статусы сохраняются в этом браузере.</p></div>'}
function route(){var raw=decodeURIComponent((location.hash||'#overview').slice(1)).split('/'),h=raw[0],par=raw[1];if(!{overview:1,defects:1,causes:1,measures:1,reference:1}[h])h='overview';
view.innerHTML={overview:overview,defects:defects,causes:causes,measures:measures,reference:reference}[h](par);
Array.prototype.forEach.call(document.querySelectorAll('#nav a'),function(a){a.className=a.getAttribute('href')==='#'+h?'on':''});
if(h==='defects')bindDefects();

if(h==='measures')Array.prototype.forEach.call(view.querySelectorAll('select[data-id]'),function(s){s.onchange=function(){var o=load(MK,{});o[s.dataset.id]=s.value;save(MK,o)}})}
window.addEventListener('hashchange',function(){route();var r=location.hash.indexOf('#reference/')===0?document.querySelector('tr.hl'):null;if(r)r.scrollIntoView({block:'center'});else window.scrollTo(0,0)});try{if(location.hash)history.replaceState(null,'',location.pathname+location.search)}catch(e){}
route();
})();

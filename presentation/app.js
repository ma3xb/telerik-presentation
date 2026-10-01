/* Buildless, offline presentation engine. Progressive enhancement, no dependencies. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeGet = k => { try{return localStorage.getItem(k);}catch{return null;} };
  const safeSet = (k,v) => {try{localStorage.setItem(k,v);}catch{}};
  const params = new URLSearchParams(location.search);
  let lang = ['bg','en'].includes(params.get('lang')) ? params.get('lang') : (safeGet('strategy-language') || 'bg');
  if(!['bg','en'].includes(lang)) lang='bg';
  let index=Math.max(0,SLIDES.findIndex(s=>s.id===location.hash.slice(1)));
  let activeAnimation=null, timerInterval=null, timerState=null;
  const revealed=new Set(), quoteSelection=new Map(), pyramidSelection=new Map(), duoSelection=new Map();
  const text=v=>typeof v==='object' && v!==null ? (v[lang]??v.en??'') : (v??'');
  const t=(bg,en)=>lang==='bg'?bg:en;
  function setLanguage(value){lang=value;const url=new URL(location.href);url.searchParams.set('lang',lang);window.history.replaceState(null,'',url);render();}
  const e=v=>esc(text(v));
  const ui={overview:B('Всички слайдове','All slides'),notes:B('Бележки за лектора','Presenter notes'),full:B('Цял екран','Fullscreen'),prev:B('Предишен слайд','Previous slide'),next:B('Следващ слайд','Next slide'),close:B('Затвори','Close'),start:B('Старт','Start'),pause:B('Пауза','Pause'),resume:B('Продължи','Resume'),reset:B('Отначало','Reset'),reveal:B('Покажи вариант','Reveal an alternative'),hide:B('Скрий варианта','Hide the alternative')};
  function label(s){return e(s.kicker||CHAPTERS[s.chapter]);}
  function header(s){return `<div class="slide-header"><span class="eyebrow">${label(s)}</span><h1>${e(s.title)}</h1>${s.subtitle?`<p class="subtitle">${e(s.subtitle)}</p>`:''}</div>`;}
  function caption(s){return s.caption?`<p class="caption">${e(s.caption)}</p>`:'';}
  function items(s){return (s.items||[]).map(v=>Array.isArray(v)?v:[v]);}
  function flow(s){return `<div class="flow ${s.items.length>3?'five':''}">${items(s).map((v,i)=>`<div class="flow-item"><div class="flow-number">0${i+1}</div><h3>${e(v[0])}</h3>${v[1]?`<p>${e(v[1])}</p>`:''}</div>`).join('')}</div>`;}
  function timer(s){return `<div class="timer-panel"><div class="timer-label">${t('Време за работа','Time to work')}</div><div class="timer" role="timer" aria-label="${t('Оставащо време','Time remaining')}">${formatTime(s.minutes*60)}</div><div class="timer-controls"><button data-action="timer">${e(ui.start)}</button><button data-action="reset-timer">${e(ui.reset)}</button></div></div>`;}
  const pyramidLevels = [
    [B('Визия','Vision'),B('Какво бъдеще и защо?','What future, and why?'),B('По-доброто преживяване, към което се стремим.','The better experience we want to create.'),B('Уверен избор на обяд в кратка почивка.','Confident lunch choices in a short break.')],
    [B('Цели','Goals'),B('Как познаваме напредъка?','How do we recognise progress?'),B('Желани резултати с показател и срок.','Desired outcomes with a measure and timeframe.'),B('40% → 50% завършени поръчки за 3 месеца.','40% → 50% completed orders in 3 months.')],
    [B('План','Plan'),B('По какъв път?','Which path will we take?'),B('Последователност от избори и проверки.','A sequence of choices and validation steps.'),B('Проучваме отказите → избираме проблем → проверяваме вариант.','Investigate abandonment → choose a problem → test an approach.')],
    [B('Решения и функции','Solutions & features'),B('Какво ще създадем?','What will we create?'),B('Конкретни решения, които изпълняват плана.','Concrete solutions that put the plan into practice.'),B('Обща цена още в кошницата — вариант за проверка.','Total price in the basket — a candidate to test.')],
    [B('Задачи','Tasks'),B('Как го доставяме?','How do we deliver it?'),B('Задачи и поддръжка за реализацията.','Tasks and support needed for delivery.'),B('Прототип → тест → разработка → проследяване.','Prototype → test → build → monitor.')]
  ];
  function pyramid(s){
    const selected=pyramidSelection.get(s.id)??0, level=pyramidLevels[selected];
    return `<div class="pyramid-layout"><div class="pyramid-visual"><div class="pyramid-stack" role="group" aria-label="${t('Компоненти на UX стратегията: избери ниво','UX strategy components: choose a level')}">${[4,3,2,1,0].map(i=>`<button class="pyramid-level pyramid-level-${i} ${i===selected?'selected':''}" data-pyramid="${i}" aria-pressed="${i===selected}"><span>${e(pyramidLevels[i][0])}</span></button>`).join('')}<span class="pyramid-cut" aria-hidden="true"></span></div><div class="pyramid-key"><span>${t('Изпълнение','Execution')}</span><b>${t('UX стратегия','UX strategy')}</b></div></div><div class="pyramid-detail" aria-live="polite"><span class="eyebrow">${selected<3?t('UX СТРАТЕГИЯ','UX STRATEGY'):t('ИЗПЪЛНЕНИЕ','EXECUTION')} · 0${selected+1}</span><h2>${e(level[1])}</h2><p>${e(level[2])}</p><div class="pyramid-example"><small>${t('КАЗУСЪТ С ОБЯДА','THE LUNCH CASE')}</small><p>${e(level[3])}</p></div></div></div><p class="caption">${t('Избери ниво · чети от основата нагоре · адаптация по схемата на NN/g','Choose a level · read from the base upward · adapted from NN/g’s diagram')}</p>`;
  }
  function duoHeader(s){const n=SLIDES.filter(x=>x.type.startsWith('duo-')).findIndex(x=>x.id===s.id)+1;return `<div class="duo-series-label"><span>DUOLINGO</span><span>${String(n).padStart(2,'0')} / 09</span></div>`;}
  function duoReveal(s,content){const show=revealed.has(s.id);return `<button class="duo-reveal" data-action="duo-reveal" aria-expanded="${show}" aria-controls="duo-answer">${show?t('Скрий обяснението','Hide explanation'):t('Разкрий обяснението','Reveal explanation')} <span aria-hidden="true">${show?'−':'+'}</span></button><div class="duo-answer" id="duo-answer" aria-live="polite">${show?content:`<p class="duo-pending">${t('Първо — вашето предположение.','First — your hypothesis.')}</p>`}</div>`;}
  function duoOptions(s){const chosen=duoSelection.get(s.id);return `<div class="duo-options" role="group" aria-label="${e(s.question)}">${s.options.map((o,i)=>`<button data-duo-choice="${i}" aria-pressed="${chosen===i}" class="${chosen===i?'chosen':''}"><span>${String.fromCharCode(65+i)}</span>${e(o)}</button>`).join('')}</div><div class="duo-feedback" aria-live="polite">${chosen===undefined?`<p>${t('Изберете отговор и обсъдете причината.','Choose an answer and discuss why.')}</p>`:`<b>${s.correct!==undefined?(chosen===s.correct?t('Точно така.','That’s right.'):t('Нека разграничим.','Let’s distinguish.')):t('Какво означава този избор?','What does this choice mean?')}</b><p>${e(s.feedback[chosen])}</p><button class="text-button" data-action="duo-reset">${t('Нов опит','Try again')} ↺</button>`}</div>`;}
  function duo(s){
    let content='';
    if(s.type==='duo-intro')content=`<div class="duo-opening"><div><h1>${e(s.title)}</h1><p class="subtitle">${e(s.subtitle)}</p><div class="duo-model"><span>Freemium<small>${t('Безплатно ползване + платени предимства','Free use + paid benefits')}</small></span><span>D2C<small>${t('Директно към крайния потребител','Direct to the end consumer')}</small></span></div></div><div class="duo-brand"><img src="assets/duolingo/brand.png" alt="Duolingo"><span class="duo-scribble">${t('Уча. Връщам се.','Learn. Return.')}</span></div></div><div class="duo-journey">${['Awareness','Conversion','Engagement','Retention','Churn'].map((v,i)=>`<button data-duo-target="duolingo-${v.toLowerCase()}"><small>0${i+1}</small>${v}<span>↗</span></button>`).join('')}</div>`;
    if(s.type==='duo-metric')content=`<div class="duo-study"><figure class="duo-source"><img src="${esc(s.asset)}" alt="${e(s.alt)}"><figcaption>${t('Архивен пример · предоставена презентация','Archive example · supplied presentation')}</figcaption></figure><div class="duo-reading"><span class="duo-term">${esc(s.term)}</span><h1>${e(s.title)}</h1><p class="duo-mechanism">${e(s.mechanism)}</p><p class="duo-question">${e(s.question)}</p>${duoReveal(s,`<p class="duo-definition">${e(s.definition)}</p><div class="duo-measure"><small>${t('ВЪЗМОЖЕН ПОКАЗАТЕЛ','POSSIBLE MEASURE')}</small><p>${e(s.measure)}</p></div><p class="duo-caution">${e(s.caution)}</p>`)}</div></div>`;
    if(s.type==='duo-check')content=`${header(s)}<div class="duo-check-layout"><div class="duo-cohort" role="img" aria-label="${t('30 от 100 учащи правят урок на ден 7','30 of 100 learners complete a lesson on day 7')}"><strong>30<span>/100</span></strong><div>${Array.from({length:100},(_,i)=>`<i class="${i<30?'active':''}"></i>`).join('')}</div><small>${t('УЧЕБНА КОХОРТА · ДЕН 7','TEACHING COHORT · DAY 7')}</small></div><div><h2 class="duo-choice-question">${e(s.question)}</h2>${duoOptions(s)}</div></div>`;
    if(s.type==='duo-tradeoff')content=`${header(s)}<div class="duo-tradeoff-layout"><div class="duo-notifications" aria-hidden="true"><div>+1 ${t('напомняне','reminder')}</div><div>+2 ${t('напомняния','reminders')}</div><div>+3 ${t('напомняния','reminders')}</div><span class="duo-scribble">${t('Навик или натиск?','Habit or pressure?')}</span></div><div><h2 class="duo-choice-question">${e(s.question)}</h2>${duoOptions(s)}</div></div>`;
    if(s.type==='duo-bridge')content=`${header(s)}<p class="duo-bridge-question">${e(s.question)}</p>${duoReveal(s,`<div class="duo-bridge-flow">${[[B('Механизъм','Mechanism'),'Streak'],[B('Поведение','Behaviour'),B('Редовно учене','Regular learning')],[B('Показател','Metric'),'Day-7 retention'],[B('Желан резултат','Desired outcome'),B('Устойчиво учене','Sustained learning')]].map((v,i)=>`<div><small>0${i+1} · ${e(v[0])}</small><h3>${e(v[1])}</h3></div>`).join('')}</div><p class="duo-caution">${t('Учебна интерпретация · функцията има смисъл, когато подкрепя нужда и цел.','Teaching interpretation · a feature matters when it supports a need and a goal.')}</p>`)}<p class="duo-return">${t('Следва: какво се опитва да постигне човекът?','Next: what is the person trying to achieve?')}</p>`;
    return `<div class="slide-inner duo-inner">${duoHeader(s)}${content}${caption(s)}</div>`;
  }

  function template(s){
    if(s.type.startsWith('duo-'))return duo(s);
    let body='';
    switch(s.type){
      case 'cover':return `<img class="cover-art" src="assets/cover.png" alt="${t('Път от хартия свързва зелено кълбо, лилава арка и син куб','A paper path connects a green sphere, a purple arch and a blue cube')}"><div class="cover-shade"></div><div class="slide-inner"><div class="cover-content"><span class="eyebrow">UI / UX DESIGN · TELERIK ACADEMY</span><h1 class="cover-title">${e(s.title)}</h1><p class="cover-subtitle">${e(s.subtitle)}</p><p class="cover-caption">${e(s.caption)}</p><div class="cover-meta">${e(s.meta)}</div></div></div>`;
      case 'lecturer':return `<div class="slide-inner"><div class="lecturer-layout"><div class="lecturer-copy"><span class="eyebrow">${e(s.kicker)}</span><h1>${e(s.title)}</h1><p class="lecturer-role">${e(s.role)}</p><div class="lecturer-background"><span class="eyebrow">${t('Опит и професионален път','Experience & background')} · 2016–2026</span><p>${e(s.background)}</p></div></div><div class="lecturer-portrait"><img src="${esc(s.photo)}" alt="${e(s.photoLabel)}"><i aria-hidden="true">↗</i></div></div></div>`;
      case 'roadmap':body=`<div class="roadmap">${s.items.map((v,i)=>`<div class="roadmap-item"><div class="roadmap-num">${i===3?'+AI':`0${i+1}`}</div><h3>${e(v)}</h3><small class="roadmap-time">${esc(s.times[i])}</small><small>${i===3?'25':'40'} ${t('минути','minutes')}</small></div>`).join('')}</div>`;break;
      case 'case':return `<div class="slide-inner"><div class="split"><div class="case-copy">${header(s)}<div class="question-lines">${s.items.map(v=>`<span>${e(v)}</span>`).join('')}</div>${caption(s)}</div><div class="receipt"><div class="receipt-top"><span>LUNCH / 001</span><span>↗</span></div><div class="receipt-time">12:30</div><div class="receipt-label">${t('Време за обяд','Time for lunch')}</div><div class="receipt-row"><span>${t('Обяд','Lunch')}</span><span>€9.00</span></div><div class="receipt-row"><span>${t('Доставка + такси','Delivery + fees')}</span><span>€4.00</span></div><div class="receipt-row receipt-total"><span>${t('Общо','Total')}</span><span>€13.00</span></div><div class="receipt-footer">${t('Да поръчам ли?','Should I order?')}</div><span class="stamp">${t('БЮДЖЕТ: €11','BUDGET: €11')}</span></div></div></div>`;
      case 'story':return `<div class="slide-inner"><div class="story-layout"><div class="story-copy"><span class="eyebrow">${label(s)}</span><div class="story-index">${s.chapter===4?'AI':`0${s.chapter}`}</div><h1>${e(s.title)}</h1><p class="subtitle">${e(s.subtitle)}</p></div><div class="story-art-wrap"><img class="story-art" src="assets/${esc(s.art)}.png" alt="${e(s.alt)}"><span class="comic-label">${e(s.bubble)}</span></div></div><div class="story-beats">${s.items.map((v,i)=>`<span><b>0${i+1}</b>${e(v)}</span>`).join('')}</div></div>`;
      case 'flow':body=flow(s);break;
      case 'venn':body=`<div class="split"><p class="definition">${e(s.statement)}<small>${e(s.detail)}</small></p><div class="venn-wrap" role="img" aria-label="${t('Пресечна точка на бизнес, хора и технологии','Intersection of business, people and technology')}"><div class="venn v1">${t('Бизнес','Business')}</div><div class="venn v2">${t('Хора','People')}</div><div class="venn v3">${t('Технологии','Technology')}</div><div class="venn-center">UX</div></div></div>`;break;
      case 'metric':body=`<div class="metric-row"><div><div class="metric-number">40%</div><div class="metric-label">${t('НАЧАЛНА СТОЙНОСТ','BASELINE')}</div></div><span class="metric-arrow">→</span><div><div class="metric-number target">50%</div><div class="metric-label">${t('ЦЕЛЕВА СТОЙНОСТ','TARGET')}</div></div></div><div class="metric-facts">${items(s).map(v=>`<span><b>${e(v[0])}</b>${e(v[1])}</span>`).join('')}</div>`;break;
      case 'waffle':body=`<div class="split"><div><div class="stat-value">${s.value}%</div><p class="formula">${e(s.formula)}</p><p class="stat-note">${e(s.detail)}</p></div><div class="waffle ${s.round?'round':''}" role="img" aria-label="${s.value} ${t('от 100','out of 100')}">${Array.from({length:100},(_,i)=>`<i class="${i<s.value?'filled':''}"></i>`).join('')}</div></div>`;break;
      case 'compare':{
        const show=!s.reveal||revealed.has(s.id);
        body=`<div class="comparison"><div class="comparison-side ${s.strike?'bad':''}"><small>${e(s.labels[0])}</small><p>${e(s.left)}</p>${s.leftNote?`<em>${e(s.leftNote)}</em>`:''}</div><div class="comparison-side good"><small>${e(s.labels[1])}</small>${show?`<div class="${s.reveal?'is-revealed':''}"><p>${e(s.right)}</p>${s.rightNote?`<em>${e(s.rightNote)}</em>`:''}</div>`:`<div class="answer-placeholder">?</div>`}${s.reveal?`<button class="reveal-button" data-action="reveal" aria-expanded="${show}">${e(show?ui.hide:ui.reveal)} <span>↗</span></button>`:''}</div></div>`;break;}
      case 'list':body=`<ol class="editorial-list">${items(s).map((v,i)=>`<li><span class="index">0${i+1}</span><div class="item-text">${e(v[0])}${v[1]?`<small>${e(v[1])}</small>`:''}</div></li>`).join('')}</ol>`;break;
      case 'question':body=`<div class="question-grid">${s.items.map((v,i)=>`<div class="question"><small>0${i+1}</small><p>${e(v)}</p></div>`).join('')}</div>`;break;
      case 'exercise':return `<div class="slide-inner"><div class="exercise-task">${header(s)}<p class="exercise-description">${e(s.description)}</p><div class="exercise-rule" aria-hidden="true"></div></div></div>`;
      case 'strategy-map':body=pyramid(s);break;
      case 'canvas':body=`<div class="strategy-canvas">${s.items.map((v,i)=>`<div class="canvas-field"><span>0${i+1}</span><h3>${e(v[0])}</h3><p>${e(v[1])}</p></div>`).join('')}</div>`;break;
      case 'break':return `<div class="slide-inner"><div class="break-layout"><div>${header(s)}${caption(s)}</div>${timer(s)}</div></div>`;
      case 'methods':body=`<div class="method-map">${s.items.map(v=>`<div class="method-cell"><small>${e(v[0])}</small><h3>${e(v[1])}</h3><p>${e(v[2])}</p></div>`).join('')}</div>`;break;
      case 'survey':body=`<div class="survey-chart" role="img" aria-label="${t('Резултати от учебна анкета с 30 отговора','Fictional survey results from 30 respondents')}">${s.items.map(v=>`<div class="survey-row"><span>${e(v[0])}</span><div class="survey-bar-track"><div class="survey-bar" style="width:${v[1]/8*100}%"></div></div><b>${v[1]}</b></div>`).join('')}</div><div class="survey-summary"><strong>12 / 30</strong><span>${e(s.detail)}</span></div>`;break;
      case 'matrix':body=`<table class="data-table"><thead><tr>${s.columns.map(v=>`<th scope="col">${e(v)}</th>`).join('')}</tr></thead><tbody>${s.rows.map(row=>`<tr>${row.map((v,i)=>i===0?`<th scope="row">${e(v)}</th>`:`<td>${e(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;break;
      case 'quotes':{const q=quoteSelection.get(s.id)||0;body=`<div class="quote-layout"><div class="quote-mark" aria-hidden="true">“</div><blockquote class="quote-text" style="margin:0">${e(s.quotes[q][1])}</blockquote><div class="quote-byline">${e(s.quotes[q][0])}</div><div class="quote-tabs" role="group" aria-label="${t('Избери откъс от интервю','Choose interview excerpt')}">${s.quotes.map((v,i)=>`<button data-quote="${i}" aria-pressed="${i===q}">I${i+1}<span>${e(v[2])}</span></button>`).join('')}</div></div>`;break;}
      case 'statement':body=`<p class="value-statement">${s.parts.map((v,i)=>i%2?`<mark>${e(v)}</mark>`:e(v)).join(' ')}</p>`;break;
      case 'tools':body=`<div class="tool-list">${s.items.map((v,i)=>`<div class="tool"><span class="tool-number">0${i+1}</span><h3>${e(v[0])}</h3><p>${e(v[1])}</p><small>${e(v[2])}</small></div>`).join('')}</div>`;break;
      case 'demo':body=`<div class="demo-sheet">${s.items.map(v=>`<p>${e(v)}</p>`).join('')}<div class="demo-tags">I1–I4 · S1 · A1 · C-A · C-B</div></div><button class="text-button" data-action="copy-prompt">${t('Копирай задачата + учебните данни','Copy prompt + teaching data')} <span>↗</span></button>`;break;
      case 'summary':body=`<div class="summary-path">${s.items.map((v,i)=>`<div class="summary-step"><b>0${i+1}</b><h3>${e(v[0])}</h3><p>${e(v[1])}</p></div>`).join('')}</div>`;break;
      case 'finish':return `<div class="slide-inner"><span class="eyebrow">TELERIK ACADEMY · UI / UX DESIGN</span><h1 class="finish-title">${e(s.title)}</h1><p class="finish-line">${e(s.subtitle)}</p><div class="finish-meta">${e(s.caption)}</div></div>`;
      default:body='';
    }
    return `<div class="slide-inner">${header(s)}<div class="content">${body}</div>${caption(s)}</div>`;
  }
  function formatTime(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
  function updateTimer(){
    if(!timerState)return;
    let left=timerState.running?Math.max(0,Math.ceil((timerState.end-Date.now())/1000)):timerState.remaining;
    if(left===0 && timerState.running){timerState.running=false;timerState.remaining=0;clearInterval(timerInterval);$('#announcer').textContent=t('Времето изтече','Time is up');}
    const el=$('.timer');if(el){el.textContent=formatTime(left);el.classList.toggle('finished',left===0);}
    const button=$('[data-action="timer"]');if(button)button.textContent=text(timerState.running?ui.pause:(left===SLIDES[index].minutes*60?ui.start:ui.resume));
  }
  function toggleTimer(){const s=SLIDES[index];if(!s.minutes)return;if(!timerState||timerState.id!==s.id)timerState={id:s.id,remaining:s.minutes*60,running:false};if(timerState.running){timerState.remaining=Math.max(0,Math.ceil((timerState.end-Date.now())/1000));timerState.running=false;clearInterval(timerInterval);}else{if(timerState.remaining===0)timerState.remaining=s.minutes*60;timerState.end=Date.now()+timerState.remaining*1000;timerState.running=true;timerInterval=setInterval(updateTimer,250);}updateTimer();}
  function resetTimer(){clearInterval(timerInterval);timerState={id:SLIDES[index].id,remaining:SLIDES[index].minutes*60,running:false};updateTimer();}
  function render(){
    const s=SLIDES[index];document.documentElement.lang=lang;document.title=`${text(s.title)} — Strategy · Telerik Academy`;
    const stage=$('#slide');stage.className=`slide type-${s.type} animate-in`;stage.innerHTML=template(s);stage.scrollTop=0;stage.setAttribute('aria-label',`${index+1}. ${text(s.title)}`);
    $('#chapter-label').textContent=text(CHAPTERS[s.chapter]);$('#slide-count').innerHTML=`<b>${String(index+1).padStart(2,'0')}</b> / ${SLIDES.length}`;
    $('#prev').disabled=index===0;$('#next').disabled=index===SLIDES.length-1;$('#progress-fill').style.width=`${(index+1)/SLIDES.length*100}%`;
    $('#navigation-hint').innerHTML=t('<kbd>←</kbd> <kbd>→</kbd> навигация <span>·</span> <kbd>O</kbd> всички слайдове','<kbd>←</kbd> <kbd>→</kbd> navigate <span>·</span> <kbd>O</kbd> slide overview');
    document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
    [['overview-button','overview','O'],['notes-button','notes','N'],['fullscreen-button','full','F'],['prev','prev','←'],['next','next','→']].forEach(([id,key,shortcut])=>{const el=$('#'+id);el.setAttribute('aria-label',text(ui[key]));el.title=`${text(ui[key])} · ${shortcut}`;});
    $('.wordmark').setAttribute('aria-label',t('Първи слайд','First slide'));
    document.querySelectorAll('.close-button').forEach(b=>b.setAttribute('aria-label',text(ui.close)));
    $('#blackout button').setAttribute('aria-label',t('Върни презентацията','Return to presentation'));
    $('#announcer').textContent=`${index+1} / ${SLIDES.length}. ${text(s.title)}`;
    safeSet('strategy-language',lang);
    if(timerState?.id===s.id)updateTimer();
  }
  function go(next,{history=true,animate=true}={}){
    const n=Math.max(0,Math.min(SLIDES.length-1,next));if(n===index)return;
    if(timerState){clearInterval(timerInterval);timerState=null;}
    const travel=n>index?45:-45;
    activeAnimation?.cancel();
    index=n;
    render();
    if(history)window.history.replaceState(null,'',`#${SLIDES[index].id}`);
    if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      activeAnimation=$('#slide').animate([{opacity:0,transform:`translateX(${travel}px)`},{opacity:1,transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
    }
  }
  function overview(){
    $('#overview-title').textContent=text(ui.overview);$('#overview-kicker').textContent=t('Карта на лекцията','Lecture map');
    $('#overview-content').innerHTML=CHAPTERS.map((c,chapter)=>`<h3 class="overview-chapter">${e(c)}</h3><div class="overview-grid">${SLIDES.map((s,i)=>s.chapter===chapter?`<button class="overview-slide" data-slide="${i}" aria-current="${i===index}"><small>${String(i+1).padStart(2,'0')} · ${s.type==='exercise'?t('УПРАЖНЕНИЕ','EXERCISE'):s.type==='story'?t('ИСТОРИЯ','STORY'):e(c)}</small>${e(s.title)}</button>`:'').join('')}</div>`).join('');
    $('#overview-dialog').showModal();$('#overview-content [aria-current="true"]')?.scrollIntoView({block:'center'});
  }
  function notes(){const s=SLIDES[index];$('#notes-label').textContent=text(ui.notes);$('#notes-title').textContent=text(s.title);$('#notes-content').innerHTML=`<div class="notes-notice">${t('Бележките се отварят на този екран.','Notes open on this screen.')}</div><p>${e(s.notes)}</p>${s.source?`<p class="notes-source">${t('Източник','Source')}: <a href="${esc(s.source)}" target="_blank" rel="noopener noreferrer">${esc(s.source)}</a></p>`:''}<p class="notes-source">${t('Пълният сценарий','The full Bulgarian script')}: <a href="speaker-script-bg.md" target="_blank">program.md</a></p>`;$('#notes-dialog').showModal();}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#announcer').textContent=t('Използвайте режима за цял екран на браузъра.','Use the browser’s fullscreen mode.');}}
  async function copyPrompt(button){const value=typeof DEMO_PROMPT!=='undefined'?text(DEMO_PROMPT):'';try{await navigator.clipboard.writeText(value);button.textContent=t('Копирано ✓','Copied ✓');}catch{const area=document.createElement('textarea');area.value=value;area.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();button.textContent=ok?t('Копирано ✓','Copied ✓'):t('Виж задачата в бележките','See the prompt in notes');}}
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.lang){setLanguage(button.dataset.lang);return;}
    if(button.dataset.slide!==undefined){$('#overview-dialog').close();go(Number(button.dataset.slide));return;}
    if(button.dataset.quote!==undefined){quoteSelection.set(SLIDES[index].id,Number(button.dataset.quote));render();$(`[data-quote="${button.dataset.quote}"]`)?.focus();return;}
    if(button.dataset.pyramid!==undefined){pyramidSelection.set(SLIDES[index].id,Number(button.dataset.pyramid));render();$(`[data-pyramid="${button.dataset.pyramid}"]`)?.focus();return;}
    if(button.dataset.duoTarget){go(SLIDES.findIndex(s=>s.id===button.dataset.duoTarget));return;}
    if(button.dataset.duoChoice!==undefined){duoSelection.set(SLIDES[index].id,Number(button.dataset.duoChoice));render();$(`[data-duo-choice="${button.dataset.duoChoice}"]`)?.focus();return;}
    if(button.dataset.action==='duo-reveal'){const id=SLIDES[index].id;revealed.has(id)?revealed.delete(id):revealed.add(id);render();$('[data-action="duo-reveal"]')?.focus();return;}
    if(button.dataset.action==='duo-reset'){duoSelection.delete(SLIDES[index].id);render();$('[data-duo-choice="0"]')?.focus();return;}
    switch(button.dataset.action){case'home':go(0);break;case'prev':go(index-1);break;case'next':go(index+1);break;case'overview':overview();break;case'notes':notes();break;case'fullscreen':fullscreen();break;case'close':button.closest('dialog').close();break;case'timer':toggleTimer();break;case'reset-timer':resetTimer();break;case'reveal':{const id=SLIDES[index].id;revealed.has(id)?revealed.delete(id):revealed.add(id);render();$('[data-action="reveal"]')?.focus();break;}case'copy-prompt':copyPrompt(button);break;case'unblank':$('#blackout').hidden=true;break;}
  });
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
    if(!$('#blackout').hidden){$('#blackout').hidden=true;event.preventDefault();return;}
    if($('dialog[open]'))return;
    if(event.target.closest('button,a')&&(event.key===' '||event.key==='Enter'))return;
    const key=event.key.toLowerCase();
    if(['arrowright','arrowdown','pagedown',' '].includes(key)){event.preventDefault();go(index+1);}else if(['arrowleft','arrowup','pageup'].includes(key)){event.preventDefault();go(index-1);}else if(key==='home'){event.preventDefault();go(0);}else if(key==='end'){event.preventDefault();go(SLIDES.length-1);}else if(key==='o'){overview();}else if(key==='n'){notes();}else if(key==='f'){fullscreen();}else if(key==='b'){event.preventDefault();$('#blackout').hidden=false;}else if(key==='l'){setLanguage(lang==='bg'?'en':'bg');}
  });
  let touch=null;
  $('#slide').addEventListener('touchstart',e=>{if(e.target.closest('button,a'))return;touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  $('#slide').addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.8)go(index+(dx<0?1:-1));touch=null;},{passive:true});
  window.addEventListener('hashchange',()=>{const n=SLIDES.findIndex(s=>s.id===location.hash.slice(1));if(n>=0)go(n,{history:false});});
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  render();
})();

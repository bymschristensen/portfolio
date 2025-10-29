if (window.__PORTFOLIO_MAIN__) { console.warn("[BOOT] main already loaded — skipping."); } else { window.__PORTFOLIO_MAIN__ = true; (function MAIN(){ 
window.__PORTFOLIO_MAIN__ = true;
console.info('[BOOT] portfolio main.js loaded. src:',(document.currentScript&&document.currentScript.src)||'(inline)');
!function(){if(["portfolio-13-ec6f18.webflow.io"].includes(location.hostname)){var K="gh:portfolio:main:sha",TTL=15000;try{var now=Date.now(),cached=null;try{cached=JSON.parse(sessionStorage.getItem(K)||"null")}catch{}if(cached&&cached.sha&&now-(cached.t||0)<TTL){console.info("[BOOT] latest main commit (cached):",cached.sha,cached.dateJST||cached.dateUTC||"");return}var ctrl=new AbortController,tm=setTimeout(function(){try{ctrl.abort()}catch{}},3000);fetch("https://api.github.com/repos/bymschristensen/portfolio/commits/main",{signal:ctrl.signal,cache:"no-store",headers:{Accept:"application/vnd.github+json"}}).then(function(r){return r.ok?r.json():Promise.reject(r)}).then(function(data){var item=Array.isArray(data)?data[0]:data,sha=(item&&item.sha?item.sha:"").slice(0,7),utc=(item&&item.commit&&item.commit.author&&item.commit.author.date)||"";if(!sha)return;var d=utc?new Date(utc):null;var jst=d?new Intl.DateTimeFormat("ja-JP-u-ca-gregory",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1,timeZone:"Asia/Tokyo"}).format(d)+" JST":"";var save={sha:sha,dateUTC:utc,dateJST:jst,t:Date.now()};try{sessionStorage.setItem(K,JSON.stringify(save))}catch{}console.info("[BOOT] latest main commit:",sha,jst||utc)}).catch(function(){}).finally(function(){clearTimeout(tm)})}catch{}}}();

// GSAP
	try{if(window.gsap&&gsap.registerPlugin){var _p=[];typeof window.ScrollTrigger!=="undefined"&&_p.push(window.ScrollTrigger);typeof window.Flip!=="undefined"&&_p.push(window.Flip);typeof window.SplitText!=="undefined"&&_p.push(window.SplitText);typeof window.TextPlugin!=="undefined"&&_p.push(window.TextPlugin);typeof window.Observer!=="undefined"&&_p.push(window.Observer);gsap.registerPlugin.apply(gsap,_p)}}catch(e){}
	window.DEBUG = typeof window.DEBUG!="undefined" ? window.DEBUG : true;

// Navigation Manager Test
	window.NavigationManager = (function () {
		const state = {
			debug: false,
			installed: false,
			linkProbeInstalled: false,
			locks: new Set(),
			clickHandler: null,
		};
	
		function dlog(...args) { if (state.debug) console.debug('[Nav]', ...args); }
		function isInternalAnchor(t){if(t.defaultPrevented||0!==t.button||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return null;const e=t.target&&("A"===t.target.tagName?t.target:t.target.closest?.("a"));if(!e)return null;if(e.hasAttribute("download")||"_blank"===e.target||"external"===e.getAttribute("rel"))return null;if(e.closest('[data-router-ignore="true"], .w-lightbox'))return null;const r=e.getAttribute("href")||e.href||"";if(!r)return null;let n;try{n=new URL(r,location.href)}catch{return null}const l=n.pathname.replace(/\/+$/,"")===location.pathname.replace(/\/+$/,"");return n.origin!==location.origin||l&&n.hash?null:{a:e,url:n}}
		function installLinkInterceptor(){if(state.installed)return;state.clickHandler=e=>{if(e.defaultPrevented)return;const n=document.querySelector('[data-barba="container"]')?.dataset?.barbaNamespace||"";if(n==="info"&&e.target?.closest('a[id^="recommendationsOpen"]'))return;if(e.target?.closest('.nav-button-menu,.nav-button-filter,.nav-button-close-case,[data-router-ignore="true"]'))return;const t=isInternalAnchor(e);if(!t)return;if(n!=="archive"&&n!=="resources"){const r=t.a.closest("[data-barba-prevent]");if(r&&r.getAttribute("data-barba-prevent")==="true")return}if(state.locks.size){dlog("blocked by lock(s):",[...state.locks]);e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return}e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();console.info("[intercept→barba]",t.url.href,"locks:",[...state.locks]);window.barba?.go?barba.go(t.url.href):location.href=t.url.href};addEventListener("pointerdown",state.clickHandler,{capture:!0});addEventListener("click",state.clickHandler,{capture:!0});state.installed=!0;dlog("link interceptor installed")}
		function installNavLock(){dlog("nav lock ready (use NavigationManager.setLock(label, true/false))")}
		function setLock(t,c){t&&(c?state.locks.add(t):state.locks.delete(t),dlog(c?"lock +":"lock -",t,"| active:",[...state.locks]))}
		function isLocked() { return state.locks.size > 0; }
		function reason() { return [...state.locks]; }
		function init({debug:i=!1}={}){state.debug=!!i,dlog("init")}
		function attachMenuLocks(e=document){e.querySelectorAll(".nav-primary-wrap").forEach((e=>{const a=e._menuTimeline,n=e._filterTimeline,o=(e,a)=>{e&&!e.__navLockHooked&&(e.__navLockHooked=!0,e.eventCallback("onStart",(()=>NavigationManager.setLock(a,!0))),e.eventCallback("onReverse",(()=>NavigationManager.setLock(a,!1))),e.eventCallback("onComplete",(()=>NavigationManager.setLock(a,!1))),e.eventCallback("onReverseComplete",(()=>NavigationManager.setLock(a,!1))))};o(a,"menu"),o(n,"filter")}))}
	
		return {
			init,
			installLinkInterceptor,
			installNavLock,
			setLock,
			isLocked,
			reason,
			attachMenuLocks,
			ensureBarbaClickRouting: installLinkInterceptor,
		};
	})();

// Webflow Adapter
	window.WebflowAdapter = (function () {
		function reset({next:t}){try{if(!t||!t.html)return;const e=(new DOMParser).parseFromString(t.html,"text/html"),a=e.querySelector("html")?.getAttribute("data-wf-page")||null;a?document.documentElement.setAttribute("data-wf-page",a):document.documentElement.removeAttribute("data-wf-page");const r=e.querySelector("script[data-wf-site-data]")?.textContent||null;if(document.querySelectorAll("script[data-wf-site-data]").forEach((t=>{try{t.remove()}catch{}})),r){const t=document.createElement("script");t.type="application/json",t.setAttribute("data-wf-site-data",""),t.textContent=r,document.head.appendChild(t)}if(window.Webflow){try{window.Webflow.destroy?.()}catch{}try{window.Webflow.ready?.()}catch{}try{const t=window.Webflow.require?.("ix2");t?.init?.()}catch{}}}catch(t){console.warn("[WebflowAdapter.reset] failed:",t)}}
		function reinit(){if(window.Webflow&&Webflow.require){try{Webflow.ready&&Webflow.ready()}catch(e){}try{const e=Webflow.require("tabs");e?.ready&&e.ready()}catch(e){}try{const e=Webflow.require("slider");e?.ready&&e.ready()}catch(e){}}}
		function reparent(e=document){e.querySelectorAll("[data-child]").forEach((t=>{if(t.matches(".w-tab-link, .w-tab-pane"))return;const a=t.getAttribute("data-child");let r=e.querySelector(`[data-parent="${a}"]`);r||e===document||(r=document.querySelector(`[data-parent="${a}"]`)),r&&t.parentNode!==r&&r.appendChild(t)}))}
		return {
			reset,
			reinit,
			reparent,
		};
	})();

// Core Utilities
	window.CoreUtilities = (function () {
		const state={gsapObservers:[],domObservers:[],tickers:[],cursorDestroy:null};
		const Observers={addGsap:e=>(e&&state.gsapObservers.push(e),e),addDom:e=>(e&&state.domObservers.push(e),e),addTicker:e=>(window.gsap&&"function"==typeof e&&(gsap.ticker.add(e),state.tickers.push(e)),e),clearAll:function(t){t=t||{};var e=!!t.preserveServicePins;try{window.ScrollTrigger&&ScrollTrigger.getAll().forEach((s=>{e&&s.trigger?.classList?.contains("section-single-service")||s.kill()}))}catch{}try{state.gsapObservers.forEach((e=>{try{e.kill&&e.kill()}catch{}}))}catch{}state.gsapObservers=[];try{state.tickers.forEach((e=>{try{gsap.ticker.remove(e)}catch{}}))}catch{}state.tickers=[];try{state.domObservers.forEach((e=>{try{e.disconnect&&e.disconnect()}catch{}}))}catch{}state.domObservers=[]}};
		const Cursor={setDestroy(t){state.cursorDestroy="function"==typeof t?t:null},destroy(){try{state.cursorDestroy&&state.cursorDestroy()}catch{}finally{state.cursorDestroy=null}}};
		function nukeCursorDom(){try{document.querySelectorAll(".cursor-webgl, .custom-cursor").forEach((r=>{try{r.remove()}catch{}}))}catch{}}
		async function doubleRAF(){await new Promise((e=>requestAnimationFrame(e))),await new Promise((e=>requestAnimationFrame(e)))}
		const InitManager={run:async function(r,o){r=r||document,o=o||{};var e=!!o.preserveServicePins;Observers.clearAll({preserveServicePins:e}),Cursor.destroy(),nukeCursorDom(),"function"==typeof window.initAllYourInits&&window.initAllYourInits(r),await doubleRAF(),await doubleRAF();try{window.ScrollTrigger&&ScrollTrigger.refresh()}catch{}},cleanup:function(o){o=o||{};var e=!!o.preserveServicePins;Observers.clearAll({preserveServicePins:e}),Cursor.destroy(),nukeCursorDom()}};
		const Fonts={async ready(){try{await(document.fonts?.ready||Promise.resolve())}catch{}}};
		const Text={
			splitAndMask:e=>{if(!e)return null;if(e._originalHTML||(e._originalHTML=e.innerHTML),e._split)return e._split;if(!window.SplitText){gsap.set(e,{autoAlpha:1,clearProps:"yPercent,rotation,willChange"});const t={lines:[e],revert(){}};return e._split=t,t}const s=getComputedStyle(e),w=s.whiteSpace||"normal",d=getComputedStyle(e).display,p=e.style.whiteSpace,b=e.style.display,y=d==="inline";y&&(e.style.display="block");e.style.whiteSpace=w;void e.offsetWidth;const i=new SplitText(e,{type:"lines",linesClass:"split-line",reduceWhiteSpace:!1}),m=[];i.lines.forEach(l=>{const h=l.getBoundingClientRect().height||l.offsetHeight||0,c=document.createElement("div");c.className="text-mask",c.style.cssText="overflow:hidden;display:block;height:"+h+"px",l.style.whiteSpace=w,l.style.display="block",l.parentNode.insertBefore(c,l),c.appendChild(l),m.push(c)}),gsap.set(i.lines,{yPercent:100,rotation:10,transformOrigin:"0 10%",willChange:"transform,opacity"}),e.style.whiteSpace=p,e.style.display=b;const r=i.revert?i.revert.bind(i):function(){};return i.revert=function(){try{m.forEach(a=>{const n=a.firstChild;n&&a.parentNode.insertBefore(n,a),a.remove()})}catch{}try{r()}catch{}try{e.style.whiteSpace=p,e.style.display=b}catch{}},e._split=i,i},
			safelyRevertSplit:(e,t)=>{if(e&&t){try{e.revert&&e.revert()}catch{}t._originalHTML&&(t.innerHTML=t._originalHTML),delete t._split,delete t._originalHTML}},
			animateLines:e=>gsap.to(e,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08})};
		
		window.splitAndMask||(window.splitAndMask=Text.splitAndMask);
		window.safelyRevertSplit||(window.safelyRevertSplit=Text.safelyRevertSplit);
		window.animateLines||(window.animateLines=Text.animateLines);
		
		return {
			Observers,
			Cursor,
			InitManager,
			Fonts,
			Text
		};
	})();

// Init Manager
	window.InitManager = (function () {
		const state = { installed:false, features:[], featuresById: new Map() };
		function nsOf(a){return a?.dataset?.barbaNamespace||a.getAttribute?.("data-barba-namespace")||""}
		function hasAny(r,n){if(!n||!n.length)return!0;for(const e of n)if(r.querySelector(e))return!0;return!1}
		function inNamespaces(n,r){return!r||"*"===r||("string"==typeof r?n===r:Array.isArray(r)?r.includes(n):"function"==typeof r&&!!r(n))}
		function feature(e){const t={id:e.id,stage:e.stage||"main",namespaces:e.namespaces||"*",selectors:e.selectors||[],enabled:!1!==e.enabled,init:e.init||(async()=>{}),destroy:e.destroy||null};if(!t.id)throw new Error("InitManager: feature missing id");if(state.featuresById.has(t.id))throw new Error("InitManager: duplicate feature id: "+t.id);return state.features.push(t),state.featuresById.set(t.id,t),t}
		
		// Registration
		const registries = {
			common: [],
			pages: {
				selected: [],
				archive: [],
				resources: [],
				capabilities: [],
				info: [],
				caseStudy: [],
			}
		};
	
		// Global
		registries.common.push(
			feature({
				id: 'webflowReparent',
				stage: 'early',
				namespaces: '*',
				selectors: ['[data-child]'],
				init: async r => { try { WebflowAdapter.reparent(r); } catch(e) { console.warn('[InitManager] webflowReparent failed:', e); } }
			}),
			
			feature({
				id: 'webflowReinitAfterAll',
				stage: 'late',
				namespaces: '*',
				selectors: [],
				init: async()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>WebflowAdapter?.reinit?.()))},
			}),

			feature({
				id: 'webflowReparentLate',
				stage: 'late',
				namespaces: '*',
				selectors: ['[data-child]','[data-parent]'],
				init: async r => {try {requestAnimationFrame(() => requestAnimationFrame(() => WebflowAdapter.reparent(r)));} catch(e) { console.warn('[InitManager] webflowReparentLate failed:', e); }}
			}),
			
			feature({
				id: 'activeTab',
				stage: 'early',
				namespaces: '*',
				selectors: ['[data-tab-link]'],
				init: async r=>{try{const e=r?.dataset?.barbaNamespace||r.getAttribute?.("data-barba-namespace")||"";document.querySelectorAll("[data-tab-link] a,[data-tab-link].is-active,a.is-active").forEach(e=>e.classList.remove("is-active"));const t="selected"===e?"selectedOpen":"archive"===e?"archiveOpen":"resources"===e?"resourcesOpen":"";if(!t)return;(document.querySelector(`#${t} a`)||document.querySelector(`#${t}`))?.classList.add("is-active")}catch(e){console.warn("[InitManager] activeTab failed:",e)}},
			}),
			
			feature({
				id: 'overscroll',
				stage: 'early',
				namespaces: '*',
				selectors: [],
				init: async r=>{const e=r?.dataset?.barbaNamespace||r.getAttribute?.("data-barba-namespace")||"",o="selected"===e?"none":"auto";document.documentElement.style.setProperty("overscroll-behavior",o,"important"),document.documentElement.style.setProperty("overscroll-behavior-y",o,"important"),document.body.style.setProperty("overscroll-behavior",o,"important"),document.body.style.setProperty("overscroll-behavior-y",o,"important")},
			}),

			feature({
				id: "themeBoot",
				stage: "early",
				namespaces: "*",
				selectors: [],
				init: async r=>{const K="theme",mq=matchMedia&&matchMedia("(prefers-color-scheme: dark)");let t=localStorage.getItem(K);if(!t&&mq&&mq.matches)t="dark";document.documentElement.setAttribute("data-theme",t||"light");mq&&mq.addEventListener&&mq.addEventListener("change",e=>{if(localStorage.getItem(K))return;document.documentElement.setAttribute("data-theme",e.matches?"dark":"light")});addEventListener("storage",e=>{if(e.key===K)document.documentElement.setAttribute("data-theme",e.newValue||"light")});}
			}),
			
			feature({
				id: 'themeSwitch',
				stage: 'main',
				namespaces: '*',
				selectors: ['.theme-switch'],
				init: async(root)=>{const els=[...document.querySelectorAll('.theme-switch,[data-theme-toggle]')];if(!els.length)return;const get=()=>document.documentElement.getAttribute('data-theme')||'light';const set=t=>{document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t);};const paint=el=>el.classList.toggle('dark',get()==='dark');els.forEach(el=>{if(el._themeBound)return;el._themeBound=!0;paint(el);const onClick=()=>{set(get()==='dark'?'light':'dark');els.forEach(paint);};el.addEventListener('click',onClick);el._unbind=()=>el.removeEventListener('click',onClick);});addEventListener('storage',e=>{if(e.key==='theme'){document.documentElement.setAttribute('data-theme',e.newValue||'light');els.forEach(paint);}});}
			}),
	
			feature({
				id: 'textAnimation',
				stage: 'main',
				namespaces: '*',
				selectors: ['.ta-one'],
				init: async r=>{await CoreUtilities.Fonts.ready();const{splitAndMask:a,safelyRevertSplit:t,animateLines:e}=CoreUtilities.Text,n=".ta-one",o=[...r.querySelectorAll(n)].filter(i=>!i.closest(".cs-headline"));o.forEach(i=>{gsap.set(i,{autoAlpha:0}),t(i._split,i)});const s=CoreUtilities.Observers.addDom(new IntersectionObserver((i,c)=>{i.forEach(f=>{if(!f.isIntersecting)return;const u=f.target;gsap.set(u,{autoAlpha:1});const l=a(u);e(l.lines).eventCallback("onComplete",()=>{t(l,u),u.__taDone=!0}),c&&c.unobserve(u)})},{root:null,rootMargin:"0px 0px -5% 0px",threshold:0}));o.forEach(i=>{if(i.__taDone||i.__taOneDone)return;s.observe(i);const c=i.getBoundingClientRect();if(c.top<innerHeight&&c.bottom>0){s.unobserve(i);gsap.set(i,{autoAlpha:1});const f=a(i);e(f.lines).eventCallback("onComplete",()=>{t(f,i),i.__taDone=!0})}});r.querySelectorAll(".w-tabs .w-tab-pane").forEach(i=>{CoreUtilities.Observers.addDom(new MutationObserver(()=>{if(!i.classList.contains("w--tab-active"))return;i.querySelectorAll(n).forEach(f=>{if(f.__taDone||f.__taOneDone||f.closest(".cs-headline"))return;const u=f.getBoundingClientRect();if(u.top<innerHeight&&u.bottom>0){gsap.set(f,{autoAlpha:1});const l=a(f);e(l.lines).eventCallback("onComplete",()=>{t(l,f),f.__taDone=!0})}})})).observe(i,{attributes:!0,attributeFilter:["class"]})})}
			}),
	
			feature({
				id: "appearInLine",
				stage: "early",
				namespaces: "*",
				selectors: [".appear-in-line"],
				init: async(root)=>{const SEL=".appear-in-line",CHILD=":scope > *:not(:empty)",STEP=.15,DUR=.8,prep=e=>gsap.set(e,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"}),hydrate=box=>{if(box.__ailInit)return;box.__ailInit=!0;const st={groups:[],splits:[],nodes:[],io:null,tl:null,resetTimer:null,reseting:!1},cleanupSplits=()=>{try{st.splits.forEach(s=>s.revert&&s.revert())}catch{}st.splits=[]},clearNodeStyles=()=>{if(!st.nodes.length)return;gsap.killTweensOf(st.nodes,!0);try{gsap.set(st.nodes,{clearProps:"y,opacity,filter,willChange"})}catch{st.nodes.forEach(n=>{n.style.removeProperty("transform"),n.style.removeProperty("opacity"),n.style.removeProperty("filter"),n.style.removeProperty("will-change")})}},build=()=>{st.groups=[],st.nodes=[],cleanupSplits(),[...box.querySelectorAll(CHILD)].forEach(node=>{const cs=getComputedStyle(node),cols=parseInt(cs.columnCount,10)||1,rect=node.getBoundingClientRect();if(cols>1&&window.SplitText)try{const sp=new SplitText(node,{type:"lines",linesClass:"split-line"});st.splits.push(sp);const colW=rect.width/cols,bkts=Array.from({length:cols},()=>[]);sp.lines.forEach(L=>{const x=L.getBoundingClientRect().left-rect.left,idx=Math.min(cols-1,Math.max(0,Math.floor(x/colW)));bkts[idx].push(L),prep(L),st.nodes.push(L)}),bkts.forEach(col=>st.groups.push(col))}catch{prep(node),st.groups.push([node]),st.nodes.push(node)}else prep(node),st.groups.push([node]),st.nodes.push(node)})},reveal=()=>{if(box.__ailDone)return;st.tl&&st.tl.kill();const tl=gsap.timeline({onComplete:()=>{cleanupSplits(),box.__ailDone=!0,st.tl=null}});st.tl=tl,st.groups.forEach((g,i)=>tl.to(g,{y:0,opacity:1,filter:"blur(0px)",duration:DUR,ease:"power2.out"},i*STEP))},arm=()=>{st.io&&st.io.disconnect?.(),st.io=CoreUtilities.Observers.addDom(new IntersectionObserver((ents,obs)=>{for(const ent of ents){if(!ent.isIntersecting)continue;obs.unobserve(box),reveal()}},{root:null,rootMargin:"0px 0px -10% 0px",threshold:0})),st.io.observe(box);const r=box.getBoundingClientRect();r.top<innerHeight&&r.bottom>0&&(st.io.unobserve(box),reveal())},hardReset=()=>{if(st.reseting)return;st.reseting=!0,st.tl&&st.tl.kill(),st.tl=null,st.io&&st.io.disconnect?.(),box.__ailDone=!1,clearNodeStyles(),build(),arm(),st.reseting=!1},scheduleReset=()=>{st.resetTimer&&(st.resetTimer.kill?.(),st.resetTimer=null),st.resetTimer=gsap.delayedCall(.03,hardReset)};build(),arm();const pane=box.closest(".w-tab-pane");pane&&CoreUtilities.Observers.addDom(new MutationObserver(()=>{const active=pane.classList.contains("w--tab-active");if(!active)scheduleReset();else{const r=box.getBoundingClientRect();r.top<innerHeight&&r.bottom>0&&(st.io&&st.io.unobserve(box),reveal())}})).observe(pane,{attributes:!0,attributeFilter:["class"]})};root.querySelectorAll(SEL).forEach(box=>{if(box.querySelector(".cs-headline")||box.closest(".cs-headline"))return;hydrate(box)})}
			}),
			
			feature({
				id: 'navigation',
				stage: 'main',
				namespaces: '*',
				selectors: ['.nav-primary-wrap'],
				init: async r=>{try{const n=r?.dataset?.barbaNamespace||r.getAttribute?.("data-barba-namespace")||"",D=document;D.querySelectorAll(".nav-primary-wrap").forEach(w=>{if(w.__navReady)return;w.__navReady=!0;const b=w.querySelector(".nav-button-menu"),L=w.querySelector(".nav-button-text"),P=w.querySelector(".phone-number"),m=w.querySelectorAll(".button-minimal-darkmode"),k=w.querySelectorAll(".menu-link"),T=w.querySelector(".ta-one-menu"),B=w.querySelector(".menu-wrapper"),C=w.querySelector(".menu-container"),F=w.querySelector(".nav-button-filter"),K=w.querySelector(".filters-container"),I=w.querySelectorAll(".modal-filters-item"),M=w.querySelector(".modal-filters-caption"),Y=w.querySelector(".filter-line-1"),E=w.querySelector(".filter-line-2");if(!b||!L||!B||!C){w._menuTimeline=null;w._filterTimeline=null;return}const H=t=>{try{document.body.style.overflow=t?"hidden":""}catch{}},N=()=>{try{C&&(C.style.display="none",C.removeAttribute("data-open"));B&&(B.style.display="none",B.removeAttribute("data-open"));L&&L.dataset&&L.dataset.orig&&(L.textContent=L.dataset.orig);q=!1;T&&delete T.__menuHeadlineDone;H(!1)}catch{}},z=()=>{try{K&&(K.style.display="none",K.removeAttribute("data-open"));B&&(B.style.display="none",B.removeAttribute("data-open"));H(!1)}catch{}};B.style.display="none";C.style.display="none";K&&(K.style.display="none");L.dataset.orig=L.textContent||"Menu";let q=!1;function G(){if(!T||q)return;q=!0;requestAnimationFrame(()=>{requestAnimationFrame(()=>{try{if(window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){const s=splitAndMask(T);animateLines(s.lines).eventCallback("onComplete",()=>{safelyRevertSplit(s,T),T.__menuHeadlineDone=!0})}else gsap.fromTo(T,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.6,ease:"power2.out"})}catch(e){gsap.set(T,{autoAlpha:1,clearProps:"y"})}})})}const U=()=>{B.style.display="flex",C.style.display="flex",B.setAttribute("data-open","1"),C.setAttribute("data-open","1"),H(!0)},V=()=>{B.style.display="flex",B.setAttribute("data-open","1"),K&&(K.style.display="flex",K.setAttribute("data-open","1")),H(!0)},x=gsap.timeline({paused:!0});x.add(G,0.05);P&&x.from(P,{opacity:0,duration:.35},">");m.length&&x.from(m,{opacity:0,duration:.35,stagger:.12},"<");k.length&&x.from(k,{opacity:0,yPercent:240,duration:.4,stagger:.1},"<");x.to(L,{text:"Close",duration:.2},"<");x.eventCallback("onReverseComplete",N);let a=null;const X=(t,h)=>{a&&gsap.ticker.remove(a),a=()=>{if(!t.reversed())return;(t.time()<=.02||t.progress()<=.02||!t.isActive())&&(h(),gsap.ticker.remove(a),a=null)},gsap.ticker.add(a),gsap.delayedCall(.6,()=>{t.reversed()&&(h(),a&&(gsap.ticker.remove(a),a=null))})};let o=null;const O=()=>{o="menu",U(),x.timeScale(1).play(0)},R=()=>{x.timeScale(2).reverse(),X(x,N),o=null},A=()=>{"menu"===o?R():"filter"===o&&d?(d.timeScale(2).reverse(),X(d,z),gsap.delayedCall(.02,O)):O()};b.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),A()},{passive:!1});let d=null;if(F&&K&&I.length){n==="archive"?(F.style.display="flex",gsap.to(F,{opacity:1,duration:.2})):gsap.to(F,{opacity:0,duration:.2,onComplete:()=>{F.style.display="none"}});d=gsap.timeline({paused:!0}).to(K,{opacity:1,duration:.35,ease:"power2.out"},0);Y&&d.to(Y,{rotation:45,transformOrigin:"center",duration:.3},0);E&&d.to(E,{rotation:-45,marginTop:"-4px",transformOrigin:"center",duration:.3},0);M&&d.from(M,{opacity:0,duration:.4},"<");I.length&&d.from(I,{opacity:0,duration:.6,stagger:.15},"<");d.eventCallback("onReverseComplete",z);const S=()=>{o="filter",V(),d.timeScale(1).play(0)},J=()=>{d.timeScale(2).reverse(),X(d,z),o=null};F.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),"filter"===o?J():"menu"===o?(R(),gsap.delayedCall(.02,S)):S()},{passive:!1})}const y=e=>{"Escape"===e.key&&("menu"===o?R():"filter"===o&&d&&d.progress()>0&&d.timeScale(2).reverse())};D.addEventListener("keydown",y);const _=e=>{if(!B.contains(e.target))return;"menu"===o&&x.progress()>0&&R();"filter"===o&&d&&d.progress()>0&&d.timeScale(2).reverse()};B.addEventListener("click",_,{passive:!0});k.forEach(t=>{t.addEventListener("click",()=>{"menu"===o&&R()},{passive:!0})});const Z=()=>{x.progress()>0&&x.timeScale(2).reverse(),d&&d.progress()>0&&d.timeScale(2).reverse(),N(),z(),o=null};Z();w._menuTimeline=x;w._filterTimeline=d||null});NavigationManager.attachMenuLocks(document)}catch(e){console.warn("[navigation:init] failed",e)}}
			}),
	
			feature({
				id: 'menuLinkHover',
				stage: 'main',
				namespaces: '*',
				selectors: ['.menu-link'],
				init: async r=>{if(!window.matchMedia('(hover:hover) and (min-width:1024px)').matches)return;r.querySelectorAll('.menu-link').forEach(n=>{if(n._hoverBound)return;n._hoverBound=!0;let t=n.querySelector('.menu-link-bg');t||(t=document.createElement('div'),t.classList.add('menu-link-bg'),n.appendChild(t));n.addEventListener('mouseenter',o=>{const{top:i,height:e}=n.getBoundingClientRect(),s=o.clientY-i<e/2;t.style.transformOrigin=s?'top center':'bottom center';gsap.to(t,{scaleY:1,duration:.3,ease:'power2.out'});});n.addEventListener('mouseleave',o=>{const{top:i,height:e}=n.getBoundingClientRect(),s=o.clientY-i<e/2;t.style.transformOrigin=s?'top center':'bottom center';gsap.to(t,{scaleY:0,duration:.3,ease:'power2.in'});});});}
			}),
	
			feature({
				id: 'closeCaseStudy',
				stage: 'main',
				namespaces: '*',
				selectors: ['.nav-button-close-case'],
				init: async(root)=>{const el=root.querySelector('.nav-button-close-case');if(!el)return;const path=(location.pathname||'/').replace(/\/+$/,'');const onCS=/^\/archive\/[^/]+$/.test(path)||!!(root.querySelector('.cs-hero-image')||root.querySelector('.cs-headline')||root.querySelector('.cs-gallery-inner'));if(onCS){el.style.display='flex';el.style.pointerEvents='auto';el.setAttribute('aria-hidden','false');el.setAttribute('aria-label',el.getAttribute('aria-label')||'Close case study');try{gsap.to(el,{opacity:1,duration:.2});}catch{el.style.opacity='1';}}else{el.setAttribute('aria-hidden','true');try{gsap.to(el,{opacity:0,duration:.2,onComplete:()=>{el.style.display='none';el.style.pointerEvents='none';}});}catch{el.style.opacity='0';el.style.display='none';el.style.pointerEvents='none';}}}
			}),
			
			feature({
				id: 'accordions',
				stage: 'main',
				namespaces: '*',
				selectors: ['.accordion-list'],
				init: async root=>{const L=[...root.querySelectorAll(".accordion-list")];if(!L.length)return;let to;const rf=()=>{clearTimeout(to),to=setTimeout(()=>{try{ScrollTrigger.refresh()}catch{}},100)};L.forEach(list=>{const items=[...list.querySelectorAll(".accordion-subservice, .accordion-mindset, .accordion-quote")];if(!items.length)return;items.forEach(it=>{if(it._accordionBound)return;it._accordionBound=!0;const h=it.querySelector(".accordion-header"),cr=it.querySelector(".cross-line-animating"),ct=it.querySelector(".accordion-content"),qi=it.querySelector(".accordion-icon-quote"),isQ=it.classList.contains("accordion-quote");if(!h||!cr||!ct)return;gsap.set(ct,{maxHeight:0,opacity:0,paddingBottom:0,paddingTop:isQ?0:void 0});const tl=gsap.timeline({paused:!0,defaults:{ease:"power2.out"}}).to(h,{paddingTop:"2rem",duration:.4},0).to(cr,{rotation:0,duration:.4},0).to(ct,{maxHeight:600,opacity:1,paddingBottom:isQ?"0rem":"2rem",paddingTop:isQ?"2rem":void 0,duration:.5,onUpdate:rf,onComplete:()=>gsap.set(ct,{maxHeight:"none"})},0);isQ&&qi&&tl.from(qi,{opacity:0,duration:.4},0);it._accordionTimeline=tl;it.addEventListener("click",()=>{if(tl.isActive())return;const open=h.classList.contains("accordion-active");items.forEach(o=>{if(o!==it){const oh=o.querySelector(".accordion-header"),ot=o._accordionTimeline;oh&&ot&&oh.classList.contains("accordion-active")&&!ot.isActive()&&(oh.classList.remove("accordion-active"),ot.reverse())}}),open?(gsap.set(ct,{maxHeight:ct.offsetHeight}),tl.eventCallback("onReverseComplete",rf),tl.reverse()):(gsap.set(ct,{maxHeight:0}),tl.play()),h.classList.toggle("accordion-active",!open)})})})}
			}),
			
			feature({
				id: 'customCursor',
				stage: 'late',
				namespaces: '*',
				selectors: [],
				init: async root=>{if(root.__customCursorDestroy)return CoreUtilities.Cursor.setDestroy(root.__customCursorDestroy),root.__customCursorDestroy;if(!matchMedia("(pointer:fine)").matches||!matchMedia("(hover:hover)").matches)return document.body.classList.remove("cursor--disable-all-cursors"),root.__customCursorDestroy=()=>{},CoreUtilities.Cursor.setDestroy(root.__customCursorDestroy),root.__customCursorDestroy;const c=document.createElement("canvas");c.className="cursor-webgl",document.body.appendChild(c);const a=c.getContext("2d"),w=document.createElement("div");w.className="custom-cursor";const y=document.createElement("div");y.className="cursor-content",w.appendChild(y),document.body.appendChild(w);const W=innerWidth/2,H=innerHeight/2,p={x:W,y:H,tx:W,ty:H},Q=gsap.quickSetter(w,"x","px"),K=gsap.quickSetter(w,"y","px");gsap.set(w,{x:p.x,y:p.y,scale:1,opacity:0,transformOrigin:"center center"}),gsap.set(y,{scale:1,transformOrigin:"center center"});let L=0,E=0;function R(){L=innerWidth,E=innerHeight,c.width=L,c.height=E}R();const h=Array.from({length:40},()=>({x:p.x,y:p.y,vx:0,vy:0})),S={s:1};let I=null,T=null,b=null,N=null,A=!1,O=!1;const U=.01,V=.005;let i=p.x,l=p.y;function J(){clearTimeout(N),N=setTimeout(Z,1e4)}function G(){const e=document.documentElement;i=(.25+.5*Math.random())*e.clientWidth,l=(.25+.5*Math.random())*e.clientHeight}function Z(){if(A||O)return;A=!0,G();const e=()=>{A&&!O&&(Math.random()<V&&G(),p.tx+=(i-p.tx)*U,p.ty+=(l-p.ty)*U,b=requestAnimationFrame(e))};b=requestAnimationFrame(e)}function x(){A=!1,b&&cancelAnimationFrame(b),b=null}const D=e=>{O||(x(),J(),p.tx=e.clientX,p.ty=e.clientY)},F=()=>{document.hidden?x():J()},q=e=>{const t=e.target.closest("[data-cursor]");if(!t)return;y.innerHTML="",w.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),S.s=1;const n=(t.dataset.cursor||"").toLowerCase();let r=1;if("hide"===n)return w.classList.add("cursor--hide"),document.body.classList.add("cursor--disable-all-cursors"),gsap.set(w,{scale:0,opacity:0,overwrite:!0}),void gsap.set(S,{s:0,overwrite:!0});if("scaleup"===n)r=3,w.classList.add("cursor--scaleup");else if("text"===n)y.textContent=t.dataset.text||"",w.classList.add("cursor--active"),r=3;else if("icon"===n){const e=(t.dataset.icon||"").trim();if(e.toLowerCase().endsWith(".svg")){const t=new Image;t.src=e,t.style.width=t.style.height="1em",y.appendChild(t)}else if(e){const t=document.createElement("i");t.className=e,y.appendChild(t)}w.classList.add("cursor--active"),r=3}gsap.killTweensOf(y),gsap.set(y,{scale:1/r}),gsap.to(w,{scale:r,opacity:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(S,{s:r,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0})},M=e=>{e.target.closest("[data-cursor]")&&(y.innerHTML="",w.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),gsap.killTweensOf(y),gsap.set(y,{scale:1}),gsap.to(w,{scale:1,opacity:0,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(S,{s:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}))};function Y(){if(!O){O=!0,x(),I&&cancelAnimationFrame(I),T&&cancelAnimationFrame(T),removeEventListener("resize",R),document.removeEventListener("mousemove",D),document.removeEventListener("pointerover",q),document.removeEventListener("pointerout",M),document.removeEventListener("visibilitychange",F);try{c.remove()}catch{}try{w.remove()}catch{}root.__customCursorDestroy=null}}addEventListener("resize",R),document.addEventListener("mousemove",D,{passive:!0}),document.addEventListener("pointerover",q,{passive:!0}),document.addEventListener("pointerout",M,{passive:!0}),document.addEventListener("visibilitychange",F),I=requestAnimationFrame(function e(){a.clearRect(0,0,L,E),p.x+=.45*(p.tx-p.x),p.y+=.45*(p.ty-p.y),h.forEach((e,t)=>{if(0===t)return e.x=p.x,void(e.y=p.y);const n=h[t-1];e.vx+=.4*(n.x-e.x),e.vy+=.4*(n.y-e.y),e.vx*=.5,e.vy*=.5,e.x+=e.vx,e.y+=e.vy});const t=getComputedStyle(document.documentElement).getPropertyValue("--colors--highlight").trim()||"#000";a.strokeStyle=t;for(let e=0;e<h.length-1;e++){const n=h[e],r=h[e+1],o=e/(h.length-1);a.lineWidth=16*(1-o)+2*o,a.lineCap="round",a.beginPath(),a.moveTo(n.x,n.y),a.lineTo(r.x,r.y),a.stroke()}a.beginPath(),a.fillStyle=t,a.arc(p.x,p.y,10*S.s,0,2*Math.PI),a.fill(),I=requestAnimationFrame(e)}),T=requestAnimationFrame(function e(){Q(p.x),K(p.y),T=requestAnimationFrame(e)}),J(),root.__customCursorDestroy=Y,CoreUtilities.Cursor.setDestroy(Y),Y}
			}),

			feature({
				id: "footerCopyEmail",
				stage: "late",
				namespaces: "*",
				selectors: ["[data-copy-email]"],
				init: async t=>{const e=[...t.querySelectorAll("[data-copy-email]")];e.length&&e.forEach((t=>{if(t._copyBound)return;t._copyBound=!0;const e=t.getAttribute("data-copy-email")||t.textContent.trim(),o=t.querySelector("[data-copy-label]"),a=t.getAttribute("data-copy-copied")||"Copied. Contact me anytime!",i=parseInt(t.getAttribute("data-copy-ms"),10)||1200,n=o?o.textContent:t.textContent;t.addEventListener("click",(async c=>{c.preventDefault(),c.stopPropagation();try{if(await(async t=>{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(t);else{const e=document.createElement("textarea");e.value=t,e.style.position="fixed",e.style.opacity="0",document.body.appendChild(e),e.select(),document.execCommand("copy"),e.remove()}})(e),t.classList.add("is-copied"),o)o.textContent=a,setTimeout((()=>{o.textContent=n,t.classList.remove("is-copied")}),i);else{const e=t.textContent;t.textContent=a,setTimeout((()=>{t.textContent=e,t.classList.remove("is-copied")}),i)}}catch(t){console.warn("[copy-email] failed",t)}}),{passive:!1})}))}
			}),
		);
	
		// Page: Index
		registries.pages.selected.push(
			feature({
				id: "selectedWorkLoop",
				stage: "main",
				namespaces: ["selected"],
				selectors: [".selected-container",".selected-content"],
				init:async r=>{const t=r.querySelector(".selected-container"),o=t?.querySelector(".selected-content");if(!t||!o||t.__selectedLoopInited)return;t.__selectedLoopInited=!0;const n=Array.from(o.querySelectorAll(".selected-item-outer"));if(!n.length)return;o.style.justifyContent="center",o.style.transform="translateZ(0)";const a=e=>{const t=getComputedStyle(e);return e.offsetWidth+((parseFloat(t.marginLeft)||0)+(parseFloat(t.marginRight)||0))},s=()=>{const e=Math.max(document.documentElement.clientWidth,window.innerWidth||0),t=window.matchMedia("(max-width:767px)").matches;return Math.round(e*(t?.78:.28))},l=e=>{o.querySelectorAll(".selected-item-outer").forEach(t=>{t._baseW=e,t.style.width=e+"px"})},i=()=>{let e=0;return Array.from(o.children).forEach(t=>{1===t.nodeType&&(e+=a(t))}),e},c=()=>{n.forEach(e=>{const t=e.cloneNode(!0);t.setAttribute("data-clone","true"),o.appendChild(t)})};let d=0;function h(){const e=Array.from(o.children).filter(e=>1===e.nodeType),n=Math.floor(e.length/2);let r=0;for(let t=0;t<n;t++)r+=a(e[t]);const l=a(e[n]);d=-(r+.5*l-.5*t.clientWidth),gsap.set(o,{x:d})}function u(){t.hasAttribute("data-loop-ready")||(t.setAttribute("data-loop-ready","1"),o.dispatchEvent(new CustomEvent("selected:loop-ready",{bubbles:!0})))}!function(){Array.from(o.children).forEach(e=>{1===e.nodeType&&e.hasAttribute("data-clone")&&e.remove()}),l(s()),c(),c();const e=3*t.clientWidth;let n=0;for(;i()<e&&n++<8;)c();l(s())}();let p=0,f=1;const m={t:0},y=gsap.quickTo(m,"t",{duration:.45,ease:"power3.out",onUpdate:()=>{o.querySelectorAll(".selected-item-outer").forEach(e=>{const t=e._baseW||s();e.style.width=t*(1+m.t)+"px"})}});let g=!1;const b=(e,t=16.6667)=>{const n=t/16.6667,r=p+1*f;d-=r*n;let l=o.firstElementChild,x=0;for(;l&&d<-a(l)&&x++<50;)d+=a(l),o.appendChild(l),l=o.firstElementChild;let i=o.lastElementChild;for(x=0;i&&d>0&&x++<50;)d-=a(i),o.insertBefore(i,o.firstElementChild),i=o.lastElementChild;gsap.set(o,{x:d});const c=Math.min(1,Math.abs(r)/70);y((r>=0?.14:-.1)*c),Math.abs(r)<3&&Math.abs(m.t)>.002&&!g&&(g=!0,gsap.to(m,{t:0,duration:1.1,ease:"elastic.out(0.62, 0.32)",onUpdate:()=>y(m.t)})),Math.abs(r)>=3&&(g=!1);const h=o.querySelectorAll(".selected-item-visual");if(h.length){const e=.5*window.innerWidth,t=.5+.5*c;h.forEach(o=>{const n=o.closest(".selected-visual");if(!n)return;const r=n.getBoundingClientRect(),l=(e-(r.left+.5*r.width))/window.innerWidth;o.style.setProperty("--drift",80*l*t+"px")})}p*=Math.pow(.94,n),Math.abs(p)<.01&&(p=0)};gsap.ticker.add(b),CoreUtilities.Observers.addTicker(b),CoreUtilities.Observers.addGsap(Observer.create({target:o,type:"wheel,touch",wheelSpeed:1,tolerance:6,onChange(e){const t=Math.abs(e.deltaX)>=Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(!t)return;const n=e.event.type.includes("touch")?0.34:.08;p+=t*n,p=gsap.utils.clamp(-70,70,p),f=t>0?1:-1}})),h(),u();let v=0;const w=new ResizeObserver(()=>{cancelAnimationFrame(v),v=requestAnimationFrame(()=>{l(s()),y(m.t),h(),u()})});w.observe(t),CoreUtilities.Observers.addDom(w)}
			})
		);
		
		// Page: Archive
		registries.pages.archive.push(
			feature({
				id: 'archiveFilters',
				stage: 'main',
				namespaces: ['archive'],
				selectors: ['.filters-tab','.list-item-archive-project'],
				init: async r=>{const t=[...r.querySelectorAll('.filters-tab')],p=[...r.querySelectorAll('.list-item-archive-project')],n=[...r.querySelectorAll("[id^='nav-archive-filter-']")];if(!t.length||!p.length)return;p.forEach(e=>{e._catsNorm||(e._catsNorm=[...e.querySelectorAll('.archive-categories .cms-categories')].map(t=>(t.textContent||'').trim().toLowerCase().replace(/[\W_]+/g,'')))});const c=e=>'all'===e?p.length:p.filter(t=>t._catsNorm.includes(e)).length;function a(e,o=!0){const i=r.querySelector('#archive-results-counter'),s=i&&parseInt((i.textContent||'').replace(/\D/g,''),10)||0;p.forEach(t=>{const r='all'===e||t._catsNorm.includes(e);t.style.display=r?'':'none'});const l=p.filter(e=>'none'!==e.style.display),d=l.length;i&&gsap.to({v:s},{v:d,duration:o?.5:.01,ease:'power1.out',onUpdate(){i.textContent=Math.round(this.targets()[0].v)}});if(!l.length)return;o?gsap.timeline().set(l,{y:100,opacity:0,filter:'blur(0px)',willChange:'transform,opacity'}).to(l,{y:0,opacity:1,duration:.6,ease:'power2.out',stagger:.12}):gsap.set(l,{y:0,opacity:1,filter:'blur(0px)'});r.querySelectorAll('.list-item-archive-project.open').forEach(e=>e.classList.remove('open'));const u=l.find(e=>null!==e.offsetParent);u&&u.classList.add('open')}t.forEach(e=>{const t=e.id.replace('archive-filter-','').toLowerCase().replace(/[\W_]+/g,''),r=e.querySelector('.filters-counter');r&&(r.textContent=`(${c(t)})`)});n.forEach(e=>{const t=e.id.replace('nav-archive-filter-','').toLowerCase().replace(/[\W_]+/g,''),r=e.querySelector('.nav-counter-filters');r&&(r.textContent=`(${c(t)})`)});t.forEach(e=>{e.addEventListener('click',t=>{t.preventDefault(),(r.querySelectorAll('.filters-tab')||t).forEach(e=>e.classList.remove('active')),e.classList.add('active');a(e.id.replace('archive-filter-','').toLowerCase().replace(/[\W_]+/g,''),!0)})});const o=r.querySelector('#archive-filter-all');o&&o.classList.add('active'),a('all',!1);const i=[...r.querySelectorAll('.list-item-archive-project img')].slice(0,12);('requestIdleCallback'in window?window.requestIdleCallback:e=>setTimeout(e,0))(()=>{i.forEach(e=>{e&&e.decode&&e.decode().catch(()=>{})})})}
			})
		);
		
		// Page: Resources
		registries.pages.resources.push(
			feature({
				id: 'resourcesPinnedSections',
				stage: 'main',
				namespaces: ['resources'],
				selectors: ['.section-resources .resource-item'],
				init: async root=>{if(!window.gsap||!window.ScrollTrigger)return;const a=[...root.querySelectorAll('.section-resources .resource-item')];if(!a.length)return;const c=window.matchMedia('(pointer: coarse), (hover: none)').matches,p={first:{visual:{start:'top 85%',end:'bottom top',dist:-320,blur:6},title:{start:'top 55%',end:'bottom top',dist:320},block:{start:'bottom 115%',end:'bottom top',dist:-480},contrast:!0},middle:{visual:{start:'top 85%',end:'bottom top',dist:-320,blur:6},title:{start:'top 70%',end:'bottom top',dist:320},block:{start:'bottom 115%',end:'bottom top',dist:-480},contrast:!0},last:{visual:{start:'top 85%',end:'bottom top',dist:-320,blur:6},title:{start:'top 70%',end:'bottom top',dist:560},block:{start:'bottom 100%',end:'bottom top',dist:-120},contrast:!1}};a.forEach((e,i)=>{const t=e.querySelector('.resource-visual'),l=e.querySelector('.resource-item h2'),r=e.querySelector('.resource-block'),n=0===i,s=i===a.length-1,o=p[n?'first':s?'last':'middle'],d=a[i+1]||null,g=d||e,u=d?'top top':o.visual.end;if(t){const m=gsap.quickSetter(t,'y','px'),h=gsap.quickSetter(t,'filter'),f=o.visual.blur||0;ScrollTrigger.create({trigger:e,start:o.visual.start,endTrigger:g,end:u,scrub:!0,onUpdate:v=>{const b=v.progress;m(o.visual.dist*b),h(f?`blur(${f*b}px)`:'none')}})}if(!c&&l)gsap.to(l,{y:o.title.dist,ease:'none',overwrite:'auto',force3D:!0,scrollTrigger:{trigger:e,start:o.title.start,endTrigger:g,end:u,scrub:!0,anticipatePin:1,invalidateOnRefresh:!0}});if(!c&&r){const m=gsap.quickSetter(r,'y','px');ScrollTrigger.create({trigger:e,start:o.block.start,endTrigger:g,end:u,scrub:!0,onUpdate:v=>m(o.block.dist*v.progress)})}if(!s){const m=e.offsetHeight<window.innerHeight?'top top':'bottom bottom';gsap.timeline({scrollTrigger:{trigger:e,start:m,endTrigger:d||e,end:d?'top top':'bottom top',pin:!0,pinSpacing:!1,scrub:1,anticipatePin:1,invalidateOnRefresh:!0,onUpdate:v=>{if(!o.contrast){gsap.set(e,{filter:'contrast(100%) blur(0px)'});return}const b=v.progress,w=Math.max(0,Math.min(1,(b-.15)/.85)),y=100+-90*w,x=10*w;gsap.set(e,{filter:`contrast(${y}%) blur(${x}px)`})}}}).set(e,{filter:'contrast(100%) blur(0px)'})}}),ScrollTrigger.refresh(!0)}
			})
		);
	
		// Page: Capabilities
		registries.pages.capabilities.push(
			feature({
				id: "productPinnedSections",
				stage: "main",
				namespaces: ["capabilities"],
				selectors: [".section-single-service"],
				init: async r=>{if(!window.gsap||!window.ScrollTrigger)return;const s=[...r.querySelectorAll(".section-single-service")];if(!s.length)return;s.forEach((e,i)=>{const t=!(e.offsetHeight<innerHeight),a=0===i?"top top":t?"bottom bottom":"top top";gsap.timeline({scrollTrigger:{trigger:e,start:a,end:"bottom top",pin:!0,pinSpacing:!1,scrub:1,anticipatePin:1,invalidateOnRefresh:!0}}).to(e,{ease:"none",startAt:{filter:"contrast(100%) blur(0px)"},filter:"contrast(10%) blur(10px)"},0)});try{ScrollTrigger.refresh()}catch{}}
			
			}),
			feature({
				id: "productGallery",
				stage: "main",
				namespaces: ["capabilities"],
				selectors: [".infinite-gallery"],
				init: async r=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const e=t=>{const n=[...t.querySelectorAll("img,video")];if(!n.length)return Promise.resolve();const o=t=>t.naturalWidth>0&&t.naturalHeight>0||t.videoWidth>0&&t.videoHeight>0;let i=[];return Promise.race([Promise.all(n.map(t=>{if(o(t))return Promise.resolve();const n="function"==typeof t.decode?t.decode().catch(()=>{}):Promise.resolve(),i=new Promise(n=>{const o=()=>{t.removeEventListener("load",o),n()};t.addEventListener("load",o,{once:!0})}),s=new Promise(n=>{let i=0;!function a(){if(o(t)||i++>80)return n();setTimeout(a,40)}()});return Promise.race([n,i,s])})),new Promise(t=>i.push(setTimeout(t,3500)))]).finally(()=>i.forEach(clearTimeout))},n=!!(window.CSS&&CSS.supports&&CSS.supports("aspect-ratio: 1/1")),o=t=>{const n=parseFloat(t.getAttribute("data-ratio"));if(n&&n>0)return n;const o=(t.className||"").match(/sv-ratio-(\d+)/);if(o){const t=o[1];if("169"===t)return 16/9;if("133"===t||"43"===t)return 4/3;if("11"===t)return 1}const i=t.querySelector("img,video");if(i){const t=parseInt(i.getAttribute("width"),10)||i.naturalWidth||i.videoWidth||0,n=parseInt(i.getAttribute("height"),10)||i.naturalHeight||i.videoHeight||0;if(t>0&&n>0)return t/n}return 3/2},i=(t,r)=>{const e=parseFloat(t.getAttribute("data-size"));if(e&&e>0)return Math.max(1,Math.round(r*e/100));const n=(t.className||"").match(/sv-size-(\d+)/);if(n){const t=parseFloat(n[1]);if(t>0)return Math.max(1,Math.round(r*t/100))}const o=t.getBoundingClientRect().height||0;return o>0?Math.round(o):Math.max(1,Math.round(.5*r))},s=()=>Math.max(document.documentElement.clientWidth,window.innerWidth||0),a=[...r.querySelectorAll(".infinite-gallery")];if(!a.length)return;a.forEach(async r=>{const s=r.querySelector(".infinite-gallery-wrapper");if(!s||s.__inited)return;s.__inited=!0,r.setAttribute("data-armed","measure");const a=[...s.querySelectorAll('.service-visual-wrapper:not([data-clone])')];if(!a.length){r.setAttribute("data-armed","1");return}const l=new Set;let c=!1,u=0,d=0,f=0,m=("right"===(r.dataset.direction||"left").toLowerCase()?-1:1),p=parseFloat(r.dataset.speed)||.6;a.forEach((t,r)=>{const e=o(t),i=t.querySelector(".service-visual");t.dataset.ratio=String(e),t.dataset.key=String(r),t.dataset.revealed="0",t.dataset.revealing="",t.style.overflow="hidden",t.style.flex="0 0 auto",t.style.height="0px",t.style.willChange="height,transform",i&&(i.style.visibility="hidden",i.style.opacity="0",i.style.willChange="opacity"),n?(t.style.aspectRatio=e+" / 1",t.style.removeProperty("width"),t.style.removeProperty("min-width"),t.style.removeProperty("max-width")):(t.style.width="1px",t.style.minWidth="1px",t.style.maxWidth="1px")});const y=()=>{a.forEach(t=>{const r=parseFloat(t.dataset.ratio)||o(t),e=i(t,s.clientHeight);t.dataset.targetH=String(e),n?t.style.aspectRatio=r+" / 1":(()=>{const n=Math.max(1,Math.round(e*r));t.style.width=n+"px",t.style.minWidth=n+"px",t.style.maxWidth=n+"px"})()}),s.style.gap=getComputedStyle(s).gap||"0px"},g=()=>{[...s.querySelectorAll('.service-visual-wrapper[data-clone="1"]')].forEach(t=>t.remove())},v=t=>{const r=t.cloneNode(!0),e=t.dataset.key||"",a=parseFloat(t.dataset.ratio)||o(t),c=+t.dataset.targetH||0,u=r.querySelector(".service-visual");return r.setAttribute("data-clone","1"),r.dataset.key=e,r.dataset.ratio=String(a),r.style.overflow="hidden",r.style.flex="0 0 auto",r.style.willChange="height,transform",r.style.height=l.has(e)&&c>0?c+"px":"0px",u&&(u.style.visibility=l.has(e)?"visible":"hidden",u.style.opacity=l.has(e)?"1":"0"),n?r.style.aspectRatio=a+" / 1":(()=>{const t=Math.max(1,Math.round(Math.max(1,c)*a));r.style.width=t+"px",r.style.minWidth=t+"px",r.style.maxWidth=t+"px"})(),s.appendChild(r),r},h=()=>{a.forEach(v)},w=()=>{let t=0;return s.childNodes.forEach(r=>{1===r.nodeType&&(t+=(r.getBoundingClientRect().width||0)+(parseFloat(getComputedStyle(s).gap||"0")||0))}),t},b=()=>{g(),h(),h();let t=0;for(;w()<3*s.clientWidth&&t++<8;)h()},S=()=>{r.setAttribute("data-armed","1");const t=r.getBoundingClientRect(),e=innerHeight||document.documentElement.clientHeight||0;t.bottom>0&&t.top<e&&(c=!0,cancelAnimationFrame(u),u=requestAnimationFrame(T))},T=t=>{if(!c){cancelAnimationFrame(u);return}if((t||0)-d<32){u=requestAnimationFrame(T);return}d=t||performance.now();const e=innerWidth||document.documentElement.clientWidth||0,i=-.05*e,a=1.05*e,l=[...s.querySelectorAll('.service-visual-wrapper:not([data-clone])')].filter(t=>{const r=t.getBoundingClientRect();return r.right>i&&r.left<a}).filter(t=>"1"!==t.dataset.revealed&&"1"!==t.dataset.revealing).sort((t,r)=>t.getBoundingClientRect().left-r.getBoundingClientRect().left);if(l.length){const t=gsap.timeline();l.forEach((r,e)=>{const i=+r.dataset.targetH||0,s=r.dataset.key||"",a=parseFloat(r.dataset.ratio)||o(r),c=r.querySelector(".service-visual");r.dataset.revealing="1",c&&gsap.set(c,{visibility:"visible"}),t.fromTo(r,{height:0},{height:i,duration:.9,ease:"power2.out",onUpdate:()=>{c&&gsap.to(c,{opacity:1,duration:.2,overwrite:"auto"})},onComplete:()=>{r.style.height="",r.dataset.revealed="1",r.dataset.revealing="",l.add(s),s.querySelectorAll('.service-visual-wrapper[data-clone="1"][data-key="'+s+'"]').forEach(t=>{t.style.height=i+"px";const r=t.querySelector(".service-visual");r&&(r.style.visibility="visible",r.style.opacity="1");if(!n){const t2=Math.max(1,Math.round(i*a));t.style.width=t2+"px",t.style.minWidth=t2+"px",t.style.maxWidth=t2+"px"}}),n||(t=>{const t2=Math.max(1,Math.round(i*a));r.style.width=t2+"px",r.style.minWidth=t2+"px",r.style.maxWidth=t2+"px"})()}},.12*e)})}u=requestAnimationFrame(T)},C=(t,r)=>{const e=(r||16.6667)/1e3,n=60*p;f-=m*e*n;const o=t=>t.getBoundingClientRect().width+(parseFloat(getComputedStyle(s).gap||"0")||0);let i=s.firstElementChild,a=0;for(;i&&f<-o(i)&&a++<50;)f+=o(i),s.appendChild(i),i=s.firstElementChild;let l=s.lastElementChild;for(a=0;l&&f>0&&a++<50;)f-=o(l),s.insertBefore(l,s.firstElementChild),l=s.lastElementChild;gsap.set(s,{x:f});const c=(innerWidth||0)/2;s.querySelectorAll(".service-visual").forEach(t=>{const r=t.closest(".service-visual-wrapper");if(!r)return;const e=r.getBoundingClientRect(),n=(c-(e.left+e.width/2))/((innerWidth)||1);t.style.setProperty("--drift",40*n+"px")})},E=t=>{t.forEach(t=>{t.target===r&&(t.isIntersecting?(c=!0,cancelAnimationFrame(u),u=requestAnimationFrame(T)):(c=!1,cancelAnimationFrame(u)))})},R=new ResizeObserver(()=>{y(),g(),b(),a.forEach(t=>{const r=t.dataset.key||"",e=+t.dataset.targetH||0;s.querySelectorAll('.service-visual-wrapper[data-clone="1"][data-key="'+r+'"]').forEach(t=>{t.style.height=e+"px"})}),S()});await e(s),y(),b(),S();const L=new IntersectionObserver(E,{root:null,threshold:0,rootMargin:"0px 0px -5% 0px"});L.observe(r),CoreUtilities.Observers.addDom(L),CoreUtilities.Observers.addDom({disconnect(){c=!1,cancelAnimationFrame(u)}});const O=(t,r)=>C(t,r);gsap.ticker.add(O),CoreUtilities.Observers.addTicker(O),R.observe(s),CoreUtilities.Observers.addDom(R)})}
			})
		);

		// Page: Info
		registries.pages.info.push(
			feature({
				id: 'infoTestimonialsJump',
				stage: "main",
				namespaces: ['info'],
    			selectors: [],
				init: async r=>{const t=["recommendationsOpen1","recommendationsOpen2","recommendationsOpen3","recommendationsOpen4"],n=()=>document.getElementById("recommendations")||document.querySelector('.w-tabs .w-tab-link[data-w-tab="Recommendations"]'),o=()=>{const e=document.getElementById("details")||document.querySelector(".section-details");if(!e)return;const t=e.getBoundingClientRect().top+window.pageYOffset-24;window.scrollTo({top:t,behavior:"smooth"})};t.forEach(t=>{const e=r.querySelector("#"+t)||document.getElementById(t);e&&!e.classList.contains("w-tab-link")&&e.addEventListener("click",e=>{e.preventDefault();(n()||{}).click?.();requestAnimationFrame(()=>requestAnimationFrame(o))},{passive:!1})})}
			})
		);
	
		// Page: Case Study
		registries.pages.caseStudy.push(
			feature({
				id: 'csScrollBackground',
				stage: 'main',
				namespaces: '*', 
				selectors: ['.cs-hero-image', '.cs-details', '.cs-morework'],
				init: async r=>{if(!window.ScrollTrigger)return;const c=r.closest(".barba-container")||r,d=c.querySelector(".cs-details"),m=c.querySelector(".cs-morework");if(!d||!m)return;try{ScrollTrigger.getById("csbg:mark:details")?.kill();ScrollTrigger.getById("csbg:mark:more")?.kill();ScrollTrigger.getById("csbg:ctrl")?.kill()}catch{}const cs=getComputedStyle(c).backgroundColor,bg="var(--colors--background)",bd="var(--colors--border)";let last="";c.style.transition="background-color .6s ease";const set=v=>{if(v===last)return;last=v;gsap.set(c,{backgroundColor:v,overwrite:"auto"})};const stD=ScrollTrigger.create({id:"csbg:mark:details",trigger:d,start:"top bottom-=15%",refreshPriority:100});const stM=ScrollTrigger.create({id:"csbg:mark:more",trigger:m,start:"top bottom-=15%",refreshPriority:100});ScrollTrigger.create({id:"csbg:ctrl",start:0,end:()=>ScrollTrigger.maxScroll(window)+1,refreshPriority:0,onUpdate:self=>{const y=self.scroll();set(y<stD.start?cs:y<stM.start?bg:bd)},onRefresh:self=>{const y=self.scroll();set(y<stD.start?cs:y<stM.start?bg:bd)}});}
			}),
			feature({
				id: 'csPortraitColumns',
				stage: 'early',
				namespaces: '*',
				selectors: ['.cs-gallery-inner'],
				init: async r=>{const w=[...r.querySelectorAll(".cs-gallery-inner")];if(!w.length)return;w.forEach(e=>e.style.visibility="hidden");const k=i=>{if(i.naturalWidth>0&&i.naturalHeight>0)return i.naturalHeight/i.naturalWidth;{const W=parseInt(i.getAttribute("width"),10),H=parseInt(i.getAttribute("height"),10);if(W>0&&H>0)return H/W}const cw=i.clientWidth,ch=i.clientHeight;return cw>0&&ch>0?ch/cw:null};let raf=0;const later=f=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(f)};const lay=()=>{w.forEach(e=>{e.style.removeProperty("width"),e.classList.remove("is-portrait","is-paired")});if(window.innerWidth<1024){w.forEach(e=>e.style.visibility="visible");return}const P=w.map(e=>e.querySelector("img")).filter(Boolean).map(img=>{const r=k(img),p=!!r&&r>1;p&&img.closest(".cs-gallery-inner")?.classList.add("is-portrait");return p});for(let i=0;i<w.length-1;i++)if(P[i]&&P[i+1]){[w[i],w[i+1]].forEach(e=>{e.style.width="calc(50% - 0.5rem)",e.classList.add("is-paired")});i+=1}w.forEach(e=>e.style.visibility="visible")};const imgs=w.map(e=>e.querySelector("img")).filter(Boolean);if(!imgs.length){w.forEach(e=>e.style.visibility="visible");return}const ok=i=>i.naturalWidth>0&&i.naturalHeight>0;Promise.all(imgs.map(img=>{if(ok(img))return Promise.resolve();const dec=typeof img.decode=="function"?img.decode().catch(()=>{}):Promise.resolve();const poll=new Promise(res=>{let c=0;!function tick(){if(ok(img)||c>=60)return res();c+=1,setTimeout(tick,50)}()});const onl=new Promise(res=>{const h=()=>{img.removeEventListener("load",h),res()};img.addEventListener("load",h,{once:!0})});return Promise.race([dec,poll,onl])})).then(()=>later(lay));const ro=new ResizeObserver(()=>later(lay));imgs.forEach(i=>ro.observe(i));const onR=()=>later(lay);window.addEventListener("resize",onR,{passive:!0});const mo=new MutationObserver(()=>{if(!document.body.contains(r)){ro.disconnect(),window.removeEventListener("resize",onR),mo.disconnect()}});mo.observe(document.body,{childList:!0,subtree:!0})}
			})
		);
	
		// Execution order (early → main → late)
		function sortByStage(t){const e={early:0,main:1,late:2};return t.slice().sort(((t,a)=>(e[t.stage]??1)-(e[a.stage]??1)))}
		function buildIndex(){if(state.installed)return;const e=[...registries.common,...registries.pages.selected,...registries.pages.archive,...registries.pages.resources,...registries.pages.capabilities,...registries.pages.info,...registries.pages.caseStudy];state.features=sortByStage(e),state.installed=!0}
		async function run(e=document,{preserveServicePins:r=!1}={}){buildIndex();const t=nsOf(e);try{CoreUtilities.Observers.clearAll({preserveServicePins:r})}catch{}try{CoreUtilities.Cursor.destroy()}catch{}try{document.querySelectorAll(".cursor-webgl, .custom-cursor").forEach((e=>{try{e.remove()}catch{}}))}catch{}for(const r of state.features)if(r.enabled&&inNamespaces(t,r.namespaces)&&hasAny(e,r.selectors))try{await r.init(e,{pageNS:t})}catch(e){console.warn("[InitManager]",r.id,"init failed:",e)}try{await new Promise((e=>requestAnimationFrame(e))),await new Promise((e=>requestAnimationFrame(e))),window.ScrollTrigger&&ScrollTrigger.refresh()}catch{}}
		async function cleanup({preserveServicePins:e=!1}={}){for(const e of state.features)if("function"==typeof e.destroy)try{await e.destroy(document,{})}catch(r){console.warn("[InitManager]",e.id,"destroy failed:",r)}try{CoreUtilities.Observers.clearAll({preserveServicePins:e})}catch{}try{CoreUtilities.Cursor.destroy()}catch{}try{document.querySelectorAll(".cursor-webgl, .custom-cursor").forEach((e=>{try{e.remove()}catch{}}))}catch{}}
		function enable(id, on = true) { const f = state.featuresById.get(id); if (f) f.enabled = !!on; }
		function disable(id) { enable(id, false); }
		function getFeature(id) { return state.featuresById.get(id) || null; }
		function getState() { return { ...state, features: state.features.map(f => ({ id: f.id, stage: f.stage, enabled: f.enabled })) }; }
		
		return {
			run,
			cleanup,
			enable,
			disable,
			getFeature,
			getState,
			_registries: registries
		};
	})();

// Preloader Service
	window.PreloaderService = (function () {
		let _enabled = false;
		let _built = false;
		let runIntroTimeline = async () => {};
		let runPreloader = async () => {};
		
		function isSlowConnection(){const e=navigator.connection||{};return!(!e.effectiveType||"4g"===e.effectiveType)}
		function isReload(){const e=performance.getEntriesByType("navigation");return e.length?"reload"===e[0].type:1===performance.navigation?.type}
		function shouldShowPreloader() {
			// keep off for now
			// return isSlowConnection() || isReload() || !sessionStorage.getItem("preloaderSeen");
			return false;
		}
		function buildOnce() {
			if (_built) return;
			_built = true;
			
			(function () {
				const pre = document.querySelector(".preloader");
				if (!pre) {
					runIntroTimeline = async () => {};
					runPreloader = async () => {};
					return;
				}
				const $ = gsap.utils.selector(pre);
				const title = $(".preloader-title")[0];
				const subtitle = $(".preloader-subtitle")[0];
				const imageWrap = $(".preloader-image-wrap")[0];
				const counter = $(".preloader-counter")[0];
				const bar = $(".preloader-visual-counter")[0];
			
				let slides, preW = 0, winH = window.innerHeight;
				function measure() { preW = pre.clientWidth; winH = window.innerHeight; }
			
				slides=isSlowConnection()?["#93A8AC","#BA5A31","#111D4A","#FFCF99","#C9FBC6"].map((e=>{const a=document.createElement("div");return a.className="preloader-slide placeholder",a.style.backgroundColor=e,imageWrap.appendChild(a),a})):$(".preloader-image"),measure(),window.addEventListener("resize",measure);
				function morphCrossfade(t,e,o,{w:i,h:r},n=.8){const a=.2*n,u=.25*n;return gsap.timeline().to(o,{width:i,height:r,duration:n,ease:"power2.out"},0).to(o,{filter:"blur(2px)",duration:a,ease:"power2.inOut"},u).to(t,{opacity:0,duration:a,ease:"power2.inOut"},u).to(e,{opacity:1,duration:a,ease:"power2.inOut"},u).set(o,{filter:"none"},u+a)}
				runIntroTimeline=function(){return new Promise(e=>{const t=title;if(!t){e();return}t._originalHTML||(t._originalHTML=t.innerHTML);gsap.set([title,subtitle,imageWrap,counter],{autoAlpha:0,visibility:"hidden"}),gsap.set(title,{autoAlpha:1,visibility:"visible"});if(!window.SplitText){gsap.timeline({onComplete:e}).to(title,{y:0,opacity:1,duration:.6,ease:"power2.out"},0).to(subtitle,{autoAlpha:1,visibility:"visible",y:0,filter:"blur(0)",duration:.6,ease:"power2.out"},"-=0.2").to(imageWrap,{autoAlpha:1,visibility:"visible",marginTop:"2rem",marginBottom:"2rem",duration:.8,ease:"power2.out"},"+=0.3").to(counter,{autoAlpha:1,visibility:"visible",duration:.6,ease:"power2.out"},"<");return}const i=splitAndMask(title);gsap.timeline({onComplete(){safelyRevertSplit(i,title),e()}}).to(title,{height:title.scrollHeight,duration:.8,ease:"power2.out"},0).to(i.lines,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08},0).to(subtitle,{autoAlpha:1,visibility:"visible",height:subtitle.scrollHeight,paddingTop:"0.5rem",y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"-=0.2").to(imageWrap,{autoAlpha:1,visibility:"visible",marginTop:"2rem",marginBottom:"2rem",duration:.8,ease:"power2.out"},"+=0.3").to(counter,{autoAlpha:1,visibility:"visible",height:counter.scrollHeight,filter:"blur(0)",duration:.6,ease:"power2.out"},"<")})};
				runPreloader=async function(){if(runPreloader._started)return;pre.style.display="flex",runPreloader._started=!0;const e=[{ratio:2.5/3,heightVh:40,hold:.05},{ratio:16/9,heightVh:50,hold:.05},{ratio:1,heightVh:34,hold:.05},{ratio:4/3,heightVh:50,hold:.05},{ratio:1.5,heightVh:40,hold:.6}];slides.forEach(((e,t)=>e.style.opacity=0===t?1:0));const t=e.length;let o=0;const a=e.map(((e,a)=>{const r=Math.round((a+1)/t*100),i=Math.round(10*Math.random()-5),n=Math.min(100,Math.max(o+1,r+i));return o=n,n}));function r(t){const{ratio:o,heightVh:a}=e[t%e.length];let r=winH*(a/100),i=r*o;return i>preW&&(i=preW,r=i/o),{w:i,h:r}}for(let t=0;t<slides.length;t++){const o=a[t],i=r(t),n=e[t%e.length].hold,h=gsap.to(bar,{height:o+"%",duration:.8+n,ease:"power1.inOut"}),s={v:0===t?0:a[t-1]},d=gsap.to(s,{v:o,duration:.8+n,ease:"power1.inOut",onUpdate(){counter.textContent=Math.round(s.v)+"%"}});0===t?await gsap.to(imageWrap,{width:i.w,height:i.h,duration:.8,ease:"power2.out"}):await(function(t,o,a,r,n=.8){const c=.2*n,l=.25*n;return gsap.timeline().to(a,{width:r.w,height:r.h,duration:n,ease:"power2.out"},0).to(a,{filter:"blur(2px)",duration:c,ease:"power2.inOut"},l).to(t,{opacity:0,duration:c,ease:"power2.inOut"},l).to(o,{opacity:1,duration:c,ease:"power2.inOut"},l).set(a,{filter:"none"},l+c)})(slides[t-1],slides[t],imageWrap,i,.8),await new Promise((e=>setTimeout(e,Math.round(1e3*n)))),await Promise.all([h,d])}await gsap.to(bar,{height:"100%",duration:.2,ease:"none"}),counter.textContent="100%",await new Promise((e=>setTimeout(e,200))),await gsap.to(pre,{yPercent:-100,duration:.8,ease:"power2.inOut",onStart(){window.initAllYourInits&&window.initAllYourInits()},onComplete(){try{sessionStorage.setItem("preloaderSeen","1")}catch{}try{window.removeEventListener("resize",measure)}catch{}try{pre.remove()}catch{}try{document.documentElement.removeAttribute("data-preloading")}catch{}}})};
			})();
		}
		function enable(e=!0){_enabled=!!e}
		function isEnabled(){return _enabled}
		function shouldRun(){return _enabled&&shouldShowPreloader()}
		async function maybeRun(){return!!shouldRun()&&(_built||buildOnce(),await runIntroTimeline(),await runPreloader(),!0)}
		
		return {
			enable, isEnabled,
			isSlowConnection, isReload, shouldShowPreloader, shouldRun,
			maybeRun,
		};
	})();

// Scroll State
	window.ScrollState = (function () {
		const PREFIX="scroll:";
		let config={maxAgeMs:null};
		const KEY=E=>`${PREFIX}${E}`;
		const nextFrame=()=>new Promise((e=>requestAnimationFrame(e)));
		async function afterTwoFrames(){await nextFrame(),await nextFrame()}
		function readXY(){document.body;const o=document.scrollingElement||document.documentElement||document.body||{};let e=("number"==typeof window.scrollX?window.scrollX:window.pageXOffset)??0,n=("number"==typeof window.scrollY?window.scrollY:window.pageYOffset)??0;return 0===e&&o.scrollLeft&&(e=o.scrollLeft),0===n&&o.scrollTop&&(n=o.scrollTop),{x:Math.round(e),y:Math.round(n)}}
		function init(n={}){config={...config,...n};try{prune({maxAgeMs:config.maxAgeMs})}catch{}}
		function save(a=location.pathname+location.search){try{save._raf&&cancelAnimationFrame(save._raf),save._raf=requestAnimationFrame((async()=>{save._raf=0,await afterTwoFrames();const{x:e,y:t}=readXY();sessionStorage.setItem(KEY(a),`${e},${t},${Date.now()}`)}))}catch{}}
		async function saveAsync(a=location.pathname+location.search){try{await afterTwoFrames();const{x:e,y:t}=readXY();sessionStorage.setItem(KEY(a),`${e},${t},${Date.now()}`)}catch{}}
		function read(n=location.pathname+location.search,t={}){try{const e=sessionStorage.getItem(KEY(n));if(!e)return null;const[l,a,r]=e.split(","),s=parseInt(l,10)||0,o=parseInt(a,10)||0,u=r?parseInt(r,10):null,c=t.maxAgeMs??config.maxAgeMs;return null!=c&&null!=u&&Date.now()-u>c?null:{x:s,y:o}}catch{return null}}
		function prune({maxAgeMs:t=null}={}){if(null!=t)try{const e=Date.now();for(let s=sessionStorage.length-1;s>=0;s--){const n=sessionStorage.key(s);if(!n||!n.startsWith(PREFIX))continue;const o=sessionStorage.getItem(n)?.split(",")[2];o&&e-parseInt(o,10)>t&&sessionStorage.removeItem(n)}}catch{}}
		try{history.scrollRestoration="manual"}catch{}
		return {
			init, KEY, save, saveAsync, read, prune,
			get config() { return config; }
		};
	})();

// Transition Effects
	window.TransitionEffects = (function () {
		let runningCoverOut = null;
		function getOverlay(){const e=document.querySelector(".page-overlay"),t=e?.querySelector(".page-overlay-tint")||null;return{el:e,tint:t}}
		async function coverIn(){const{el:t,tint:e}=getOverlay();if(!t)return!0;try{window.NavigationManager?.setLock("overlay",!0)}catch{}return t.style.display="block",t.style.pointerEvents="auto",gsap.set(t,{y:"100%",clipPath:"polygon(0% 0%,100% 20%,100% 100%,0% 100%)",willChange:"transform,clip-path"}),e&&gsap.set(e,{opacity:0,willChange:"opacity"}),new Promise((o=>{gsap.timeline({defaults:{duration:1.35,ease:"power4.inOut"},onComplete:()=>o(!0)}).to(t,{y:"0%"},0).to(t,{clipPath:"polygon(0% 0%,100% 0%,100% 100%,0% 100%)"},0).to(e||t,{opacity:1,ease:"none"},.6)}))}
		async function coverOut(o){o=o||{};var n=void 0===o.closeMenus||!!o.closeMenus;const{el:e,tint:t}=getOverlay();if(!e){try{window.NavigationManager?.setLock("overlay",!1)}catch{}return!0}if(n)try{window.EntryOrchestrator?.forceCloseMenus?.(document)}catch{}return runningCoverOut||(runningCoverOut=new Promise((o=>{"none"===getComputedStyle(e).display?(e.style.display="none",e.style.pointerEvents="none",function(){try{window.NavigationManager?.setLock("overlay",!1)}catch{}}(),runningCoverOut=null,o(!0)):gsap.timeline({onStart(){e.style.pointerEvents="auto"},onComplete(){gsap.set(e,{clearProps:"transform,clipPath"}),t&&gsap.set(t,{clearProps:"opacity"}),e.style.display="none",e.style.pointerEvents="none";try{window.NavigationManager?.setLock("overlay",!1)}catch{}runningCoverOut=null,o(!0)}}).to(e,{duration:.6,ease:"power4.in",y:"-100%"},0).to(t||e,{duration:.6,ease:"none",opacity:0},0)})),runningCoverOut)}
		return { coverIn, coverOut };
	})();

// Entry Orchestrator
	window.EntryOrchestrator = window.EntryOrchestrator || (function () {
		const entryConfigByNamespace={selected:{delayHero:!1,entryOffset:-.2},archive:{delayHero:!1,entryOffset:-.2},resources:{delayHero:!1,entryOffset:-.2},capabilities:{delayHero:!0,entryOffset:.1},info:{delayHero:!1,entryOffset:-.2}};
		function getEntryConfig(e){const a=e?.dataset?.barbaNamespace||e?.getAttribute?.("data-barba-namespace")||"";return entryConfigByNamespace[a]||{delayHero:!1,entryOffset:0}}
		function forceCloseMenus(e=document){document.querySelectorAll(".nav-primary-wrap").forEach((e=>{const r=e._menuTimeline,n=e._filterTimeline;r&&r.progress()>0&&r.timeScale(2).reverse(),n&&n.progress()>0&&n.timeScale(2).reverse(),e.querySelector(".menu-wrapper")?.style&&(e.querySelector(".menu-wrapper").style.display="none"),e.querySelector(".menu-container")?.style&&(e.querySelector(".menu-container").style.display="none"),e.querySelector(".filters-container")?.style&&(e.querySelector(".filters-container").style.display="none")})),document.body.style.overflow=""}
		async function finalizeAfterEntry(e){await new Promise((e=>requestAnimationFrame((()=>requestAnimationFrame((()=>setTimeout(e,30)))))));try{window.ScrollTrigger&&requestAnimationFrame((()=>ScrollTrigger.refresh(!0)))}catch{}}
		async function runEntryFlow(n,a){a=a||{};var t=!!a.withCoverOut;n.style&&(n.style.visibility=""),t&&await TransitionEffects.coverOut(),await InitManager.run(n,{preserveServicePins:!0});const{tl:e,entryOffset:i}=runPageEntryAnimations(n);await new Promise((t=>{e.call((()=>finalizeAfterEntry(n)),null,i+e.duration()),e.eventCallback("onComplete",t)}))}
		
		// Entry Animations
		var EntryAnimations = {};
		EntryAnimations.selected=function(e){e=e||document;var t=e.querySelector(".selected-container"),n=t&&t.querySelector(".selected-content"),i=gsap.timeline();if(!t||!n)return i;function r(){try{var e=[n].concat([].slice.call(n.querySelectorAll(".selected-item-outer")),[].slice.call(n.querySelectorAll(".appear-in-line")),[].slice.call(n.querySelectorAll(".selected-item-outer .selected-visual")),[].slice.call(n.querySelectorAll(".selected-item-outer .selected-item-header .headline-m")),[].slice.call(n.querySelectorAll(".selected-item-outer .selected-item-details")));e.length&&gsap.set(e,{visibility:"visible",opacity:1,clearProps:"visibility,opacity"}),document.documentElement.removeAttribute("data-preloading")}catch{}}function o(){var e=Math.max(document.documentElement.clientWidth,window.innerWidth||0),t=window.innerHeight||document.documentElement.clientHeight||0,r=[].slice.call(n.querySelectorAll(".selected-item-outer"));if(!r.length)return i;function o(e){if(e.__entryPrepared)return;var t=e.querySelector(".selected-visual"),n=e.querySelector(".selected-item-header .headline-m"),i=e.querySelector(".selected-item-details"),r=e.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:0,transformOrigin:"bottom center",opacity:0,willChange:"transform,opacity"}),n&&gsap.set(n,{opacity:0,willChange:"opacity,transform"}),i&&gsap.set(i,{opacity:0,height:0,willChange:"height,opacity"}),r.length&&gsap.set(r,{opacity:0,y:20,filter:"blur(10px)",willChange:"transform,opacity,filter"}),e.__entryPrepared=!0}r.forEach(o);var a=r.map(function(n){var i=n.getBoundingClientRect();return{el:n,rect:i,area:Math.max(0,Math.min(i.right,e)-Math.max(i.left,0))*Math.max(0,Math.min(i.bottom,t)-Math.max(i.top,0)),cx:(i.left+i.right)/2}}),l=a.filter(function(e){return e.area>1}).sort(function(e,t){return e.rect.left-t.rect.left});if(!l.length){var s=e/2;l=a.slice().sort(function(e,t){return Math.abs(e.cx-s)-Math.abs(t.cx-s)}).slice(0,2).sort(function(e,t){return e.rect.left-t.rect.left})}var d=new Set(l.map(function(e){return e.el}));a.forEach(function(e){if(e.el.__entryDone||d.has(e.el))return;var t=e.el.querySelector(".selected-visual"),n=e.el.querySelector(".selected-item-header .headline-m"),i=e.el.querySelector(".selected-item-details"),r=e.el.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:1,opacity:1}),n&&gsap.set(n,{opacity:1}),i&&gsap.set(i,{opacity:1,height:"auto"}),r.length&&gsap.set(r,{opacity:1,y:0,filter:"blur(0px)"}),e.el.__entryDone=!0}),l.forEach(function(e,t){var n=e.el;if(n.__entryDone)return;var r=n.querySelector(".selected-visual"),o=n.querySelector(".selected-item-header .headline-m"),a=n.querySelector(".selected-item-details"),l=n.querySelectorAll(".selected-item-details .body-s"),s=.14*t;r&&i.set(r,{opacity:1},s).to(r,{scaleY:1,duration:.75,ease:"power2.out"},s),o&&i.set(o,{opacity:1},s+.16).call(function(){var e=CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve();e.then(function(){if(window.SplitText&&window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){var e=splitAndMask(o);animateLines(e.lines).eventCallback("onComplete",function(){safelyRevertSplit(e,o)})}else gsap.to(o,{y:0,opacity:1,duration:.55,ease:"power2.out"})})},null,s+.16),a&&i.to(a,{opacity:1,height:"auto",duration:.4,ease:"power2.out"},s+.56),l.length&&i.to(l,{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"power2.out",stagger:.12},s+.56),n.__entryDone=!0});return i}function a(){return new Promise(function(e){requestAnimationFrame(function(){requestAnimationFrame(e)})})}function l(){r();return a().then(o)}if(t.hasAttribute("data-loop-ready"))l();else{var s=function e(){n.removeEventListener("selected:loop-ready",e,!0),l()};n.addEventListener("selected:loop-ready",s,!0),setTimeout(l,420)}return i};
		EntryAnimations.capabilities=function(e,t){e=e||document,t=t||{};var a=!!t.delayHero,o=gsap.timeline(),r=e.querySelector(".section-table-of-contents"),l=e.querySelector(".approach-mask"),i=e.querySelector(".section-hero .headline-lg"),n=e.querySelector(".section-hero .button-primary"),s=[].slice.call(e.querySelectorAll(".table-of-contents-item"));r&&gsap.set(r,{autoAlpha:0}),l&&(gsap.set(l,{scale:0,transformOrigin:"0% 100%",willChange:"transform"}),o.to(l,{scale:1,duration:1.2,ease:"power2.out"},0)),i&&(gsap.set(i,{autoAlpha:0}),o.addLabel("heroStart",a?0.2:0).set(i,{autoAlpha:1},"heroStart").call(function(){var e=window.CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve();e.then(function(){if(window.SplitText&&window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){var e=splitAndMask(i);animateLines(e.lines).eventCallback("onComplete",function(){safelyRevertSplit(e,i)})}else gsap.to(i,{y:0,opacity:1,duration:.6,ease:"power2.out"})})},null,"heroStart")),n&&(gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),o.fromTo(n,{autoAlpha:0,y:20,filter:"blur(10px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"heroStart+=0.4")),s.length&&o.from(s,{autoAlpha:0,paddingTop:"6rem",paddingBottom:"6rem",duration:1,ease:"power2.out",stagger:.15},0),r&&o.to(r,{autoAlpha:1,duration:.6,ease:"power2.out"},0);return o};
		EntryAnimations.info=function(e){e=e||document;var t=gsap.timeline(),o=e.querySelectorAll(".section-scroll-track .w-layout-cell"),a=e.querySelector(".section-hero .subpage-intro h1"),i=e.querySelector(".section-hero .subpage-intro a");return[].forEach.call(o,(function(e){gsap.set(e,{scaleY:0,transformOrigin:"bottom center"})})),t.to(o,{scaleY:1,duration:1,ease:"power2.out",stagger:{each:.15,from:"start"}},0),a&&(gsap.set(a,{autoAlpha:0}),t.set(a,{autoAlpha:1},.35).call((function(){(CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve()).then((function(){if(window.SplitText){var e=splitAndMask(a);animateLines(e.lines).eventCallback("onComplete",(function(){safelyRevertSplit(e,a)}))}else gsap.to(a,{y:0,opacity:1,duration:.6,ease:"power2.out"})}))}),null,.35)),i&&(gsap.set(i,{autoAlpha:0,y:20,filter:"blur(10px)"}),t.to(i,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},.6)),t};
		EntryAnimations.caseStudy=function(e){e=e||document;var t=gsap.timeline(),i=e.querySelector(".cs-hero-image"),r=e.querySelector(".cs-headline-wrapper"),a=e.querySelector("h1.cs-headline")||e.querySelector(".cs-headline"),n=e.querySelector(".cs-titles-inner .headline-m");i&&gsap.set(i,{autoAlpha:0,y:100,filter:"blur(10px)"}),r&&gsap.set(r,{autoAlpha:1,clearProps:"visibility"}),a&&gsap.set(a,{autoAlpha:0,display:"block",clearProps:"visibility"}),n&&gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),i&&t.to(i,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.7,ease:"power2.out"},0),a&&t.addLabel("cs_h",.15).set(r,{autoAlpha:1,clearProps:"visibility"},"cs_h").set(a,{autoAlpha:1,display:"block",clearProps:"visibility"},"cs_h").call(function(){var e=CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve();e.then(function(){if(window.SplitText&&window.splitAndMask&&window.animateLines&&window.safelyRevertSplit)try{var e=splitAndMask(a);animateLines(e.lines).eventCallback("onComplete",function(){safelyRevertSplit(e,a)})}catch(e){gsap.to(a,{y:0,autoAlpha:1,duration:.6,ease:"power2.out"})}else gsap.to(a,{y:0,autoAlpha:1,duration:.6,ease:"power2.out"})})},null,"cs_h"),n&&t.to(n,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.5,ease:"power2.out"},"cs_h+=0.6");return t};
		function runPageEntryAnimations(e){const{delayHero:t,entryOffset:r}=getEntryConfig(e),a=gsap.timeline();return"info"===e.dataset.barbaNamespace&&a.add(EntryAnimations.info(e),0),e.querySelector(".section-table-of-contents")&&a.add(EntryAnimations.capabilities(e,{delayHero:t}),0),e.querySelector(".selected-item-outer")&&a.add(EntryAnimations.selected(e),0),(e.querySelector(".cs-hero-image")||e.querySelector(".cs-headline"))&&a.add(EntryAnimations.caseStudy(e),0),{tl:a,entryOffset:r}}
		
		// Barba init
		function init() {
			if (window.__barbaInited) return;
			window.__barbaInited = true;
		
			if (typeof logBarbaSanity === 'function') logBarbaSanity();
		
			barba.init({
				debug: window.DEBUG,
				timeout: 8000,
				prevent: ({ el }) => {
					const a = el && (el.tagName === 'A' ? el : el.closest('a'));
					if (!a) return false;
					try {
						const url = new URL(a.getAttribute('href') || a.href, location.href);
						const samePath = url.pathname.replace(/\/+$/,'') === location.pathname.replace(/\/+$/,'');
						if (samePath && url.hash) return true;
					} catch {}
					if (a.hasAttribute('download') || a.target === '_blank' || a.getAttribute('rel') === 'external') return true;
					const ns = document.querySelector('[data-barba="container"]')?.dataset?.barbaNamespace || '';
					if (ns !== 'archive' && ns !== 'resources') {
						const blocker = a.closest('[data-barba-prevent]');
						if (blocker && blocker.getAttribute('data-barba-prevent') === 'true') return true;
					}
					return false;
				},
				transitions: [
					{
						name: 'initial-preloader',
						once: async ({ next }) => {
							// PreloaderService.enable(true) // enable when needed
							if (PreloaderService.shouldRun()) { await PreloaderService.maybeRun(); }
							await runEntryFlow(next.container);
							document.documentElement.removeAttribute('data-preloading');
							WebflowAdapter.reinit();
							if (!location.hash) window.scrollTo(0, 0);
						}
					},{
						name: 'fade',
						from: { namespace: ['selected','archive','resources'] },
						to: { namespace: ['selected','archive','resources'] },
						async leave({ current }) {
							NavigationManager?.setLock('overlay', true);
							window.__logTransitionChoice && window.__logTransitionChoice('fade', arguments[0]);
							await ScrollState.saveAsync();
							await gsap.to(current.container, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' });
							CoreUtilities.InitManager.cleanup();
							current.container.remove();
						},
						async enter({ next }) {
							WebflowAdapter.reset({ next });
							NavigationManager?.setLock('overlay', false);
							const entries = performance.getEntriesByType('navigation');
							const isHistory = entries.length ? entries[0].type === 'back_forward' : false;
							if (isHistory) {
								const pos = ScrollState.read();
								if (pos) window.scrollTo(pos.x, pos.y);
							} else if (!location.hash) {
								window.scrollTo(0, 0);
							}
							await runEntryFlow(next.container, { withCoverOut: false });
							document.documentElement.removeAttribute('data-preloading');
						},
						afterEnter({ next }) {
							requestAnimationFrame(() => WebflowAdapter.reinit());
							requestAnimationFrame(() => {
								const h1 = next.container.querySelector('h1, [role="heading"][aria-level="1"]');
								if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); setTimeout(() => h1.removeAttribute('tabindex'), 0); }
							});
							next.container.querySelectorAll('video[autoplay]').forEach(v => { v.muted = true; v.play().catch(()=>{}); });
						}
					},{
						name: 'swipe',
						custom({ current, next }) {
							const work = ['selected','archive','resources'];
							return !(work.includes(current?.namespace) && work.includes(next?.namespace));
						},
						async leave({ current }) {
							NavigationManager?.setLock('overlay', true);
							window.__logTransitionChoice && window.__logTransitionChoice('swipe', arguments[0]);
							document.body.style.overflow = '';
							await ScrollState.saveAsync();
							const ok = await TransitionEffects.coverIn();
							if (!ok) { await gsap.to(current.container, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }); }
							CoreUtilities.InitManager.cleanup();
							current.container.remove();
						},
						async enter({ next }) {
							WebflowAdapter.reset({ next });
							NavigationManager?.setLock('overlay', false);
							const entries = performance.getEntriesByType('navigation');
							const isHistory = entries.length ? entries[0].type === 'back_forward' : false;
							if (isHistory) {
								const pos = ScrollState.read();
								if (pos) window.scrollTo(pos.x, pos.y);
							}
							if (!location.hash) window.scrollTo(0, 0);
							await TransitionEffects.coverOut();
							await runEntryFlow(next.container, { withCoverOut: false });
							document.documentElement.removeAttribute('data-preloading');
						},
						afterEnter({ next }) {
							EntryOrchestrator?.forceCloseMenus?.();
							requestAnimationFrame(() => WebflowAdapter.reinit());
							requestAnimationFrame(() => {
								const h1 = next.container.querySelector('h1, [role="heading"][aria-level="1"]');
								if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); setTimeout(() => h1.removeAttribute('tabindex'), 0); }
							});
							next.container.querySelectorAll('video[autoplay]').forEach(v => { v.muted = true; v.play().catch(()=>{}); });
						}
					}
				]
			});
		
			// keep your probes/sanity after barba init
			if (typeof installDebugProbes === 'function') installDebugProbes();
			if (typeof logBarbaSanity    === 'function') logBarbaSanity();
		}
		
		return {
			init,
			getEntryConfig,
			forceCloseMenus,
			finalizeAfterEntry,
			runEntryFlow,
			EntryAnimations,
			runPageEntryAnimations,
		};
	})();


// Debug Core
	window.DebugCore = window.DebugCore || (function () {
		function logBarbaSanity(){try{const e=document.querySelector('[data-barba="container"]')?.getAttribute("data-barba-namespace")||"(none)",o=!!document.querySelector(".page-overlay"),t=["selected","archive","resources"];console.group("%c[Sanity] Page state","color:#0aa; font-weight:bold"),console.log("Namespace:",e),console.log("Overlay present:",o);[["/new-index","selected"],["/archive","archive"],["/resources","resources"],["/capabilities","capabilities"],["/info","info"]].forEach((([e,o])=>{const t=[...document.querySelectorAll(`a[href*="${e}"]`)];t.length&&(console.groupCollapsed(`Links → ${o} (${t.length})`),t.forEach(((e,o)=>{const t=e.closest("[data-barba-prevent]"),r=t?.getAttribute("data-barba-prevent");console.log(`#${o+1}`,{text:(e.textContent||"").trim().slice(0,60),href:e.getAttribute("href")||e.href,hasPreventAncestor:!!t,preventValue:r??null})})),console.groupEnd())})),console.log("Work set:",t.join(", ")," | work→work should be FADE, others SWIPE"),console.groupEnd()}catch(e){console.warn("[Sanity] Failed:",e)}}
		function installDebugProbes(){if(window.barba&&!barba.__preventWrapped&&barba.options&&"function"==typeof barba.options.prevent){const e=barba.options.prevent;barba.options.prevent=t=>{const a=e(t);if(a){const e=t.el&&("A"===t.el.tagName?t.el:t.el.closest?.("a"));console.warn("[barba][prevent] blocked",{text:e?(e.textContent||"").trim().slice(0,80):null,href:e?e.getAttribute("href")||e.href:null,el:e})}return a},barba.__preventWrapped=!0}window.__linkProbeInstalled||(document.addEventListener("click",(e=>{const t=e.target&&("A"===e.target.tagName?e.target:e.target.closest?.("a"));if(!t)return;const a=t.closest("[data-barba-prevent]"),n=a?.getAttribute("data-barba-prevent");console.log("[link]",{href:t.getAttribute("href")||t.href,text:(t.textContent||"").trim().slice(0,80),hasPreventAncestor:!!a,preventValue:n??null})}),!0),window.__linkProbeInstalled=!0),window.__logTransitionChoice||(window.__logTransitionChoice=(e,t)=>{const a=t?.current?.container?.dataset?.barbaNamespace||"(none)",n=t?.next?.container?.dataset?.barbaNamespace||"(none)";console.info(`[transition] ${e}`,{from:a,to:n})}),window.barba&&barba.hooks&&!window.__barbaHooksInstalled&&(barba.hooks.before((({current:e,next:t})=>{const a=e?.container?.dataset?.barbaNamespace||"(none)",n=t?.container?.dataset?.barbaNamespace||"(none)";console.group("%c[barba] navigating","color:#6a0dad; font-weight:bold"),console.log("from → to:",a,"→",n),console.groupEnd()})),barba.hooks.after((()=>setTimeout(logBarbaSanity,0))),window.__barbaHooksInstalled=!0)}
		function install(){if(window.DEBUG){if(window.__debugCoreErrors||(window.addEventListener("error",(e=>console.error("[Error]",e.message,e.filename,e.lineno,e.error))),window.addEventListener("unhandledrejection",(e=>console.error("[Unhandled Rejection]",e.reason))),window.__debugCoreErrors=!0),window.dlog||(window.dlog=(...e)=>console.debug("[DEBUG]",...e)),window.ScrollTrigger&&!window.__debugCoreST){try{ScrollTrigger.defaults({markers:!0})}catch{}try{ScrollTrigger.config({ignoreMobileResize:!0})}catch{}window.__debugCoreST=!0}installDebugProbes(),setTimeout(logBarbaSanity,0)}}
		function probes () { installDebugProbes(); }
		function sanity () { logBarbaSanity(); }
		window.logBarbaSanity     = logBarbaSanity;
		window.installDebugProbes = installDebugProbes;
		
		return {
			install,
			probes,
			sanity
		};
	})();

	
!function(){
	function boot() {
		ScrollState.init({ maxAgeMs: 30 * 60 * 1000 });
		addEventListener('pagehide', () => { try { ScrollState.save(); } catch {} }, { capture: true });
		addEventListener('visibilitychange', () => {if (document.hidden) {try { ScrollState.save(); } catch {}}}, { capture: true });
		NavigationManager.init({ debug: DEBUG });
		NavigationManager.ensureBarbaClickRouting();
		DebugCore.install();
		EntryOrchestrator.init();
	}
	if (document.readyState !== "loading") boot();
	else document.addEventListener("DOMContentLoaded", boot, { once: true });
}();

})();
}

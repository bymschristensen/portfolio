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
		function isInternalAnchor(e){if(!e||"A"!==e.tagName)return null;var t=(e.getAttribute("href")||"").trim();if(!t||"#"===t||/^javascript:/i.test(t))return null;if(e.hasAttribute("download"))return null;var r=e.getAttribute("target");if(r&&"_self"!==r)return null;if(/^(mailto|tel):/i.test(t))return null;var n;try{n=new URL(t,location.href)}catch(a){return null}return n.origin!==location.origin?null:{el:e,url:n,href:n.href,hash:n.hash,path:n.pathname,search:n.search}}
		function installLinkInterceptor(){state.installed||(state.clickHandler=t=>{if(t.defaultPrevented)return;if(t.target&&t.target.closest&&t.target.closest('[id^="archive-filter-"],[id^="nav-archive-filter-"],.modal-filters-item,.filters-container,.nav-button-filter,.archive-switch-block,.archive-switch,.archive-switch-dot'))return;const e=t.target&&("A"===t.target.tagName?t.target:t.target.closest?.("a"));if(!e)return;{const t=(e.getAttribute("href")||"").trim();if(!t||"#"===t||/^javascript:/i.test(t))return}const r=document.querySelector('[data-barba="container"]')?.dataset?.barbaNamespace||"";if("info"===r&&t.target?.closest('a[id^="recommendationsOpen"]'))return;if(t.target?.closest('.nav-button-menu,.nav-button-close-case,[data-router-ignore="true"]'))return;const a=isInternalAnchor(e);if(a){if("archive"!==r&&"resources"!==r){const t=a.el.closest("[data-barba-prevent]");if(t&&"true"===t.getAttribute("data-barba-prevent"))return}if(state.locks.size)return dlog("blocked by lock(s):",[...state.locks]),t.preventDefault(),t.stopPropagation(),void t.stopImmediatePropagation();t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),console.info("[intercept→barba]",a.url.href,"locks:",[...state.locks]),window.barba?.go?barba.go(a.url.href):location.href=a.url.href}},addEventListener("click",state.clickHandler,{capture:!0}),state.installed=!0,dlog("link interceptor installed"))}
		function setLock(t,c){t&&(c?state.locks.add(t):state.locks.delete(t),dlog(c?"lock +":"lock -",t,"| active:",[...state.locks]))}
		function isLocked() { return state.locks.size > 0; }
		function reason() { return [...state.locks]; }
		function init({debug:i=!1}={}){state.debug=!!i,dlog("init")}
		function attachMenuLocks(e=document){e.querySelectorAll(".nav-primary-wrap").forEach(e=>{var t=e._menuTimeline,r=e._filterTimeline;function n(e,t){if(!e||e.__navLockHooked)return;e.__navLockHooked=1;var r=function(t,r){var n=e.eventCallback(t);e.eventCallback(t,function(){try{n&&n.apply(this,arguments)}catch(e){}try{r&&r.apply(this,arguments)}catch(e){}})};r("onStart",function(){NavigationManager.setLock(t,!0)}),r("onReverse",function(){NavigationManager.setLock(t,!0)}),r("onComplete",function(){NavigationManager.setLock(t,!1)}),r("onReverseComplete",function(){NavigationManager.setLock(t,!1)})}n(t,"menu"),n(r,"filter")})}
		
		return {
			init,
			installLinkInterceptor,
			setLock,
			isLocked,
			reason,
			attachMenuLocks,
			ensureBarbaClickRouting: installLinkInterceptor,
		};
	})();

// Webflow Adapter
	window.WebflowAdapter = (function () {
		function syncHead(t){try{if(!t||!t.html)return;const e=(new DOMParser).parseFromString(t.html,"text/html"),a=e.querySelector("html")?.getAttribute("data-wf-page")||null;a?document.documentElement.setAttribute("data-wf-page",a):document.documentElement.removeAttribute("data-wf-page");const n=e.querySelector("script[data-wf-site-data]")?.textContent||null;if(document.querySelectorAll("script[data-wf-site-data]").forEach((t=>{try{t.remove()}catch{}})),n){const t=document.createElement("script");t.type="application/json",t.setAttribute("data-wf-site-data",""),t.textContent=n,document.head.appendChild(t)}}catch(t){console.warn("[WebflowAdapter.syncHead] failed:",t)}}
		function reset({next:e}){syncHead(e)}
		function reinit(r){try{if(!window.Webflow)return;try{Webflow.destroy&&Webflow.destroy()}catch(e){}try{Webflow.ready&&Webflow.ready()}catch(e){}try{if(Webflow.require){var ix=Webflow.require("ix2");ix&&(ix.destroy&&ix.destroy(),ix.init&&ix.init())}}catch(e){}try{if(Webflow.require){["commerce","lightbox","slider","tabs","dropdown","navbar"].forEach(function(k){try{var m=Webflow.require(k);m&&(m.destroy&&m.destroy(),m.ready&&m.ready(),m.init&&m.init(),m.redraw&&m.redraw())}catch(e){}})}}catch(e){} }catch(e){console.warn("[WebflowAdapter.reinit] failed:",e,r||"")}}
		function reparent(e){(e=e||document).querySelectorAll("[data-child]").forEach((t=>{if(t.matches(".w-tab-link, .w-tab-pane"))return;const a=t.getAttribute("data-child");let r=e.querySelector(`[data-parent="${a}"]`)||document.querySelector(`[data-parent="${a}"]`);r&&t.parentNode!==r&&r.appendChild(t)}))}
		async function enter(n){
			try{
				reset({next:n});
				reparent(n.container||document);
				await new Promise(e=>requestAnimationFrame(e));
				await new Promise(e=>requestAnimationFrame(e));
				reinit("enter");
				await new Promise(e=>requestAnimationFrame(e));
				await new Promise(e=>requestAnimationFrame(e));
			}catch(e){
				console.warn("[WebflowAdapter.enter] failed:",e);
			}
		}
		return {
			reset,
			reinit,
			reparent,
			enter,
		};
	})();

// Core Utilities
	window.CoreUtilities = (function () {
		const state={gsapObservers:[],domObservers:[],tickers:[],cursorDestroy:null};
		const Observers={state:{dom:[],gsap:[],tickers:[]},addDom:function(o){return o&&this.state.dom.push(o),o},addGsap:function(o){return o&&this.state.gsap.push(o),o},addTicker:function(fn){return window.gsap&&typeof fn=="function"&&(gsap.ticker.add(fn),this.state.tickers.push(fn)),fn},clearAll:function(opts){opts=opts||{};var keepPins=!!opts.preserveServicePins;try{if(window.ScrollTrigger){ScrollTrigger.getAll().forEach(function(st){var keep=!1;if(keepPins){if(st.id&&0===st.id.indexOf("servicePin:"))keep=!0;else if(st.trigger&&st.trigger.classList&&st.trigger.classList.contains("section-single-service"))keep=!0;}keep||st.kill();});}}catch(e){}try{Observers.state.dom.forEach(function(obs){obs.disconnect&&obs.disconnect();});Observers.state.dom=[];}catch(e){}try{Observers.state.gsap.forEach(function(obs){obs.kill&&obs.kill();});Observers.state.gsap=[];}catch(e){}try{Observers.state.tickers.forEach(function(fn){window.gsap&&gsap.ticker&&gsap.ticker.remove&&gsap.ticker.remove(fn);});Observers.state.tickers=[];}catch(e){}}};
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
		function nsOf(a){return a===document?document.querySelector('[data-barba="container"]')?.dataset?.barbaNamespace||"":a?.dataset?.barbaNamespace||a.getAttribute?.("data-barba-namespace")||""}
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
				init: async()=>{const K="siteTheme",mq=matchMedia&&matchMedia("(prefers-color-scheme: dark)");let t=localStorage.getItem(K);if(!t&&mq&&mq.matches)t="dark";document.documentElement.setAttribute("data-theme",t||"light");mq&&mq.addEventListener&&mq.addEventListener("change",e=>{if(localStorage.getItem(K))return;document.documentElement.setAttribute("data-theme",e.matches?"dark":"light")});addEventListener("storage",e=>{e.key===K&&document.documentElement.setAttribute("data-theme",e.newValue||"light")});}
			}),
				
			feature({
				id: "themeSwitch",
				stage: "main",
				namespaces: "*",
				selectors: [".theme-switch"],
				init: async()=>{const K="siteTheme",t=[...document.querySelectorAll(".theme-switch,[data-theme-toggle='theme']")];if(!t.length)return;const n=()=>document.documentElement.getAttribute("data-theme")||localStorage.getItem(K)||"light",p=e=>e.classList.toggle("dark","dark"===n());t.forEach(e=>{if(e._themeBound)return;e._themeBound=1,p(e);const r=()=>{var s="dark"===n()?"light":"dark";document.documentElement.setAttribute("data-theme",s);localStorage.setItem(K,s);t.forEach(p)};e.addEventListener("click",r);e._unbind=()=>e.removeEventListener("click",r)});addEventListener("storage",e=>{e.key===K&&(document.documentElement.setAttribute("data-theme",e.newValue||"light"),t.forEach(p))});}
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
				init:async r=>{try{const n=r?.dataset?.barbaNamespace||r.getAttribute?.("data-barba-namespace")||"",D=document;D.querySelectorAll(".nav-primary-wrap").forEach(w=>{if(w.__navReady)return;w.__navReady=!0;const b=w.querySelector(".nav-button-menu"),L=w.querySelector(".nav-button-text"),P=w.querySelector(".phone-number"),m=w.querySelectorAll(".button-minimal-darkmode"),k=w.querySelectorAll(".menu-link"),T=w.querySelector(".ta-one-menu"),B=w.querySelector(".menu-wrapper"),C=w.querySelector(".menu-container"),F=w.querySelector(".nav-button-filter"),K=w.querySelector(".filters-container"),I=w.querySelectorAll(".modal-filters-item"),M=w.querySelector(".modal-filters-caption"),Y=w.querySelector(".filter-line-1"),E=w.querySelector(".filter-line-2");if(!b||!L||!B||!C){w._menuTimeline=null;w._filterTimeline=null;return}const H=t=>{try{document.body.style.overflow=t?"hidden":""}catch{}},N=()=>{try{C&&(C.style.display="none",C.removeAttribute("data-open"));B&&(B.style.display="none",B.removeAttribute("data-open"));L&&L.dataset&&L.dataset.orig&&(L.textContent=L.dataset.orig);q=!1;T&&delete T.__menuHeadlineDone;H(!1)}catch{}},z=()=>{try{K&&(K.style.display="none",K.removeAttribute("data-open"));B&&(B.style.display="none",B.removeAttribute("data-open"));H(!1)}catch{}};B.style.display="none";C.style.display="none";K&&(K.style.display="none");L.dataset.orig=L.textContent||"Menu";let q=!1;function G(){if(!T||q)return;q=!0;requestAnimationFrame(()=>{requestAnimationFrame(()=>{try{if(window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){const s=splitAndMask(T);animateLines(s.lines).eventCallback("onComplete",()=>{safelyRevertSplit(s,T),T.__menuHeadlineDone=!0})}else gsap.fromTo(T,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.6,ease:"power2.out"})}catch(e){gsap.set(T,{autoAlpha:1,clearProps:"y"})}})})}const U=()=>{B.style.display="flex",C.style.display="flex",B.setAttribute("data-open","1"),C.setAttribute("data-open","1"),H(!0)},V=()=>{B.style.display="flex",B.setAttribute("data-open","1"),K&&(K.style.display="flex",K.setAttribute("data-open","1")),H(!0)},x=gsap.timeline({paused:!0});x.add(G,.05);P&&x.from(P,{opacity:0,duration:.35},">");m.length&&x.from(m,{opacity:0,duration:.35,stagger:.12},"<");k.length&&x.from(k,{opacity:0,yPercent:240,duration:.4,stagger:.1},"<");x.to(L,{text:"Close",duration:.2},"<");x.eventCallback("onReverseComplete",N);let a=null;const X=(t,h)=>{a&&gsap.ticker.remove(a),a=()=>{if(!t.reversed())return;(t.time()<=.02||t.progress()<=.02||!t.isActive())&&(h(),gsap.ticker.remove(a),a=null)},gsap.ticker.add(a),gsap.delayedCall(.6,()=>{t.reversed()&&(h(),a&&(gsap.ticker.remove(a),a=null))})};let o=null;const O=()=>{o="menu",U(),x.timeScale(1).play(0)},R=()=>{x.timeScale(2).reverse(),X(x,N),o=null},A=()=>{"menu"===o?R():"filter"===o&&d?(d.timeScale(2).reverse(),X(d,z),gsap.delayedCall(.02,O)):O()};b.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),A()},{passive:!1});let d=null;if(F&&K&&I.length){n==="archive"?(F.style.display="flex",gsap.to(F,{opacity:1,duration:.2})):gsap.to(F,{opacity:0,duration:.2,onComplete:()=>{F.style.display="none"}});d=gsap.timeline({paused:!0}).to(K,{opacity:1,duration:.35,ease:"power2.out"},0);Y&&d.to(Y,{rotation:45,transformOrigin:"center",duration:.3},0);E&&d.to(E,{rotation:-45,marginTop:"-4px",transformOrigin:"center",duration:.3},0);M&&d.from(M,{opacity:0,duration:.4},"<");I.length&&d.from(I,{opacity:0,duration:.6,stagger:.15},"<");d.eventCallback("onReverseComplete",z);const S=()=>{o="filter",V(),d.timeScale(1).play(0)},J=()=>{d.timeScale(2).reverse(),X(d,z),o=null};F.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),"filter"===o?J():"menu"===o?(R(),gsap.delayedCall(.02,S)):S()},{passive:!1});const Q=e=>{try{const t=e.target&&e.target.closest?e.target.closest('[id^="nav-archive-filter-"],[id^="archive-filter-"],.modal-filters-item'):null;if(!t)return;let h=t.id||"";if(!h){const r=t.getAttribute&&t.getAttribute("data-filter");r&&(h="nav-archive-filter-"+r)}if(!h||h.indexOf("archive-filter-")===-1&&h.indexOf("nav-archive-filter-")===-1)return;const s=(h||"").replace(/^nav-archive-filter-/,"").replace(/^archive-filter-/,"").trim();if(!s)return;D.dispatchEvent(new CustomEvent("archive:filter",{bubbles:!0,detail:{filter:s,source:"modal"}}));"filter"===o&&d&&d.progress()>0&&(d.timeScale(2).reverse(),X(d,z),o=null)}catch{}};K.addEventListener("click",Q,{passive:!0});w.__navFilterClick=Q}const y=e=>{"Escape"===e.key&&("menu"===o?R():"filter"===o&&d&&d.progress()>0&&d.timeScale(2).reverse())};D.addEventListener("keydown",y);const _=e=>{if(!B.contains(e.target))return;"menu"===o&&x.progress()>0&&R();"filter"===o&&d&&d.progress()>0&&d.timeScale(2).reverse()};B.addEventListener("click",_,{passive:!0});k.forEach(t=>{t.addEventListener("click",()=>{"menu"===o&&R()},{passive:!0})});const Z=()=>{x.progress()>0&&x.timeScale(2).reverse(),d&&d.progress()>0&&d.timeScale(2).reverse(),N(),z(),o=null};Z();w._menuTimeline=x;w._filterTimeline=d||null});NavigationManager.attachMenuLocks(document)}catch(e){console.warn("[navigation:init] failed",e)}}
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
				id: "accordions",
				stage: "main",
				namespaces: "*",
				selectors: [".accordion-list"],
				init: async r=>{r=r||document;const L=[...r.querySelectorAll(".accordion-list")];if(!L.length||!window.gsap)return;const ns=r.dataset?.barbaNamespace||r.getAttribute?.("data-barba-namespace")||document.querySelector('[data-barba="container"]')?.dataset?.barbaNamespace||"";L.forEach(l=>{const A=[...l.querySelectorAll(".accordion-subservice,.accordion-mindset,.accordion-quote")];if(!A.length)return;const wantsRefresh=!!l.closest("[data-acc-refresh='1']");let t=0;const after=()=>{if(!window.ScrollTrigger)return;cancelAnimationFrame(t);t=requestAnimationFrame(()=>{try{ns!=="capabilities"&&wantsRefresh?ScrollTrigger.refresh():ScrollTrigger.update()}catch{}})};A.forEach(it=>{if(it._accB)return;it._accB=1;const h=it.querySelector(".accordion-header"),c=it.querySelector(".accordion-content"),x=it.querySelector(".cross-line-animating"),qi=it.querySelector(".accordion-icon-quote"),q=it.classList.contains("accordion-quote");if(!h||!c)return;h.classList.remove("accordion-active");gsap.set(c,{height:0,opacity:0,overflow:"hidden",paddingTop:q?0:null,paddingBottom:0});qi&&gsap.set(qi,{opacity:0});const tl=gsap.timeline({paused:1,defaults:{ease:"power2.out"}}).to(h,{paddingTop:"2rem",duration:.4},0).to(x,{rotation:0,duration:.3},0).to(c,{height:"auto",opacity:1,duration:.45},0).to(c,{paddingTop:q?"2rem":null,paddingBottom:q?"0rem":"2rem",duration:.35},0).to(qi||{}, {opacity:1,duration:.35},0);it._accTL=tl;const close=()=>{if(!h.classList.contains("accordion-active"))return;h.classList.remove("accordion-active");tl.reverse().eventCallback("onReverseComplete",after)};const open=()=>{if(h.classList.contains("accordion-active"))return;h.classList.add("accordion-active");tl.play().eventCallback("onComplete",after)};it.addEventListener("click",e=>{const a=e.target&&e.target.closest&&e.target.closest("a");if(a)return;const btn=e.target&&e.target.closest&&e.target.closest("button");if(btn&&btn.type==="submit")return;e.preventDefault();if(tl.isActive())return;const isOpen=h.classList.contains("accordion-active");A.forEach(o=>{if(o!==it&&o._accTL){const oh=o.querySelector(".accordion-header");oh&&oh.classList.contains("accordion-active")&&o._accTL&&!o._accTL.isActive()&&(oh.classList.remove("accordion-active"),o._accTL.reverse())}});isOpen?close():open()},{passive:!1})})})}
			}),
			
			feature({
				id: 'customCursor',
				stage: 'late',
				namespaces: '*',
				selectors: [],
				init: async r=>{if(window.__CC_LOCK)return window.__customCursorDestroy||(()=>{});window.__CC_LOCK=1;try{window.__customCursorDestroy&&window.__customCursorDestroy()}catch{}try{document.getElementById("cc-webgl")?.remove(),document.getElementById("cc-dom")?.remove()}catch{}if(!matchMedia("(pointer:fine)").matches||!matchMedia("(hover:hover)").matches)return document.body.classList.remove("cursor--disable-all-cursors"),window.__customCursorDestroy=()=>{},CoreUtilities.Cursor.setDestroy(window.__customCursorDestroy),window.__CC_LOCK=0,window.__customCursorDestroy;const c=document.createElement("canvas");c.className="cursor-webgl",c.id="cc-webgl",document.body.appendChild(c);const a=c.getContext("2d"),w=document.createElement("div");w.className="custom-cursor",w.id="cc-dom";const k=document.createElement("div");k.className="cursor-label cursor-label--right",k.setAttribute("aria-hidden","true");const B=document.createElement("div");B.className="cursor-label__inner";const C=document.createElement("div");C.className="cursor-label__text",B.appendChild(C),k.appendChild(B),w.appendChild(k),document.body.appendChild(w);const W=innerWidth/2,H=innerHeight/2,p={x:W,y:H,tx:W,ty:H},Q=gsap.quickSetter(w,"x","px"),K=gsap.quickSetter(w,"y","px");gsap.set(w,{x:p.x,y:p.y,scale:1,opacity:0,transformOrigin:"center center",pointerEvents:"none"}),gsap.set(k,{autoAlpha:0,willChange:"transform,clip-path,opacity"}),gsap.set(B,{display:"block"});let L=0,E=0;function R(){L=innerWidth,E=innerHeight,c.width=L,c.height=E}R();const h=Array.from({length:40},()=>({x:p.x,y:p.y,vx:0,vy:0})),S={s:1};let I=null,T=null,b=null,N=null,A=!1,O=!1;const U=.01,V=.005;let i=p.x,l=p.y;function J(){clearTimeout(N),N=setTimeout(Z,1e4)}function G(){const e=document.documentElement;i=(.25+.5*Math.random())*e.clientWidth,l=(.25+.5*Math.random())*e.clientHeight}function Z(){if(A||O)return;A=!0,G();const e=()=>{A&&!O&&(Math.random()<V&&G(),p.tx+=(i-p.tx)*U,p.ty+=(l-p.ty)*U,b=requestAnimationFrame(e))};b=requestAnimationFrame(e)}function x(){A=!1,b&&cancelAnimationFrame(b),b=null}const ht=(e,t,n)=>Math.max(t,Math.min(n,e)),yt=t=>t.split("").map(e=>`<span class="cc-char" style="display:inline-block;will-change:transform,opacity">${" "===e?"&nbsp;":e}</span>`).join("");let P=0,M=0,vx=0,vy=0,mt=0,gt=0,ut=!1,dt=10,ct="",_wantLeft=!1,_switching=!1,_textAnimating=!1,_active=null,_hideTO=null;const TH_ON=.85,TH_OFF=.8,HIDE_DELAY=40;function _hideClip(e){return e?"inset(0% 0% 0% 100%)":"inset(0% 100% 0% 0%)"}function _showClip(){return"inset(0% 0% 0% 0%)"}function _setSide(e){k.classList.toggle("cursor-label--left",!!e),k.classList.toggle("cursor-label--right",!e),k.style.setProperty("--cc-origin",e?"right top":"left top")}function _sideIsLeft(){return k.classList.contains("cursor-label--left")}function _calcSide(){const x=p.tx||0,w=innerWidth||1;return _wantLeft?x>w*TH_OFF:x>w*TH_ON}function _ensureText(){(C.textContent||"").trim()||(C.innerHTML=yt(ct||"Hover something"))}function _revealLabel(e){if(ut&&e===ct)return;const t=_calcSide();_wantLeft=t,_setSide(t),ct=e||ct||"Hover something",_ensureText();const n=t,o=C.querySelectorAll(".cc-char");gsap.killTweensOf(o),gsap.killTweensOf(k),_textAnimating=!0,gsap.set(k,{autoAlpha:1,clipPath:_hideClip(n)}),gsap.to(k,{clipPath:_showClip(),duration:.34,ease:"power3.out",overwrite:!0});C.innerHTML=yt(ct);const s=C.querySelectorAll(".cc-char");gsap.set(s,{y:10,opacity:0}),gsap.to(s,{y:0,opacity:1,duration:.32,ease:"power3.out",delay:.05,overwrite:!0,stagger:{each:.016,from:n?"end":"start"},onComplete:()=>{_textAnimating=!1}}),ut=!0}function _swapText(e){e=(e||"").trim()||"Hover something";if(!ut)return _revealLabel(e);if(e===ct)return;ct=e;const t=_sideIsLeft(),n=C.querySelectorAll(".cc-char");gsap.killTweensOf(n),_textAnimating=!0;const o=gsap.timeline({overwrite:!0,onComplete:()=>{_textAnimating=!1}});o.to(n,{y:10,opacity:0,duration:.16,ease:"power2.in",stagger:{each:.01,from:t?"start":"end"}}).add(()=>{C.innerHTML=yt(ct)}).set(C.querySelectorAll(".cc-char"),{y:10,opacity:0}).to(C.querySelectorAll(".cc-char"),{y:0,opacity:1,duration:.26,ease:"power3.out",stagger:{each:.014,from:t?"end":"start"}})}function _hideLabel(){if(!ut)return;ut=!1,_switching=!1,_textAnimating=!1;const e=_sideIsLeft(),t=C.querySelectorAll(".cc-char");gsap.killTweensOf(t),gsap.killTweensOf(k);gsap.to(t,{y:10,opacity:0,duration:.14,ease:"power2.in",overwrite:!0,stagger:{each:.01,from:e?"start":"end"}});gsap.to(k,{clipPath:_hideClip(e),duration:.2,ease:"power2.in",overwrite:!0,onComplete:()=>{gsap.set(k,{autoAlpha:0})}})}function _animateSideSwitch(e){const t=_sideIsLeft(),n=!!e;if(t===n||_switching||!ut)return;_switching=!0,_ensureText(),gsap.killTweensOf(k);const chars=C.querySelectorAll(".cc-char");gsap.to(k,{clipPath:_hideClip(t),duration:_textAnimating?0.12:0.16,ease:"power2.in",overwrite:!0,onComplete:()=>{_setSide(n),gsap.set(k,{clipPath:_hideClip(n),autoAlpha:1}),gsap.to(k,{clipPath:_showClip(),duration:_textAnimating?0.18:0.26,ease:"power3.out",overwrite:!0});chars.length&&gsap.fromTo(chars,{y:6,opacity:0},{y:0,opacity:1,duration:_textAnimating?0.16:0.22,ease:"power2.out",overwrite:!0,stagger:{each:.01,from:n?"end":"start"}});_switching=!1}})}const Dt=e=>{if(O)return;x(),J();const t=e.clientX,n=e.clientY;vx=t-P,vy=n-M,P=t,M=n,mt=ht(1.2*vx,-42,42),gt=ht(1.2*vy,-42,42),p.tx=t,p.ty=n},Ft=()=>{document.hidden?x():J()};function _clearHide(){_hideTO&&(clearTimeout(_hideTO),_hideTO=null)}function _scheduleHide(){_clearHide(),_hideTO=setTimeout(()=>{_hideTO=null,_active=null,_hideLabel(),w.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),gsap.to(w,{scale:1,opacity:1,duration:.25,ease:"power2.out",overwrite:!0}),gsap.to(S,{s:1,duration:.25,ease:"power2.out",overwrite:!0})},HIDE_DELAY)}const qt=e=>{if(O)return;x(),J();const t=e.target.closest("[data-cursor]");if(!t)return void(!_active&&_hideLabel());if(t===_active)return void _clearHide();_clearHide(),_active=t;const n=(t.dataset.cursor||"").toLowerCase();if("hide"===n)return w.classList.add("cursor--hide"),document.body.classList.add("cursor--disable-all-cursors"),gsap.set(w,{scale:0,opacity:0,overwrite:!0}),void gsap.set(S,{s:0,overwrite:!0});w.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors");let o=1;if("scaleup"===n)o=3,w.classList.add("cursor--scaleup"),_hideLabel();else if("text"===n){const e=((t.dataset.cursorText||t.dataset.text||"")+"").trim();ut?_swapText(e||"Hover something"):_revealLabel(e||"Hover something"),o=1}else _hideLabel();gsap.to(w,{scale:o,opacity:1,duration:.25,ease:"power2.out",overwrite:!0}),gsap.to(S,{s:o,duration:.25,ease:"power2.out",overwrite:!0})},Mt=e=>{if(O)return;const out=e.target.closest("[data-cursor]");if(!out||!_active)return;const rel=e.relatedTarget;if(rel&&_active.contains(rel))return;out===_active&&_scheduleHide()};let rr=0,ox=0,oy=0;function _applySway(){const e=_calcSide();e!==_wantLeft&&(_wantLeft=e,ut&&_animateSideSwitch(e));if(!ut)return void(k.style.setProperty("--cc-ox","0"),k.style.setProperty("--cc-oy","0"),k.style.setProperty("--cc-r","0"));const t=mt,n=gt,o=Math.hypot(t,n),s=o<.18,i=ht(o/8,0,1.65),d=ht(o/7,0,1.9),l=e?-1:1,r=l*dt;let m=r+l*(1.45*t)*i,a=(.95*n)*i,c=-(1.25*n)*d;m=ht(m,-72,72),a=ht(a,-48,48),c=ht(c,-34,34),mt*=.78,gt*=.78,s&&(m=0,a=0,c=0),rr+=(c-rr)*.11,ox+=(m-ox)*.12,oy+=(a-oy)*.12,k.style.setProperty("--cc-ox",ox.toFixed(3)),k.style.setProperty("--cc-oy",oy.toFixed(3)),k.style.setProperty("--cc-r",rr.toFixed(3))}function Y(){if(O)return;O=!0,x(),_clearHide(),I&&cancelAnimationFrame(I),T&&cancelAnimationFrame(T),removeEventListener("resize",R),document.removeEventListener("mousemove",Dt),document.removeEventListener("pointerover",qt),document.removeEventListener("pointerout",Mt),document.removeEventListener("visibilitychange",Ft);try{c.remove()}catch{}try{w.remove()}catch{}window.__customCursorDestroy=null,window.__CC_LOCK=0}addEventListener("resize",R),document.addEventListener("mousemove",Dt,{passive:!0}),document.addEventListener("pointerover",qt,{passive:!0}),document.addEventListener("pointerout",Mt,{passive:!0}),document.addEventListener("visibilitychange",Ft),I=requestAnimationFrame(function e(){a.clearRect(0,0,L,E),p.x+=.45*(p.tx-p.x),p.y+=.45*(p.ty-p.y),h.forEach((e,t)=>{if(0===t)return e.x=p.x,void(e.y=p.y);const n=h[t-1];e.vx+=.4*(n.x-e.x),e.vy+=.4*(n.y-e.y),e.vx*=.5,e.vy*=.5,e.x+=e.vx,e.y+=e.vy});const t=getComputedStyle(document.documentElement).getPropertyValue("--colors--highlight").trim()||"#000";a.strokeStyle=t;for(let e=0;e<h.length-1;e++){const n=h[e],o=h[e+1],s=e/(h.length-1);a.lineWidth=16*(1-s)+2*s,a.lineCap="round",a.beginPath(),a.moveTo(n.x,n.y),a.lineTo(o.x,o.y),a.stroke()}a.beginPath(),a.fillStyle=t,a.arc(p.x,p.y,10*S.s,0,2*Math.PI),a.fill(),I=requestAnimationFrame(e)}),T=requestAnimationFrame(function e(){Q(p.x),K(p.y),ut&&_applySway(),T=requestAnimationFrame(e)}),J(),window.__customCursorDestroy=Y,CoreUtilities.Cursor.setDestroy(Y),window.__CC_LOCK=0,Y}
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
				init: async r=>{const t=r.querySelector(".selected-container"),o=t?.querySelector(".selected-content");if(!t||!o||t.__selectedLoopInited)return;t.__selectedLoopInited=!0;!function(){if(o.__swHold)return;o.__swHold=1;const e=()=>matchMedia("(pointer:coarse)").matches&&matchMedia("(max-width:1024px)").matches,n=()=>Array.from(o.querySelectorAll("a.selected-item-inner")),a=()=>{n().forEach(e=>{e.__href||(e.__href=e.getAttribute("href")||""),e.removeAttribute("href")})};if(!e())return;a();let s=0,l=0,i=0,c=0,d=!1,h=null,u=0;const p=t=>{const e=t.target&&t.target.closest?t.target.closest("a.selected-item-inner"):null;return e&&o.contains(e)?e:null},f=()=>{clearTimeout(u),u=0,h=null,d=!1};document.addEventListener("click",t=>{const e=p(t);e&&(t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation&&t.stopImmediatePropagation())},!0),o.addEventListener("touchstart",t=>{const e=t.touches&&t.touches[0];if(!e)return;s=e.clientX,l=e.clientY,i=Date.now(),c=window.scrollY||0,d=!1,h=p(t);if(!h||!h.__href)return;clearTimeout(u);const n=h.__href;u=setTimeout(()=>{h&&!d&&Math.abs((window.scrollY||0)-c)<=4&&h.__href===n&&(f(),location.assign(n))},250)},{passive:!0}),o.addEventListener("touchmove",t=>{const e=t.touches&&t.touches[0];if(!e)return;(Math.abs(e.clientX-s)>14||Math.abs(e.clientY-l)>14)&&(d=!0,clearTimeout(u))},{passive:!0}),o.addEventListener("touchend",()=>{Math.abs((window.scrollY||0)-c)>4&&(d=!0),clearTimeout(u),f()},{passive:!0}),o.addEventListener("touchcancel",()=>{clearTimeout(u),f()},{passive:!0})}();const n=[...o.querySelectorAll(".selected-item-outer")];if(!n.length)return;o.style.justifyContent="center",o.style.transform="translateZ(0)";const a=e=>{const t=getComputedStyle(e);return e.offsetWidth+(parseFloat(t.marginLeft)||0)+(parseFloat(t.marginRight)||0)},s=()=>Math.round(Math.max(innerWidth,document.documentElement.clientWidth)*(matchMedia("(max-width:767px)").matches?0.78:0.28)),l=e=>{o.querySelectorAll(".selected-item-outer").forEach(t=>{t._baseW=e,t.style.width=e+"px"})},i=()=>{let e=0;return[...o.children].forEach(t=>{1===t.nodeType&&(e+=a(t))}),e},c=()=>{n.forEach(e=>{const t=e.cloneNode(!0);t.setAttribute("data-clone","true"),o.appendChild(t)})};let d=0;function h(){const e=[...o.children].filter(e=>1===e.nodeType),n=Math.floor(e.length/2);let r=0;for(let t=0;t<n;t++)r+=a(e[t]);const l=a(e[n]);d=-(r+.5*l-.5*t.clientWidth),gsap.set(o,{x:d})}function u(){t.hasAttribute("data-loop-ready")||(t.setAttribute("data-loop-ready","1"),o.dispatchEvent(new CustomEvent("selected:loop-ready",{bubbles:!0})))}!function(){[...o.children].forEach(e=>{e.hasAttribute&&e.hasAttribute("data-clone")&&e.remove()}),l(s()),c(),c();const e=3*t.clientWidth;let n=0;for(;i()<e&&n++<8;)c();l(s())}();let p=0,f=1;const m={t:0},y=gsap.quickTo(m,"t",{duration:.45,ease:"power3.out",onUpdate:()=>{o.querySelectorAll(".selected-item-outer").forEach(e=>{const t=e._baseW||s();e.style.width=t*(1+m.t)+"px"})}});let g=!1;const b=(e,t=16.6667)=>{const n=t/16.6667,r=p+f;d-=r*n;let l=o.firstElementChild,x=0;for(;l&&d<-a(l)&&x++<50;)d+=a(l),o.appendChild(l),l=o.firstElementChild;let i=o.lastElementChild;for(x=0;i&&d>0&&x++<50;)d-=a(i),o.insertBefore(i,o.firstElementChild),i=o.lastElementChild;gsap.set(o,{x:d});const c=Math.min(1,Math.abs(r)/70);y((r>=0?.14:-.1)*c),Math.abs(r)<3&&Math.abs(m.t)>.002&&!g&&(g=!0,gsap.to(m,{t:0,duration:1.1,ease:"elastic.out(0.62,0.32)",onUpdate:()=>y(m.t)})),Math.abs(r)>=3&&(g=!1);p*=Math.pow(.94,n),Math.abs(p)<.01&&(p=0)};gsap.ticker.add(b),CoreUtilities.Observers.addTicker(b),CoreUtilities.Observers.addGsap(Observer.create({target:o,type:"wheel,touch",tolerance:6,onChange(e){const t=Math.abs(e.deltaX)>=Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(!t)return;p+=t*(e.event.type.includes("touch")?.34:.08),p=gsap.utils.clamp(-70,70,p),f=t>0?1:-1}})),h(),u();let v=0;const w=new ResizeObserver(()=>{cancelAnimationFrame(v),v=requestAnimationFrame(()=>{l(s()),y(m.t),h(),u()})});w.observe(t),CoreUtilities.Observers.addDom(w)}
			})
		);
		
		// Page: Archive
		registries.pages.archive.push(
			feature({
				id:"archiveSystem",
				stage:"early",
				namespaces:["archive"],
				selectors:[
					".filters-counter",".nav-counter-filters","[data-counter]",
					".section-archive-playful",".section-archive-minimal",
					".archive-playful-list",".archive-minimal-list",
					".archive-switch-block",".archive-switch",".archive-switch-dot",
					'[id^="archive-filter-"]','[id^="nav-archive-filter-"]',
					".archive-playful-item",".archive-minimal-item",".archive-categories .cms-categories"
				],
				init: function(root){
					root=root||document;
					var host=root.querySelector('[data-barba="container"][data-barba-namespace="archive"]')||root.querySelector('[data-barba="container"]')||root;
					if(host.__archiveSystemBound)return;
					host.__archiveSystemBound=1;
					
					var el={
						doc:document,
						host:host,
						P:host.querySelector(".section-archive-playful"),
						M:host.querySelector(".section-archive-minimal"),
						listP:host.querySelector(".archive-playful-list"),
						listM:host.querySelector(".archive-minimal-list"),
						switchBlock:host.querySelector(".archive-switch-block"),
						switchEl:host.querySelector(".archive-switch"),
						switchDot:host.querySelector(".archive-switch-dot")
					};
					
					if(!el.P&&!el.M&&!el.listP&&!el.listM){
						host.__archiveSystemBound=0;
						return;
					}
					
					var state={KEY_FILTER:"archiveFilter",KEY_VIEW:"archiveView",view:null,filter:null};
					
					var unsubs=[];
					function on(node,evt,fn,opts){
						if(!node)return;
						node.addEventListener(evt,fn,opts);
						unsubs.push(function(){try{node.removeEventListener(evt,fn,opts)}catch(_){}}); 
					}
					
					function baseId(id){return(id||"").replace(/^nav-archive-filter-/,"").replace(/^archive-filter-/,"").trim()}
					function normCat(s){
						s=(s||"").toLowerCase().trim().replace(/&/g," ").replace(/[–—]/g,"-").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g,"-");
						return s==="apps-web-apps"||s==="apps-webapps"||s==="apps-web"?"appswebapps"
						:s==="e-commerce"||s==="ecommerce"?"ecommerce"
						:s==="platforms-systems"||s==="platforms-and-systems"?"platforms-systems"
						:s==="websites"?"websites"
						:s==="other"?"other"
						:s==="all"?"all"
						:s;
					}
					
					// module API container (we’ll fill this as we migrate)
					var mod={
						applyView:function(){},
						getView:function(){},
						applyFilter:function(){},
						updateCounts:function(){},
						resetMotion:function(){},
						destroyMotion:function(){},
						scheduleMotionRefresh:function(){}
					};
					
					// View Module
					(function(){var K=state.KEY_VIEW||"archiveView",mq=matchMedia("(min-width:1024px)"),P=el.P,M=el.M,B=el.switchBlock,S=el.switchEl,D=el.switchDot;if(!P||!M||!B)return;function stored(){try{var v=localStorage.getItem(K);return v==="playful"||v==="minimal"?v:null}catch(_){return null}}function desired(){return mq.matches?(stored()||"playful"):"minimal"}function ui(v){var on=v==="playful";if(B){try{B.dataset.view=v}catch(_){}try{B.setAttribute("aria-pressed",String(on))}catch(_){}B.classList.toggle("is-playful",on);B.classList.toggle("is-minimal",!on)}if(S){try{S.dataset.view=v}catch(_){}S.classList.toggle("is-playful",on);S.classList.toggle("is-minimal",!on)}if(D){try{D.dataset.view=v}catch(_){}D.classList.toggle("is-playful",on);D.classList.toggle("is-minimal",!on)}}function emit(v){state.view=v;try{document.dispatchEvent(new CustomEvent("archive:view",{bubbles:!0,detail:{view:v}}))}catch(_){}}function refresh(){try{window.ScrollTrigger&&requestAnimationFrame(function(){try{ScrollTrigger.refresh()}catch(_){}})}catch(_){}}function show(v){P.style.display=v==="playful"?"block":"none";M.style.display=v==="minimal"?"block":"none";ui(v);emit(v);refresh()}function set(v,save){v=v==="playful"?"playful":"minimal";mq.matches||(v="minimal");if(save&&mq.matches)try{localStorage.setItem(K,v)}catch(_){}show(v)}function cur(){try{var dv=B&&B.dataset&&B.dataset.view;return dv?dv:((P&&getComputedStyle(P).display!=="none")?"playful":"minimal")}catch(_){return"minimal"}}function toggle(ev){ev&&ev.preventDefault&&ev.preventDefault();set(cur()==="playful"?"minimal":"playful",!0)}function onDocClick(ev){var t=ev&&ev.target;if(!t||!t.closest)return;var hit=t.closest(".archive-switch-block");if(!hit)return;toggle(ev)}function onMQ(){set(desired(),!1)}mod.applyView=function(v,save){set(v,!!save)};mod.getView=function(){return cur()};set(desired(),!1);on(document,"click",onDocClick,!0);try{mq.addEventListener?mq.addEventListener("change",onMQ):mq.addListener(onMQ)}catch(_){}unsubs.push(function(){try{mq.removeEventListener?mq.removeEventListener("change",onMQ):mq.removeListener(onMQ)}catch(_){}})})();

					// Filters Module
					(function(){var KEY=state.KEY_FILTER||"archiveFilter",doc=el.doc,ids=["archive-filter-all","archive-filter-appswebapps","archive-filter-websites","archive-filter-ecommerce","archive-filter-platforms-systems","archive-filter-other","nav-archive-filter-all","nav-archive-filter-appswebapps","nav-archive-filter-websites","nav-archive-filter-ecommerce","nav-archive-filter-platforms-systems","nav-archive-filter-other"],mo=0,raf=0;function setActive(cat){for(var i=0;i<ids.length;i++){var id=ids[i],x=doc.getElementById(id);if(!x)continue;var onv=baseId(id)===cat;x.classList.toggle("is-active",onv);try{x.setAttribute("aria-current",onv?"true":"false")}catch(_){}try{x.setAttribute("aria-pressed",onv?"true":"false")}catch(_){}}}function stored(){try{var v=localStorage.getItem(KEY);return v?normCat(v):null}catch(_){return null}}function scope(){try{var v=mod.getView&&mod.getView();if("playful"===v&&el.P&&getComputedStyle(el.P).display!=="none")return el.P;if("minimal"===v&&el.M&&getComputedStyle(el.M).display!=="none")return el.M}catch(_){}try{if(el.P&&getComputedStyle(el.P).display!=="none")return el.P;if(el.M&&getComputedStyle(el.M).display!=="none")return el.M}catch(_){}return el.host||host}function getAll(sc){return[].slice.call((sc||scope()).querySelectorAll(".archive-playful-item,.archive-minimal-item"))}function readCats(it){if(it.__asCats)return it.__asCats;for(var a=["all"],n=it.querySelectorAll(".archive-categories .cms-categories"),i=0;i<n.length;i++){var t=(n[i].textContent||"").trim();t&&(t=normCat(t))&&-1===a.indexOf(t)&&a.push(t)}return it.__asCats=a,a}function applyOnce(cat,sc){cat=normCat(cat||"all")||"all";state.filter=cat;setActive(cat);for(var items=getAll(sc),shown=0,i=0;i<items.length;i++){var it=items[i],cats=readCats(it),show="all"===cat||-1!==cats.indexOf(cat);it.style.display=show?"":"none";show&&shown++}return{cat:cat,shown:shown}}function emit(cat){try{doc.dispatchEvent(new CustomEvent("archive:filter:applied",{bubbles:!0,detail:{filter:cat}}))}catch(_){}}function apply(cat,meta){var sc=scope(),res=applyOnce(cat,sc);if("all"!==res.cat&&0===res.shown){try{localStorage.removeItem(KEY)}catch(_){}res=applyOnce("all",sc)}if("user"===meta)try{localStorage.setItem(KEY,res.cat)}catch(_){}emit(res.cat);try{mod.scheduleMotionRefresh&&mod.scheduleMotionRefresh()}catch(_){}}function scheduleReapply(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;apply(state.filter||stored()||"all","auto")})}function onClick(ev){var t=ev&&ev.target&&ev.target.closest?ev.target.closest('[id^="archive-filter-"],[id^="nav-archive-filter-"]'):null;if(!t||!t.id)return;ev.preventDefault&&ev.preventDefault();apply(baseId(t.id),"user")}function onExternal(ev){try{var d=ev&&ev.detail||{},cat=d.filter||d.category||d.id||"";cat=baseId(String(cat||""));cat&&apply(cat,"user")}catch(_){}}function onView(){apply(stored()||"all","auto")}mod.applyFilter=function(cat,save){apply(cat,save?"user":"auto")};mod.getFilter=function(){return state.filter||stored()||"all"};on(doc,"click",onClick,!0);on(doc,"archive:filter",onExternal,{passive:!0});on(doc,"archive:view",onView,{passive:!0});apply(stored()||"all","auto");try{mo=new MutationObserver(scheduleReapply);el.listP&&mo.observe(el.listP,{childList:!0,subtree:!0});el.listM&&mo.observe(el.listM,{childList:!0,subtree:!0});unsubs.push(function(){try{mo&&mo.disconnect&&mo.disconnect()}catch(_){}})}catch(_){}})();

					// Category Counts Module
					(function(){var d=el.doc,r=0,mo=0,ids=["archive-filter-all","archive-filter-appswebapps","archive-filter-websites","archive-filter-ecommerce","archive-filter-platforms-systems","archive-filter-other","nav-archive-filter-all","nav-archive-filter-appswebapps","nav-archive-filter-websites","nav-archive-filter-ecommerce","nav-archive-filter-platforms-systems","nav-archive-filter-other"];function all(){var a=[];el.listP&&(a=a.concat([].slice.call(el.listP.querySelectorAll(".archive-playful-item"))));el.listM&&(a=a.concat([].slice.call(el.listM.querySelectorAll(".archive-minimal-item"))));for(var s=new Set,o=[],i=0;i<a.length;i++){var it=a[i],k=it.getAttribute("data-w-id")||it.getAttribute("href")||((it.textContent||"").slice(0,60));s.has(k)||(s.add(k),o.push(it))}return o}function cats(it){if(it.__asCatsAll)return it.__asCatsAll;for(var a=["all"],n=it.querySelectorAll(".archive-categories .cms-categories"),i=0;i<n.length;i++){var t=(n[i].textContent||"").trim();t&&(t=normCat(t))&&a.indexOf(t)===-1&&a.push(t)}return it.__asCatsAll=a,a}function compute(){var items=all(),c={all:0,appswebapps:0,websites:0,ecommerce:0,"platforms-systems":0,other:0};c.all=items.length;for(var i=0;i<items.length;i++){var set=new Set(cats(items[i]));set.forEach(function(k){k!=="all"&&k in c&&(c[k]+=1)})}return c}function ensure(btn){if(!btn)return null;var s=btn.querySelector(".filters-counter")||btn.querySelector(".nav-counter-filters")||btn.querySelector("[data-counter]");return s||(s=document.createElement("span"),s.className=btn.id&&btn.id.indexOf("nav-")===0?"nav-counter-filters":"filters-counter",btn.appendChild(s)),s}function render(c){for(var i=0;i<ids.length;i++){var id=ids[i],btn=d.getElementById(id);if(!btn)continue;var key=baseId(id),s=ensure(btn);s&&(s.textContent="("+(c[key]??0)+")")}}function now(){r=0;try{render(compute())}catch(_){}}function sched(){r||(r=requestAnimationFrame(now))}mod.updateCounts=sched;sched();try{mo=new MutationObserver(sched);el.listP&&mo.observe(el.listP,{childList:!0,subtree:!0});el.listM&&mo.observe(el.listM,{childList:!0,subtree:!0});unsubs.push(function(){try{mo&&mo.disconnect&&mo.disconnect()}catch(_){}})}catch(_){}on(document,"archive:view",sched,{passive:!0});on(document,"archive:filter:applied",sched,{passive:!0});on(window,"load",sched,{once:!0,passive:!0})})();
					
					// Motion Module
					(function(){if(!window.gsap){mod.scheduleMotionRefresh=function(){};return}var io=null,scan=0,raf=0,t=0,run=0,tries=0,max=45;function cleanup(){try{io&&io.disconnect&&io.disconnect()}catch(_){}io=null;try{scan&&cancelAnimationFrame(scan)}catch(_){}scan=0;try{clearTimeout(t)}catch(_){}t=0}unsubs.push(cleanup);function canRun(it){if(!it)return!1;try{if(it.style&&it.style.display==="none")return!1;var s=getComputedStyle(it);return!(s&&s.display==="none")}catch(_){return!0}}function activeScope(){try{var v=mod.getView&&mod.getView();if(v==="playful"&&el.P&&getComputedStyle(el.P).display!=="none")return el.P;if(v==="minimal"&&el.M&&getComputedStyle(el.M).display!=="none")return el.M}catch(_){ }try{if(el.P&&getComputedStyle(el.P).display!=="none")return el.P;if(el.M&&getComputedStyle(el.M).display!=="none")return el.M}catch(_){ }return el.host||host}function items(scope){return[].slice.call((scope||activeScope()).querySelectorAll(".archive-playful-item,.archive-minimal-item"))}function vis(it){return it&&it.classList&&it.classList.contains("archive-minimal-item")?(it.querySelector(".archive-minimal-item-visual")||it.querySelector(".archive-minimal-visual")||it.querySelector(".archive-minimal-visual-wrap")):null}function prepOne(it){if(!it)return;it.__almRun=run;it.__almDone=0;try{gsap.killTweensOf(it)}catch(_){}gsap.set(it,{y:100,autoAlpha:0,filter:"blur(12px)",willChange:"transform,opacity,filter"});var v=vis(it);if(v){try{gsap.killTweensOf(v)}catch(_){}gsap.set(v,{autoAlpha:0,filter:"blur(12px)",willChange:"opacity,filter"})}}function revealOne(it,delay){if(!it||it.__almDone||!canRun(it))return;it.__almRun!==run&&prepOne(it);it.__almDone=1;gsap.to(it,{delay:delay||0,y:0,autoAlpha:1,filter:"blur(0px)",duration:.75,ease:"power3.out",overwrite:!0,clearProps:"y,filter,willChange,opacity,visibility"});var v=vis(it);v&&gsap.to(v,{delay:(delay||0)+.06,autoAlpha:1,filter:"blur(0px)",duration:.6,ease:"power2.out",overwrite:!0,clearProps:"filter,willChange,opacity,visibility"})}function revealBatch(els){els.sort(function(a,b){return a.getBoundingClientRect().top-b.getBoundingClientRect().top});for(var i=0;i<els.length;i++)revealOne(els[i],.08*i)}function inView(it){if(!canRun(it)||it.__almDone)return!1;var r=it.getBoundingClientRect();return r.top<(innerHeight||0)&&r.bottom>0}function forceScan(list,frames){var f=0;function tick(){f++;for(var hits=[],i=0;i<list.length;i++)inView(list[i])&&hits.push(list[i]);hits.length&&revealBatch(hits);f<(frames||30)?scan=requestAnimationFrame(tick):scan=0}scan=requestAnimationFrame(tick)}function start(list){cleanup();if("IntersectionObserver"in window){io=new IntersectionObserver(function(ents){for(var hits=[],i=0;i<ents.length;i++)ents[i].isIntersecting&&hits.push(ents[i].target);hits.length&&revealBatch(hits)},{threshold:.12,rootMargin:"0px 0px -10% 0px"});for(var i=0;i<list.length;i++)try{io.observe(list[i])}catch(_){}}forceScan(list,30)}function resetAndRun(scope){var sc=scope||activeScope(),list=items(sc);if(!list.length){if(tries++<max)return requestAnimationFrame(function(){resetAndRun(sc)});return}tries=0;run++;for(var i=0;i<list.length;i++)canRun(list[i])&&prepOne(list[i]);start(list)}mod.resetMotion=function(){tries=0;resetAndRun(activeScope())};mod.scheduleMotionRefresh=function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;tries=0;resetAndRun(activeScope());try{clearTimeout(t)}catch(_){}t=setTimeout(function(){tries=0;resetAndRun(activeScope())},160)})};on(document,"archive:view",mod.scheduleMotionRefresh,{passive:!0});on(document,"archive:filter:applied",mod.scheduleMotionRefresh,{passive:!0});mod.scheduleMotionRefresh()})();
					
					// expose for migration/debug (we’ll remove later)
					host.__archiveSystemAPI={el:el,state:state,mod:mod,on:on,baseId:baseId,normCat:normCat};
					
					return function destroy(){
						unsubs.forEach(function(fn){fn()});
						unsubs.length=0;
						try{mod.destroyMotion&&mod.destroyMotion()}catch(_){}
						try{host.__archiveSystemAPI=null}catch(_){}
						host.__archiveSystemBound=0;
					};
				}
			})
			//feature({
			//	id: "archiveFilterCounts",
			//	stage: "early",
			//	namespaces: ["archive"],
			//	selectors: [".archive-playful-list",".archive-minimal-list"],
			//	init: function(r){r=r||document;var e=r.querySelector("main.main")||r;if(e.__archiveCountsBound)return;e.__archiveCountsBound=1;var t=["archive-filter-all","archive-filter-appswebapps","archive-filter-websites","archive-filter-ecommerce","archive-filter-platforms-systems","archive-filter-other","nav-archive-filter-all","nav-archive-filter-appswebapps","nav-archive-filter-websites","nav-archive-filter-ecommerce","nav-archive-filter-platforms-systems","nav-archive-filter-other"];function n(e){return(e||"").replace(/^nav-archive-filter-/,"").replace(/^archive-filter-/,"").trim()}function a(e){return e=(e||"").toLowerCase().trim().replace(/&/g," ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g,"-"),"apps-web-apps"===e||"apps-webapps"===e||"apps-web"===e?"appswebapps":"e-commerce"===e||"ecommerce"===e?"ecommerce":"platforms-systems"===e||"platforms-and-systems"===e?"platforms-systems":"websites"===e?"websites":"other"===e?"other":"all"===e?"all":e}function o(){var t=e.querySelector(".section-archive-playful .archive-playful-list"),n=e.querySelector(".section-archive-minimal .archive-minimal-list"),a=[];return t&&(a=a.concat([].slice.call(t.querySelectorAll(".archive-playful-item")))),n&&(a=a.concat([].slice.call(n.querySelectorAll(".archive-minimal-item")))),function(e){var t=new Set,n=[];return e.forEach(function(e){var a=e.getAttribute("data-w-id")||e.getAttribute("href")||e.textContent.slice(0,40);t.has(a)||(t.add(a),n.push(e))}),n}(a)}function i(e){for(var t=[],n=e.querySelectorAll(".archive-categories .cms-categories"),o=0;o<n.length;o++){var i=(n[o].textContent||"").trim();i&&t.push(a(i))}return t}function c(e){var t={all:0,appswebapps:0,websites:0,ecommerce:0,"platforms-systems":0,other:0};return t.all=e.length,e.forEach(function(e){var n=new Set(i(e));n.forEach(function(e){e in t&&"all"!==e&&(t[e]+=1)})}),t}function l(e,t){if(!e)return;var n=e.querySelector(".filters-counter")||e.querySelector(".nav-counter-filters")||e.querySelector("[data-counter]");n||(n=document.createElement("span"),n.className=e.id&&0===e.id.indexOf("nav-")?"nav-counter-filters":"filters-counter",e.appendChild(n)),n.textContent="("+(t||0)+")"}function s(e){for(var a=0;a<t.length;a++){var o=t[a],i=r.querySelector("#"+o)||document.getElementById(o);if(i){var c=n(o);l(i,null!=e[c]?e[c]:0)}}}var d=0;function u(){d=0;var r=o(),e=c(r);s(e)}function f(){d||(d=requestAnimationFrame(u))}f();var m=e.querySelector(".section-archive-playful .archive-playful-list"),v=e.querySelector(".section-archive-minimal .archive-minimal-list"),p=new MutationObserver(f);try{m&&p.observe(m,{childList:!0,subtree:!0}),v&&p.observe(v,{childList:!0,subtree:!0})}catch(e){}window.addEventListener("load",f,{once:!0});try{CoreUtilities&&CoreUtilities.Observers&&CoreUtilities.Observers.addDom&&CoreUtilities.Observers.addDom(p)}catch(e){}}
			//}),
			//feature({
			//	id: "archiveFiltersController",
			//	stage: "early",
			//	namespaces: ["archive"],
			//	selectors: ["#archive-filter-all","#archive-filter-appswebapps","#archive-filter-websites","#archive-filter-ecommerce","#archive-filter-platforms-systems","#archive-filter-other","#nav-archive-filter-all","#nav-archive-filter-appswebapps","#nav-archive-filter-websites","#nav-archive-filter-ecommerce","#nav-archive-filter-platforms-systems","#nav-archive-filter-other",".section-archive-playful",".section-archive-minimal"],
			//	init: function(r){r=r||document;var KEY="archiveFilter",doc=document;if(doc.__afDocBound)return;doc.__afDocBound=1;var ids=["archive-filter-all","archive-filter-appswebapps","archive-filter-websites","archive-filter-ecommerce","archive-filter-platforms-systems","archive-filter-other","nav-archive-filter-all","nav-archive-filter-appswebapps","nav-archive-filter-websites","nav-archive-filter-ecommerce","nav-archive-filter-platforms-systems","nav-archive-filter-other"];function baseId(e){return(e||"").replace(/^nav-archive-filter-/,"").replace(/^archive-filter-/,"").trim()}function norm(e){return e=(e||"").toLowerCase().trim().replace(/&/g," ").replace(/[–—]/g,"-").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g,"-"),"apps-web-apps"===e||"apps-webapps"===e||"apps-web"===e?"appswebapps":"e-commerce"===e||"ecommerce"===e?"ecommerce":"platforms-systems"===e||"platforms-and-systems"===e?"platforms-systems":"websites"===e?"websites":"other"===e?"other":"all"===e?"all":e}function getScope(){var c=doc.querySelector('[data-barba="container"][data-barba-namespace="archive"]')||doc.querySelector('[data-barba="container"]');return c||doc}function readCats(it){if(it.__afCats)return it.__afCats;for(var a=["all"],n=it.querySelectorAll(".archive-categories .cms-categories"),i=0;i<n.length;i++){var t=(n[i].textContent||"").trim();t&&(t=norm(t))&&-1===a.indexOf(t)&&a.push(t)}return it.__afCats=a,a}function getAllItems(scope){var a=[],p=scope.querySelector(".section-archive-playful"),m=scope.querySelector(".section-archive-minimal");return p&&(a=a.concat([].slice.call(p.querySelectorAll(".archive-playful-item")))),m&&(a=a.concat([].slice.call(m.querySelectorAll(".archive-minimal-item")))),a}function setActive(cat){for(var i=0;i<ids.length;i++){var id=ids[i],el=doc.getElementById(id);if(!el)continue;var on=baseId(id)===cat;el.classList.toggle("is-active",on);try{el.setAttribute("aria-current",on?"true":"false")}catch(e){}try{el.setAttribute("aria-pressed",on?"true":"false")}catch(e){}}}function stored(){try{var v=localStorage.getItem(KEY);return v?norm(v):null}catch(e){}return null}function applyOnce(cat){cat=norm(cat||"all")||"all";setActive(cat);var scope=getScope(),items=getAllItems(scope),shown=0;for(var i=0;i<items.length;i++){var it=items[i],cats=readCats(it),show="all"===cat||-1!==cats.indexOf(cat);it.style.display=show?"":"none";show&&shown++}return{cat:cat,shown:shown,scope:scope}}function apply(cat,meta){var res=applyOnce(cat);if("all"!==res.cat&&0===res.shown){try{localStorage.removeItem(KEY)}catch(e){}res=applyOnce("all")}if("user"===meta)try{localStorage.setItem(KEY,res.cat)}catch(e){}try{doc.dispatchEvent(new CustomEvent("archive:filter:applied",{bubbles:!0,detail:{filter:res.cat}}))}catch(e){}}function onDocClick(e){var t=e.target&&e.target.closest?e.target.closest('[id^="archive-filter-"],[id^="nav-archive-filter-"]'):null;if(!t||!t.id)return;e.preventDefault&&e.preventDefault();apply(baseId(t.id),"user")}function onExternal(e){try{var d=e&&e.detail||{},cat=d.filter||d.category||d.id||"";cat=baseId(String(cat||""));cat&&apply(cat,"user")}catch(_){}}function onView(){apply(stored()||"all","auto")}doc.addEventListener("click",onDocClick,!0);doc.addEventListener("archive:filter",onExternal,{passive:!0});doc.addEventListener("archive:view",onView,{passive:!0});apply(stored()||"all","auto");}
			//}),
			//feature({
			//	id: "archiveViewController",
			//	stage: "early",
			//	namespaces: ["archive"],
			//	selectors: [".section-archive-playful",".section-archive-minimal",".archive-switch-block",".archive-switch",".archive-switch-dot"],
			//	init: function(e){e=e||document;var K="archiveView",mq=matchMedia("(min-width:1024px)"),P=e.querySelector(".section-archive-playful"),M=e.querySelector(".section-archive-minimal"),B=e.querySelector(".archive-switch-block"),S=e.querySelector(".archive-switch"),D=e.querySelector(".archive-switch-dot");if(!P||!M||!B||e.__archiveViewBound)return;e.__archiveViewBound=1;function stored(){try{var v=localStorage.getItem(K);return v==="playful"||v==="minimal"?v:null}catch(_){return null}}function desired(){return mq.matches?(stored()||"playful"):"minimal"}function ui(v){var on=v==="playful";B&&(B.dataset.view=v,B.setAttribute("aria-pressed",String(on)),B.classList.toggle("is-playful",on),B.classList.toggle("is-minimal",!on));S&&(S.dataset.view=v,S.classList.toggle("is-playful",on),S.classList.toggle("is-minimal",!on));D&&(D.dataset.view=v,D.classList.toggle("is-playful",on),D.classList.toggle("is-minimal",!on))}function emit(v){try{document.dispatchEvent(new CustomEvent("archive:view",{bubbles:!0,detail:{view:v}}))}catch(_){}}function refresh(){try{window.ScrollTrigger&&requestAnimationFrame(function(){try{ScrollTrigger.refresh()}catch(_){}})}catch(_){}}function show(v){P.style.display=v==="playful"?"block":"none";M.style.display=v==="minimal"?"block":"none";ui(v);emit(v);refresh()}function set(v,save){v=v==="playful"?"playful":"minimal";mq.matches||(v="minimal");if(save&&mq.matches)try{localStorage.setItem(K,v)}catch(_){}show(v)}function cur(){return(B&&B.dataset.view)||((P&&getComputedStyle(P).display!=="none")?"playful":"minimal")}function toggle(ev){ev&&ev.preventDefault&&ev.preventDefault();set(cur()==="playful"?"minimal":"playful",!0)}function onDocClick(ev){var t=ev&&ev.target;if(!t||!t.closest)return;var hit=t.closest(".archive-switch-block");if(!hit)return;toggle(ev)}function onMQ(){set(desired(),!1)}set(desired(),!1);document.addEventListener("click",onDocClick,!0);mq.addEventListener?mq.addEventListener("change",onMQ):mq.addListener(onMQ);e.__archiveViewDestroy=function(){try{mq.removeEventListener?mq.removeEventListener("change",onMQ):mq.removeListener(onMQ)}catch(_){}try{document.removeEventListener("click",onDocClick,!0)}catch(_){}e.__archiveViewBound=0;e.__archiveViewDestroy=null}}
			//}),
			//feature({
			//	id: "archiveListMotion",
			//	stage: "main",
			//	namespaces: ["archive"],
			//	selectors: [".section-archive-playful",".section-archive-minimal",".archive-playful-item",".archive-minimal-item"],
			//	init: function(e){if(!window.gsap)return;e=e||document;var host=e.querySelector('[data-barba="container"][data-barba-namespace="archive"]')||e.querySelector('[data-barba="container"]')||e,io=null,run=0,tries=0,max=45,scan=0;function cleanup(){try{io&&io.disconnect&&io.disconnect()}catch(_){}io=null;try{scan&&cancelAnimationFrame(scan)}catch(_){}scan=0}host.__almCleanup&&function(){try{host.__almCleanup()}catch(_){}}(),host.__almCleanup=cleanup;function canRun(it){if(!it)return!1;try{if(it.style&&"none"===it.style.display)return!1;var s=getComputedStyle(it);return!(s&&("none"===s.display||"hidden"===s.visibility))}catch(_){return!0}}function getItems(scope){return[].slice.call((scope||host).querySelectorAll(".archive-playful-item,.archive-minimal-item"))}function prep(list){run++;list.forEach(function(it){if(!canRun(it))return;it.__almRun=run;it.__almDone=0;try{gsap.killTweensOf(it)}catch(_){}gsap.set(it,{y:100,autoAlpha:0,filter:"blur(12px)",willChange:"transform,opacity,filter"});var v=it.classList.contains("archive-minimal-item")?(it.querySelector(".archive-minimal-item-visual")||it.querySelector(".archive-minimal-visual")||it.querySelector(".archive-minimal-visual-wrap")):null;if(v){try{gsap.killTweensOf(v)}catch(_){}gsap.set(v,{autoAlpha:0,filter:"blur(12px)",willChange:"opacity,filter"})}})}function revealOne(it,delay){if(!it||!canRun(it)||it.__almDone||it.__almRun!==run)return;it.__almDone=1;gsap.to(it,{delay:delay||0,y:0,autoAlpha:1,filter:"blur(0px)",duration:.75,ease:"power3.out",overwrite:!0,clearProps:"y,filter,willChange"});var v=it.classList.contains("archive-minimal-item")?(it.querySelector(".archive-minimal-item-visual")||it.querySelector(".archive-minimal-visual")||it.querySelector(".archive-minimal-visual-wrap")):null;v&&gsap.to(v,{delay:(delay||0)+.06,autoAlpha:1,filter:"blur(0px)",duration:.6,ease:"power2.out",overwrite:!0,clearProps:"filter,willChange"})}function revealBatch(els){els.sort(function(a,b){return a.getBoundingClientRect().top-b.getBoundingClientRect().top});els.forEach(function(it,i){revealOne(it,.08*i)})}function inView(it){if(!canRun(it)||it.__almDone||it.__almRun!==run)return!1;var r=it.getBoundingClientRect();return r.top<(innerHeight||0)&&r.bottom>0}function forceScan(list,frames){var f=0;function tick(){f++;var hits=[];for(var i=0;i<list.length;i++)inView(list[i])&&hits.push(list[i]);hits.length&&revealBatch(hits);if(f<(frames||30)){scan=requestAnimationFrame(tick)}else scan=0}scan=requestAnimationFrame(tick)}function start(list){cleanup();if("IntersectionObserver"in window){io=new IntersectionObserver(function(ents){var hits=[];ents.forEach(function(ent){ent.isIntersecting&&hits.push(ent.target)});hits.length&&revealBatch(hits)},{threshold:.12,rootMargin:"0px 0px -10% 0px"});list.forEach(function(it){try{io.observe(it)}catch(_){}})}forceScan(list,30)}function boot(scope){var list=getItems(scope);if(!list.length&&tries++<max)return requestAnimationFrame(function(){boot(scope)});if(!list.length)return;prep(list);start(list)}boot(host);window.__archiveListMotion=window.__archiveListMotion||{};window.__archiveListMotion.resetAndRun=function(scope){tries=0;boot(scope||host)};window.__archiveListMotion.destroy=function(){cleanup();try{host.__almCleanup=null}catch(_){}}}
			//}),
			//feature({
			//	id: "archiveController",
			//	stage: "late",
			//	namespaces: ["archive"],
			//	selectors: [".section-archive-playful",".section-archive-minimal"],
			//	init: function(e){e=e||document;var t=e.querySelector('[data-barba="container"][data-barba-namespace="archive"]')||e.querySelector('[data-barba="container"]')||e;if(t.__archiveControllerBound)return;t.__archiveControllerBound=1;var r=0;function n(){var e=t.querySelector(".section-archive-playful"),r=t.querySelector(".section-archive-minimal");try{if(e&&"none"!==getComputedStyle(e).display)return e;if(r&&"none"!==getComputedStyle(r).display)return r}catch(e){}return t}function o(){r||(r=requestAnimationFrame(function(){r=0;try{window.__archiveListMotion&&__archiveListMotion.resetAndRun&&__archiveListMotion.resetAndRun(n())}catch(e){}}))}document.addEventListener("archive:view",o,{passive:!0}),document.addEventListener("archive:filter:applied",o,{passive:!0}),o(),window.addEventListener("load",o,{once:!0}),t.__archiveControllerDestroy=function(){try{document.removeEventListener("archive:view",o)}catch(e){}try{document.removeEventListener("archive:filter:applied",o)}catch(e){}r=0,t.__archiveControllerBound=0,t.__archiveControllerDestroy=null}}
			//})
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
				id: "heroShowreel",
				stage: "main",
				namespaces: ["capabilities"],
				selectors: [".hero-section-showreel .showreel-track",".hero-section-showreel .showreel-container"],
				init:async function(root){if(!matchMedia("(min-width:1024px)").matches)return;if(matchMedia("(prefers-reduced-motion: reduce)").matches||!matchMedia("(pointer:fine)").matches)return;root=root||document;var section=root.querySelector(".hero-section-showreel");if(!section||section.__hsBound)return;var track=section.querySelector(".showreel-track"),container=section.querySelector(".hero-section-showreel .showreel-container");if(!track||!container)return;section.__hsBound=1;var supportsAR=window.CSS&&CSS.supports&&CSS.supports("aspect-ratio:16/9"),st={x:0,px:null,last:0,raf:0,w:0,tw:0,left:0,right:0,baseC:0,hasMove:!1,vx:0,sq:0,wob:0,wobP:0,prevSq:0,scroll:0,ch:0,baseWR:0,baseMT:0},L=2.2,M=.3,V=1300,S=.13,H={base:1,min:.85,max:1.2},WF=5,WS=.5;function clamp(v,a,b){return v<a?a:v>b?b:v}function measure(){var cr=container.getBoundingClientRect(),tr=track.getBoundingClientRect();st.w=cr.width;st.ch=cr.height;st.tw=tr.width;st.left=tr.left;st.right=tr.right;st.baseC=cr.left+cr.width/2-st.x;!supportsAR&&st.w&&(container.style.height=st.w*9/16+"px");if(!st.baseWR&&st.tw>0)st.baseWR=st.w/st.tw;if(!st.baseMT){var mt=parseFloat(getComputedStyle(container).marginTop);!isNaN(mt)&&(st.baseMT=mt)}}function targetX(px){var t=clamp(px,st.left,st.right),mid=t+st.w/2,lC=st.left+st.w/2,rC=st.right-st.w/2;lC>rC&&(lC=rC=(st.left+st.right)/2);var cm=clamp(mid,lC,rC);return cm-st.baseC}function ptr(ev){var x=ev.clientX;st.hasMove&&(st.vx+=x-(st.px==null?x:st.px));st.hasMove=!0;st.px=x}function scrollLayout(){var r=section.getBoundingClientRect(),vh=innerHeight,h=r.height;st.scroll=!h||vh>=h?0:clamp(-r.top/(h-vh),0,1);if(st.tw>0&&st.baseWR){var s=.1,e=.9,g=(st.scroll-s)/(e-s);g=g<0?0:g>1?1:g;var basePct=st.baseWR*100;container.style.width=basePct+(100-basePct)*g+"%";if(st.baseMT)container.style.marginTop=st.baseMT*(1-g)+"px"}}function resize(){measure();scrollLayout()}function loop(ts){if(!st.last)st.last=ts;var dt=(ts-st.last)/1e3;dt<0&&(dt=0);dt>.05&&(dt=.05);st.last=ts;measure();var sc=st.scroll,base=H.base+(1-H.base)*sc,minS=H.min+(base-H.min)*sc,maxS=H.max-(H.max-base)*(.9*sc);sc>=.8&&(minS=base,maxS=base,st.sq*=.7);if(!st.hasMove||st.px==null){container.style.transform="translate3d("+st.x+"px,0,0) scale("+base+")";st.raf=requestAnimationFrame(loop);return}var tx=targetX(st.px),k=1-Math.exp(-L*dt);st.x+=k*(tx-st.x);st.vx*=.96;Math.abs(st.vx)<.02&&(st.vx=0);var tilt=0;if(st.vx){tilt=-st.vx/V;tilt>M?tilt=M:tilt<-M&&(tilt=-M)}st.sq+=S*(tilt-st.sq);var scale=base+st.sq;scale<minS?scale=minS:scale>maxS&&(scale=maxS);sc>.25&&(st.wob=0,st.wobP=0);var extra=1,d=scale-base,pr=st.prevSq,A=Math.abs(d),B=Math.abs(pr),tIn=.02,tOut=.03,trig=A<tIn&&B>tOut;trig&&!st.wob&&sc<.25&&(st.wob=1,st.wobP=0);if(st.wob>0){st.wobP+=WF*dt;extra=1+WS*st.wob*Math.sin(st.wobP);st.wob-=dt/.9;st.wob<=.001&&(st.wob=0,st.wobP=0,extra=1)}st.prevSq=d;var finalS=scale*extra,minX=st.left+st.w/2-st.baseC,maxX=st.right-st.w/2-st.baseC;if(minX>maxX){var mid=(minX+maxX)/2;minX=maxX=mid}st.x=clamp(st.x,minX,maxX);container.style.transform="translate3d("+st.x+"px,0,0) scale("+finalS+")";st.raf=requestAnimationFrame(loop)}measure();container.style.transform="translate3d(0,0,0) scale("+H.base+")";addEventListener("pointermove",ptr,{passive:!0});addEventListener("resize",resize,{passive:!0});addEventListener("scroll",scrollLayout,{passive:!0});scrollLayout();st.raf=requestAnimationFrame(loop);section.__hsDestroy=function(){removeEventListener("pointermove",ptr);removeEventListener("resize",resize);removeEventListener("scroll",scrollLayout);st.raf&&cancelAnimationFrame(st.raf)}},destroy:async function(root){root=root||document;var s=root.querySelector(".hero-section-showreel")||document.querySelector(".hero-section-showreel");s&&s.__hsDestroy&&s.__hsDestroy()}
			}),
			feature({
				id: "productPinnedSections",
				stage: "main",
				namespaces: ["capabilities"],
				selectors: [".section-single-service"],
				init: async r=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches||!window.gsap||!window.ScrollTrigger)return;r=r||document;const s=[...r.querySelectorAll(".section-single-service")];if(!s.length)return;s.forEach((e,i)=>{if(e._capPin)return;e._capPin=1;const o=e.querySelector(".single-service-overlay");if(!o)return;gsap.set(o,{opacity:0,filter:"contrast(100%) blur(0px)"});ScrollTrigger.create({id:"servicePin:"+i,trigger:e,start:e.offsetHeight<innerHeight?"top top":"bottom bottom",endTrigger:s[i+1]||e,end:s[i+1]?"top top":"bottom top",pin:!0,pinSpacing:!1,scrub:!0,anticipatePin:1,invalidateOnRefresh:!1,onUpdate:t=>{const p=t.progress;gsap.set(o,{opacity:p,filter:`contrast(${100-90*p}%) blur(${10*p}px)`})}})})}
			}),
			feature({
				id: "productGallery",
				stage: "main",
				namespaces: ["capabilities"],
				selectors: [".infinite-gallery"],
				init: async R=>{if(!gsap||matchMedia("(prefers-reduced-motion: reduce)").matches)return;R=R||document;const G=[...R.querySelectorAll(".infinite-gallery")];if(!G.length)return;const AD=o=>{try{CoreUtilities.Observers.addDom(o)}catch{}},AT=o=>{try{CoreUtilities.Observers.addTicker(o)}catch{}},ratio=o=>{const d=parseFloat(o.dataset.ratio);if(d>0)return d;const a=o.getAttribute("data-ratio");if(a)return parseFloat(a);const m=(o.className||"").match(/sv-ratio-(\d+)/);if(m){const c=m[1];if(c==="169")return 16/9;if(c==="133"||c==="43")return 4/3;if(c==="11")return 1}const v=o.querySelector("img,video");if(v){const w=v.naturalWidth||v.videoWidth||0,h=v.naturalHeight||v.videoHeight||0;if(w&&h)return w/h}return 1.5},preload=async o=>{const M=[...o.querySelectorAll("img,video")];if(!M.length)return;const ok=o=>o.naturalWidth>0&&o.naturalHeight>0||o.videoWidth>0&&o.videoHeight>0;const waits=M.map(m=>{if(ok(m))return Promise.resolve();const d=typeof m.decode=="function"?m.decode().catch(()=>{}):Promise.resolve(),l=new Promise(res=>{const f=()=>{m.removeEventListener("load",f);res()};m.addEventListener("load",f,{once:!0})}),p=new Promise(res=>{let t=0;(function chk(){if(ok(m)||t++>80)return res();setTimeout(chk,40)})()});return Promise.race([d,l,p])});const to=new Promise(res=>setTimeout(res,3500));await Promise.race([Promise.all(waits),to])},gap=o=>parseFloat(getComputedStyle(o).gap)||0,wNode=(n,t)=>(n.getBoundingClientRect().width||0)+gap(t),trackW=t=>{let x=0;t.childNodes.forEach(n=>{if(n.nodeType===1)x+=wNode(n,t)});return x};G.forEach(gal=>{const track=gal.querySelector(".infinite-gallery-wrapper");if(!track||track.__inited)return;track.__inited=!0;gal.setAttribute("data-armed","0");const items=[...track.querySelectorAll(".service-visual-wrapper:not([data-clone])")];if(!items.length){gal.setAttribute("data-armed","1");return}gal.setAttribute("data-armed","measure");const revealed=new Set;const measure=()=>{items.forEach((it,i)=>{it.style.height="";const r=ratio(it);const h=it.getBoundingClientRect().height||0;it.dataset.key=String(i);it.dataset.ratio=r;it.dataset.targetH=h;const W=h*r;if(W>0){it.style.minWidth=W+"px";it.style.maxWidth=W+"px"}it.style.height="0px";it.style.overflow="hidden";it.dataset.revealed="0";it.style.flex="0 0 auto"})},clearClones=()=>{[...track.querySelectorAll('.service-visual-wrapper[data-clone="1"]')].forEach(n=>n.remove())},cloneFrom=it=>{const c=it.cloneNode(!0);c.setAttribute("data-clone","1");const k=it.dataset.key,h=parseFloat(it.dataset.targetH)||0,r=parseFloat(it.dataset.ratio)||1;c.dataset.key=k;const W=h*r;if(W>0){c.style.minWidth=W+"px";c.style.maxWidth=W+"px"}c.style.height=revealed.has(k)?h+"px":"0px";c.style.overflow="hidden";c.style.flex="0 0 auto";track.appendChild(c)},build=()=>{clearClones();items.forEach(cloneFrom);items.forEach(cloneFrom);let guard=0;const need=3*track.clientWidth;while(trackW(track)<need&&guard++<8)items.forEach(cloneFrom)};let alive=!0,raf=0,active=!1,last=0;const stop=()=>{active=!1;cancelAnimationFrame(raf)};const destroy=()=>{alive=!1;stop();try{IO&&IO.disconnect&&IO.disconnect()}catch{}try{RO&&RO.disconnect&&RO.disconnect()}catch{}try{MO&&MO.disconnect&&MO.disconnect()}catch{}try{window.ScrollTrigger&&STH&&ScrollTrigger.removeEventListener&&ScrollTrigger.removeEventListener("refresh",STH)}catch{}STH=null};const reveal=t=>{if(!alive||!active){cancelAnimationFrame(raf);return}if(t-last<80){raf=requestAnimationFrame(reveal);return}last=t;const vw=innerWidth,L=-.05*vw,R=1.05*vw;const cand=[...track.querySelectorAll(".service-visual-wrapper")].filter(it=>{const b=it.getBoundingClientRect();return b.right>L&&b.left<R}).filter(it=>it.dataset.revealed!=="1"&&it.dataset.revealing!=="1").sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);if(cand.length){const tl=gsap.timeline();cand.forEach((it,i)=>{let h=parseFloat(it.dataset.targetH)||0;if(!h){const r=parseFloat(it.dataset.ratio)||1,w=it.getBoundingClientRect().width||0;h=w&&r?w/r:0;it.dataset.targetH=h}const k=it.dataset.key;if(!h)return;it.dataset.revealing="1";tl.to(it,{height:h,duration:.9,ease:"power2.out",onComplete:()=>{it.style.height="";it.dataset.revealed="1";it.dataset.revealing="";revealed.add(k);track.querySelectorAll('.service-visual-wrapper[data-clone="1"][data-key="'+k+'"]').forEach(c=>c.style.height=h+"px")}},.12*i)})}raf=requestAnimationFrame(reveal)};const IO=new IntersectionObserver(e=>{e.forEach(v=>{if(v.target!==gal)return;if(v.isIntersecting){if(!active){active=!0;cancelAnimationFrame(raf);raf=requestAnimationFrame(reveal)}}else stop()})},{root:null,threshold:0.1,rootMargin:"-10% 0px -10% 0px"});IO.observe(gal);AD(IO);const rect=gal.getBoundingClientRect();if(rect.top<innerHeight&&rect.bottom>0){active=!0;raf=requestAnimationFrame(reveal)}let off=0,dir=("right"===(gal.dataset.direction||"left").toLowerCase()?-1:1),spd=parseFloat(gal.dataset.speed)||.6,vel=60*spd;const loop=(t,dt)=>{if(!alive)return;const d=(dt||16.6667)/1000;off-=dir*vel*d;let f=track.firstElementChild,g=0;for(;f&&off<-wNode(f,track)&&g++<50;)off+=wNode(f,track),track.appendChild(f),f=track.firstElementChild;let l=track.lastElementChild;g=0;for(;l&&off>0&&g++<50;)off-=wNode(l,track),track.insertBefore(l,track.firstElementChild),l=track.lastElementChild;gsap.set(track,{x:off});const C=(innerWidth||1)/2;[...track.querySelectorAll(".service-visual")].forEach(n=>{const w=n.closest(".service-visual-wrapper");if(!w)return;const b=w.getBoundingClientRect(),m=(C-(b.left+b.right)/2)/(innerWidth||1);n.style.setProperty("--drift",40*m+"px")})};AT(loop);const RO=new ResizeObserver(()=>{if(!alive)return;measure();build()});RO.observe(track);AD(RO);let MO=null;MO=new MutationObserver(()=>{if(!alive)return;if(!document.body.contains(gal)||!document.body.contains(track))destroy()});MO.observe(document.body,{childList:!0,subtree:!0});AD(MO);let STH=null;const afterRefresh=async()=>{if(!alive)return;await preload(track);requestAnimationFrame(()=>{if(!alive)return;measure();build();gal.setAttribute("data-armed","1")})};STH=afterRefresh;try{window.ScrollTrigger&&ScrollTrigger.addEventListener&&ScrollTrigger.addEventListener("refresh",STH)}catch{}AD({disconnect:destroy});afterRefresh()})}
			})
		);

		// Page: Info
		registries.pages.info.push(
			feature({
				id: "infoBioGather",
				stage: "main",
				namespaces: ["info"],
				selectors: ['[data-imgscroll="photos"] .bio-photo-wrapper','[data-imgscroll="bio"]'],
				init: async r=>{if(!window.gsap||!window.ScrollTrigger)return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const mm=gsap.matchMedia();mm.add("(min-width: 1024px)",(()=>{const sec=r.querySelector('[data-imgscroll="photos"]'),bio=r.querySelector('[data-imgscroll="bio"]'),copy=r.querySelector('[data-imgscroll="copy"]'),stats=r.querySelector('[data-imgscroll="stats"]'),head=r.querySelector(".bio-text .headline-md");if(!sec||!bio||!copy||!stats||!head)return;const list=[...sec.querySelectorAll('.bio-photo-wrapper[data-photo]')].sort((a,b)=>(+a.getAttribute("data-photo")||0)-(+b.getAttribute("data-photo")||0)),p1=list.find(e=>e.getAttribute("data-photo")==="1"),p2=list.find(e=>e.getAttribute("data-photo")==="2"),p3=list.find(e=>e.getAttribute("data-photo")==="3");if(!p1||!p2||!p3)return;const IMGSEL='img,video,.bio-photo,.service-visual,.photo',i1=p1.querySelector(IMGSEL)||p1.firstElementChild,i2=p2.querySelector(IMGSEL)||p2.firstElementChild,i3=p3.querySelector(IMGSEL)||p3.firstElementChild;gsap.set([p1,p2,p3],{willChange:"transform",overflow:"hidden"});const gb=e=>e.getBoundingClientRect(),reset=()=>{gsap.set([p1,p2,p3],{x:0,y:0,scale:1,force3D:!0});i1&&gsap.set(i1,{xPercent:-50,yPercent:-55,x:0,y:0,scale:1.1,force3D:!0,willChange:"transform"});i2&&gsap.set(i2,{xPercent:-50,yPercent:-60,x:0,y:0,scale:1.1,force3D:!0,willChange:"transform"});i3&&gsap.set(i3,{xPercent:-50,yPercent:-60,x:0,y:0,scale:1.1,force3D:!0,willChange:"transform"})},base=()=>{const s=gb(stats),h=gb(head);return{left:s.left,top:h.top}},delta=(el,b,o)=>{const a=gb(el);return{x:b.left-a.left+(o.dx||0),y:b.top-a.top+(o.dy||0),scale:o.scale==null?1:o.scale}},pxParallax=(el,pct)=>{const h=(el&&gb(el).height)||parseFloat(getComputedStyle(el).height)||0;return h*pct};let tl;const build=()=>{tl&&tl.kill();reset();tl=gsap.timeline({defaults:{ease:"none"},scrollTrigger:{trigger:sec,start:"top 35%",end:"+=100%",scrub:1,anticipatePin:1,invalidateOnRefresh:!0,onRefreshInit:reset}});const x3=()=>{const b=base();return delta(p3,b,{dx:44,dy:56,scale:.36})},x2=()=>{const b=base();return delta(p2,b,{dx:18,dy:22,scale:.38})},x1=()=>{const b=base(),v=delta(p1,b,{scale:.79});return v.scale=Math.max(.79,v.scale||.79),v};tl.addLabel("g",0).to(p3,{x:()=>x3().x,y:()=>x3().y,scale:()=>x3().scale},"g").to(p2,{x:()=>x2().x,y:()=>x2().y,scale:()=>x2().scale},"g+=0.06").to(p1,{x:()=>x1().x,y:()=>x1().y,scale:()=>x1().scale},"g+=0.12");i3&&tl.to(i3,{y:()=>pxParallax(i3,.10),force3D:!0},"g");i2&&tl.to(i2,{y:()=>pxParallax(i2,.10),force3D:!0},"g+=0.04");i1&&tl.to(i1,{y:()=>pxParallax(i1,.05),force3D:!0},"g+=0.08")};build();const ro=new ResizeObserver(()=>{try{ScrollTrigger.refresh()}catch{}});[sec,bio,copy,stats,head].forEach(el=>el&&ro.observe(el));return()=>{try{ro.disconnect()}catch{}try{tl&&tl.kill()}catch{}}}))}
			}),
			feature({
				id: 'infoTestimonialsJump',
				stage: "main",
				namespaces: ['info'],
    			selectors: [],
				init: async r=>{const t=["recommendationsOpen1","recommendationsOpen2","recommendationsOpen3","recommendationsOpen4"],n=()=>document.getElementById("recommendations")||document.querySelector('.w-tabs .w-tab-link[data-w-tab="Recommendations"]'),o=()=>{const e=document.getElementById("details")||document.querySelector(".section-details");if(!e)return;const t=e.getBoundingClientRect().top+window.pageYOffset-24;window.scrollTo({top:t,behavior:"smooth"})};t.forEach(t=>{const e=r.querySelector("#"+t)||document.getElementById(t);e&&!e.classList.contains("w-tab-link")&&e.addEventListener("click",e=>{e.preventDefault();(n()||{}).click?.();requestAnimationFrame(()=>requestAnimationFrame(o))},{passive:!1})})}
			}),
			feature({
				id: "wfSliderKick",
				stage: "late",
				namespaces: ["info"],
				selectors: [".w-slider"],
				init: async function(r){try{if(!window.Webflow||!Webflow.require)return;var k=function(t){try{var e=Webflow.require("slider");if(!e)return;try{e.redraw&&e.redraw()}catch{}try{window.dispatchEvent(new Event("resize"))}catch{}requestAnimationFrame(function(){requestAnimationFrame(function(){try{e.redraw&&e.redraw()}catch{}try{window.dispatchEvent(new Event("resize"))}catch{}})})}catch{}};setTimeout(function(){k(r)},60);setTimeout(function(){k(r)},240);var p=r.querySelector(".w-tab-pane")?null:r.querySelector('.w-tab-pane[data-w-tab="Recommendations"]')||r.querySelector('.w-tab-pane');if(!p){var a=r.querySelector('.w-tab-pane[data-w-tab="Recommendations"]');p=a||null}if(p){var o=new MutationObserver(function(){if(p.classList.contains("w--tab-active")){k(r);setTimeout(function(){k(r)},120)}});o.observe(p,{attributes:!0,attributeFilter:["class"]});CoreUtilities&&CoreUtilities.Observers&&CoreUtilities.Observers.addDom&&CoreUtilities.Observers.addDom(o)}}catch(e){console.warn("[wfSliderKick] failed",e)}}
			})
		);
	
		// Page: Case Study
		registries.pages.caseStudy.push(
			feature({
				id: 'csScrollBackground',
				stage: 'main',
				namespaces: '*', 
				selectors: ['.cs-details'],
				init: async r=>{const c=r.closest(".barba-container")||document.querySelector(".barba-container")||r;if(!c||c.__csbg2)return;c.__csbg2=1;const d=c.querySelector(".cs-details"),mw=c.querySelector(".cs-morework");if(!d||!mw){c.__csbg2=0;return}const more=mw.querySelector(".cs-morework-outer")||mw,cs=getComputedStyle(c).backgroundColor,bg="var(--colors--background)",bd="var(--colors--border)";let last="";c.style.transition="background-color .6s ease";const set=v=>{if(v===last)return;last=v,gsap&&gsap.set?gsap.set(c,{backgroundColor:v,overwrite:"auto"}):c.style.backgroundColor=v};let raf=0;const calc=()=>{raf=0;const vh=innerHeight||0,dt=d.getBoundingClientRect().top,mt=more.getBoundingClientRect().top;mt<=vh*.8?set(bd):dt<=vh?set(bg):set(cs)};const tick=()=>{raf||(raf=requestAnimationFrame(calc))};addEventListener("scroll",tick,{passive:!0});addEventListener("resize",tick,{passive:!0});let mo=null,g=c.querySelector(".cs-gallery");const hookImgs=()=>{if(!g)return;const imgs=[...g.querySelectorAll("img")];imgs.forEach(im=>{im.__csbgh||(im.__csbgh=1,(im.complete&&im.naturalWidth>0)|| (im.addEventListener("load",tick,{once:!0}),im.addEventListener("error",tick,{once:!0})))})};if(g){hookImgs();mo=new MutationObserver(()=>{hookImgs();tick()});try{mo.observe(g,{childList:!0,subtree:!0})}catch{}}tick();setTimeout(tick,150);setTimeout(tick,600);window.addEventListener("load",tick,{once:!0});try{document.fonts&&document.fonts.ready&&document.fonts.ready.then(tick).catch(()=>{})}catch{}return()=>{removeEventListener("scroll",tick);removeEventListener("resize",tick);if(mo)try{mo.disconnect()}catch{}try{delete c.__csbg2}catch{}}}
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

// Scroll Manager
	window.ScrollManager=function(){var l=document.scrollingElement||document.documentElement,b=0,y=0,ov="",sb="";function topHard(){var e=l;try{document.documentElement.style.scrollBehavior="auto"}catch(t){}try{e.scrollTop=0,document.body.scrollTop=0,window.scrollTo(0,0)}catch(t){}try{window.ScrollTrigger&&ScrollTrigger.clearScrollMemory&&ScrollTrigger.clearScrollMemory("manual")}catch(t){}}function setY(t){var e=l;try{document.documentElement.style.scrollBehavior="auto"}catch(o){}try{e.scrollTop=t,document.body.scrollTop=t,window.scrollTo(0,t)}catch(o){}}try{history.scrollRestoration="manual"}catch(t){}try{sb=getComputedStyle(document.documentElement).scrollBehavior||""}catch(t){}return{lock:function(){if(b)return;b=1;try{document.documentElement.style.scrollBehavior="auto"}catch(t){}try{l=document.scrollingElement||document.documentElement}catch(t){}y=window.pageYOffset||l.scrollTop||0;ov=document.documentElement.style.overflow||"";document.documentElement.style.overflow="hidden";document.body.style.overflow="hidden";document.body.style.position="fixed";document.body.style.top=-y+"px";document.body.style.width="100%";},unlock:function(){if(!b)return;b=0;document.documentElement.style.overflow=ov;document.body.style.overflow="";document.body.style.position="";document.body.style.top="";document.body.style.width="";try{sb?document.documentElement.style.scrollBehavior=sb:document.documentElement.style.removeProperty("scroll-behavior")}catch(t){}},topHard:topHard,setY:setY}}();
	
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
		function releasePreloadingGuard(){try{var e=document&&document.documentElement;e&&e.hasAttribute("data-preloading")&&e.removeAttribute("data-preloading")}catch(e){}}
		async function runEntryFlow(r,t){r=r||document,t=t||{};let n=null,e=0,a=null;try{t.withCoverOut&&TransitionEffects&&TransitionEffects.coverOut&&(a=TransitionEffects.coverOut()),InitManager&&InitManager.run&&await InitManager.run(r,{preserveServicePins:!1});const i=runPageEntryAnimations?runPageEntryAnimations(r):null;n=i&&i.tl?i.tl:gsap.timeline(),e=i&&"number"==typeof i.entryOffset?i.entryOffset:0,releasePreloadingGuard()}catch(r){console.warn("[EntryOrchestrator.runEntryFlow] failed before timeline",r),n=n||null,e=0,releasePreloadingGuard()}const i=t.withCoverOut?e:0;if(n&&n.duration&&n.duration())try{n.play(i),await new Promise((r=>n.eventCallback("onComplete",r)))}catch(r){console.warn("[EntryOrchestrator.runEntryFlow] timeline error",r)}if(a)try{await a}catch(r){console.warn("[EntryOrchestrator.runEntryFlow] coverOut failed",r)}try{await finalizeAfterEntry(r)}catch(r){console.warn("[EntryOrchestrator.finalizeAfterEntry] failed",r)}}
		
		// Entry Animations
		var EntryAnimations = {};
		EntryAnimations.selected=function(root){root=root||document;var container=root.querySelector(".selected-container"),content=container&&container.querySelector(".selected-content"),tl=gsap.timeline();if(!container||!content||!window.gsap)return tl;function revealAllImmediate(){try{var nodes=[content].concat([].slice.call(content.querySelectorAll(".selected-item-outer"))).concat([].slice.call(content.querySelectorAll(".appear-in-line"))).concat([].slice.call(content.querySelectorAll(".selected-item-outer .selected-visual"))).concat([].slice.call(content.querySelectorAll(".selected-item-outer .selected-item-header .headline-md"))).concat([].slice.call(content.querySelectorAll(".selected-item-outer .selected-item-details")));nodes.length&&gsap.set(nodes,{visibility:"visible",opacity:1,clearProps:"visibility,opacity"}),document.documentElement.removeAttribute("data-preloading")}catch(e){}}function runEntry(){var vw=Math.max(document.documentElement.clientWidth,window.innerWidth||0),vh=window.innerHeight||document.documentElement.clientHeight||0,items=[].slice.call(content.querySelectorAll(".selected-item-outer"));if(!items.length)return tl;function prepare(el){if(el.__entryPrepared)return;var visual=el.querySelector(".selected-visual"),heading=el.querySelector(".selected-item-header .headline-md"),details=el.querySelector(".selected-item-details"),lines=el.querySelectorAll(".selected-item-details .body-sm");visual&&gsap.set(visual,{scaleY:0,transformOrigin:"bottom center",opacity:0,willChange:"transform,opacity"}),heading&&gsap.set(heading,{opacity:0,willChange:"opacity,transform"}),details&&gsap.set(details,{opacity:0,height:0,willChange:"height,opacity"}),lines.length&&gsap.set(lines,{opacity:0,y:20,filter:"blur(10px)",willChange:"transform,opacity,filter"}),el.__entryPrepared=1}items.forEach(prepare);var meta=items.map(function(el){var rect=el.getBoundingClientRect();return{el:el,rect:rect,area:Math.max(0,Math.min(rect.right,vw)-Math.max(rect.left,0))*Math.max(0,Math.min(rect.bottom,vh)-Math.max(rect.top,0)),cx:(rect.left+rect.right)/2}}),primary=meta.filter(function(entry){return entry.area>1}).sort(function(a,b){return a.rect.left-b.rect.left});if(!primary.length){var centerX=vw/2;primary=meta.slice().sort(function(a,b){return Math.abs(a.cx-centerX)-Math.abs(b.cx-centerX)}).slice(0,2).sort(function(a,b){return a.rect.left-b.rect.left})}var primarySet=new Set(primary.map(function(entry){return entry.el}));meta.forEach(function(entry){if(entry.el.__entryDone||primarySet.has(entry.el))return;var el=entry.el,visual=el.querySelector(".selected-visual"),heading=el.querySelector(".selected-item-header .headline-md"),details=el.querySelector(".selected-item-details"),lines=el.querySelectorAll(".selected-item-details .body-sm");visual&&gsap.set(visual,{scaleY:1,opacity:1,clearProps:"willChange"}),heading&&gsap.set(heading,{opacity:1,clearProps:"willChange"}),details&&gsap.set(details,{opacity:1,height:"auto",clearProps:"willChange"}),lines.length&&gsap.set(lines,{opacity:1,y:0,filter:"blur(0px)",clearProps:"willChange"}),el.__entryDone=1});primary.forEach(function(entry,index){var el=entry.el;if(el.__entryDone)return;var visual=el.querySelector(".selected-visual"),heading=el.querySelector(".selected-item-header .headline-md"),details=el.querySelector(".selected-item-details"),lines=el.querySelectorAll(".selected-item-details .body-sm"),base=.14*index;visual&&tl.set(visual,{opacity:1},base).to(visual,{scaleY:1,opacity:1,duration:.75,ease:"power2.out",clearProps:"willChange"},base);heading&&tl.set(heading,{opacity:1},base+.16).call(function(h){var ready=CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve();ready.then(function(){try{if(window.SplitText&&window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){var split=splitAndMask(h);animateLines(split.lines).eventCallback("onComplete",function(){safelyRevertSplit(split,h)})}else gsap.to(h,{y:0,opacity:1,duration:.55,ease:"power2.out"})}catch(e){gsap.to(h,{y:0,opacity:1,duration:.55,ease:"power2.out"})}})},[heading],base+.16);details&&tl.to(details,{opacity:1,height:"auto",duration:.4,ease:"power2.out",clearProps:"willChange"},base+.56);lines.length&&tl.to(lines,{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"power2.out",stagger:.12,clearProps:"willChange"},base+.56);el.__entryDone=1});return tl}function doubleRAF(){return new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve)})})}function start(){revealAllImmediate();return doubleRAF().then(runEntry)}if(container.hasAttribute("data-loop-ready"))start();else{var onReady=function(){content.removeEventListener("selected:loop-ready",onReady,!0);container.removeEventListener("selected:loop-ready",onReady,!0);start()};content.addEventListener("selected:loop-ready",onReady,!0);container.addEventListener("selected:loop-ready",onReady,!0);setTimeout(start,520)}return tl};
		EntryAnimations.resources=function(e){e=e||document;var t=gsap.timeline(),n=e.querySelector(".section-resources"),i=e.querySelector(".hero-section-text .hero-text h1"),r=e.querySelector(".hero-section-text .hero-text .hero-subtext");if(!n&&!i&&!r)return t;n&&gsap.set(n,{visibility:"visible",autoAlpha:0,y:120,filter:"blur(10px)",willChange:"transform,opacity,filter"});i&&gsap.set(i,{visibility:"visible",autoAlpha:0});r&&gsap.set(r,{visibility:"visible",autoAlpha:0,y:20,filter:"blur(10px)",willChange:"transform,opacity,filter"});t.addLabel("res",0);n&&t.to(n,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.9,ease:"power2.out",clearProps:"y,filter,willChange"},"res");if(i){t.addLabel("res_h","res+=0.2");t.set(i,{autoAlpha:1},"res_h").call(function(){var e=CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve();e.then(function(){try{if(window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){var e=splitAndMask(i);animateLines(e.lines).eventCallback("onComplete",function(){safelyRevertSplit(e,i)})}else gsap.to(i,{y:0,autoAlpha:1,duration:.6,ease:"power2.out"})}catch(t){gsap.to(i,{y:0,autoAlpha:1,duration:.6,ease:"power2.out"})}})},null,"res_h")}r&&t.to(r,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out",clearProps:"y,filter,willChange"},i?"res_h+=0.35":"res+=0.35");return t};
		EntryAnimations.capabilities=function(e,i){e=e||document;i=i||{};var t=!!i.delayHero,a=gsap.timeline(),l=e.querySelector(".showreel-headline"),o=e.querySelector(".showreel-container"),r=e.querySelectorAll(".showreel-anchors a");if(!l&&!o&&!r.length)return a;l&&gsap.set(l,{autoAlpha:0,visibility:"visible"});o&&(gsap.set(o,{autoAlpha:1,visibility:"visible",overflow:"hidden"}),gsap.set(o,{clipPath:"polygon(100% 100%,100% 100%,100% 100%,100% 100%)",willChange:"clip-path"}));r.length&&gsap.set(r,{opacity:0,y:20,filter:"blur(10px)",willChange:"transform,opacity,filter"});var n=t?0.2:0;return a.addLabel("hero",n),a.addLabel("showreel","hero+=0.2"),l&&a.set(l,{autoAlpha:1},"hero").call(function(){var e=CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve();e.then(function(){try{if(window.SplitText&&window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){var e=splitAndMask(l);animateLines(e.lines).eventCallback("onComplete",function(){safelyRevertSplit(e,l)})}else gsap.to(l,{autoAlpha:1,duration:.01})}catch(t){gsap.to(l,{autoAlpha:1,duration:.01})}})},null,"hero"),o&&a.to(o,{clipPath:"polygon(0% 0%,100% 0%,100% 100%,0% 100%)",duration:1.05,ease:"power3.inOut",clearProps:"willChange"},"showreel"),r.length&&a.to(r,{opacity:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out",stagger:.12,clearProps:"transform,opacity,filter,willChange"},"showreel+=0.5"),a};
		EntryAnimations.info=function(e){e=e||document;var t=gsap.timeline(),n=e.querySelector(".hero-section-text h1"),i=e.querySelector(".hero-subtext"),o=[...e.querySelectorAll('.bio-photo-wrapper[data-photo]')].sort((e,t)=>(+e.getAttribute("data-photo")||0)-(+t.getAttribute("data-photo")||0));if(o.length){gsap.set(o,{visibility:"visible",opacity:0,y:120,filter:"blur(10px)",willChange:"transform,opacity,filter"});var r=.9,a=.14;t.addLabel("p",0).to(o,{opacity:1,y:0,filter:"blur(0px)",duration:r,ease:"power2.out",stagger:a,clearProps:"y,filter,willChange"},"p").addLabel("h","p+="+(a+r-.6))}else t.addLabel("h",0);n&&(gsap.set(n,{visibility:"visible",autoAlpha:0}),t.set(n,{autoAlpha:1},"h").call(function(){(CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve()).then(function(){if(window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){var e=splitAndMask(n);animateLines(e.lines).eventCallback("onComplete",function(){safelyRevertSplit(e,n)})}else gsap.to(n,{y:0,opacity:1,duration:.6,ease:"power2.out"})})},null,"h"));i&&(gsap.set(i,{visibility:"visible",autoAlpha:0,y:20,filter:"blur(10px)"}),t.to(i,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"h+=0.48"));return t};
		EntryAnimations.caseStudy=function(e){e=e||document;var t=gsap.timeline(),i=e.querySelector(".cs-hero-image"),r=e.querySelector(".cs-headline-wrapper"),a=e.querySelector("h1.cs-headline")||e.querySelector(".cs-headline"),n=e.querySelector(".cs-titles-inner .headline-m");i&&gsap.set(i,{autoAlpha:0,y:100,filter:"blur(10px)"}),r&&gsap.set(r,{autoAlpha:1,clearProps:"visibility"}),a&&gsap.set(a,{autoAlpha:0,display:"block",clearProps:"visibility"}),n&&gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),i&&t.to(i,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.7,ease:"power2.out"},0),a&&t.addLabel("cs_h",.15).set(r,{autoAlpha:1,clearProps:"visibility"},"cs_h").set(a,{autoAlpha:1,display:"block",clearProps:"visibility"},"cs_h").call(function(){var e=CoreUtilities&&CoreUtilities.Fonts&&CoreUtilities.Fonts.ready?CoreUtilities.Fonts.ready():Promise.resolve();e.then(function(){if(window.SplitText&&window.splitAndMask&&window.animateLines&&window.safelyRevertSplit)try{var e=splitAndMask(a);animateLines(e.lines).eventCallback("onComplete",function(){safelyRevertSplit(e,a)})}catch(e){gsap.to(a,{y:0,autoAlpha:1,duration:.6,ease:"power2.out"})}else gsap.to(a,{y:0,autoAlpha:1,duration:.6,ease:"power2.out"})})},null,"cs_h"),n&&t.to(n,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.5,ease:"power2.out"},"cs_h+=0.6");return t};
		function runPageEntryAnimations(e){const{delayHero:t,entryOffset:r}=getEntryConfig(e),a=gsap.timeline(),n=(e.dataset&&e.dataset.barbaNamespace)||"";return"info"===n&&a.add(EntryAnimations.info(e),0),"resources"===n&&a.add(EntryAnimations.resources(e),0),("capabilities"===n||e.querySelector(".showreel-headline")||e.querySelector(".showreel-container"))&&a.add(EntryAnimations.capabilities(e,{delayHero:t}),0),e.querySelector(".selected-item-outer")&&a.add(EntryAnimations.selected(e),0),(e.querySelector(".cs-hero-image")||e.querySelector(".cs-headline"))&&a.add(EntryAnimations.caseStudy(e),0),{tl:a,entryOffset:r}}
		
		// Barba init
		function init() {
			if (window.__barbaInited) return;
			window.__barbaInited = true;
		
			if (typeof logBarbaSanity === 'function') logBarbaSanity();

			// register ONCE hook first
			barba.hooks.once(async ({ next }) => {
				if (window.__ENTRY_ONCE_RAN) return;
				window.__ENTRY_ONCE_RAN = 1;
				
				try {
					ScrollManager.lock();
					ScrollManager.topHard();
					await WebflowAdapter.enter(next);
				
					// if you ever enable it again:
					// if (PreloaderService.shouldRun()) await PreloaderService.maybeRun();
				
					await runEntryFlow(next.container, { withCoverOut: false });
				} catch (e) {
					console.warn("[once] entry failed", e);
				} finally {
					try {
						if (EntryOrchestrator && EntryOrchestrator.releasePreloadingGuard) {
							EntryOrchestrator.releasePreloadingGuard();
						} else {
							document.documentElement.removeAttribute("data-preloading");
						}
					} catch (_) {}
					
					ScrollManager.unlock();
				}
			});
			
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
						name: 'fade',
						from: { namespace: ['selected','archive','resources'] },
						to: { namespace: ['selected','archive','resources'] },
						async leave({ current }) {
							ScrollManager.lock();
  							ScrollManager.topHard();
							
							NavigationManager?.setLock('overlay', true);
							window.__logTransitionChoice && window.__logTransitionChoice('fade', arguments[0]);
							await gsap.to(current.container, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' });
							
							await InitManager.cleanup({ preserveServicePins: false });
							current.container.remove();
						},
						async enter({ next }) {
							ScrollManager.topHard();
							await WebflowAdapter.enter(next);
							try{document.documentElement.removeAttribute("data-preloading")}catch{}
							
							NavigationManager?.setLock('overlay', false);
							await runEntryFlow(next.container, { withCoverOut: false });
							
							document.documentElement.removeAttribute('data-preloading');
							ScrollManager.unlock();
						},
						afterEnter({ next }) {
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
							ScrollManager.lock();
  							ScrollManager.topHard();
							
							NavigationManager?.setLock('overlay', true);
							window.__logTransitionChoice && window.__logTransitionChoice('swipe', arguments[0]);
							const ok = await TransitionEffects.coverIn();
							if (!ok) { await gsap.to(current.container, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }); }
							
							await InitManager.cleanup({ preserveServicePins: false });
							current.container.remove();
						},
						async enter({ next }) {
							ScrollManager.topHard();
							await WebflowAdapter.enter(next);
							try { document.documentElement.removeAttribute("data-preloading"); } catch {}
							
							NavigationManager?.setLock('overlay', false);
							await EntryOrchestrator.runEntryFlow(next.container, { withCoverOut: true });
							
							document.documentElement.removeAttribute('data-preloading');
							ScrollManager.unlock();
						},
						afterEnter({ next }) {
							EntryOrchestrator?.forceCloseMenus?.();
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
			releasePreloadingGuard,
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

	function waitFor(e,a,n){if(n=n||80,e())a();else var r=0,t=setInterval((function(){e()?(clearInterval(t),a()):++r>300&&clearInterval(t)}),n)}
	
	(function () {
		function boot() {
			if (window.__ENTRY_BOOTED) return;
			window.__ENTRY_BOOTED = 1;

			// 1) Always hard-reset scroll on real page load / reload
			try { if (window.ScrollManager && typeof ScrollManager.topHard === "function") { ScrollManager.topHard(); }} catch (e) { console.warn("[BOOT] ScrollManager.topHard on boot failed", e); }
			
			// 2) Set up navigation & debug
			try { NavigationManager.init({ debug: DEBUG }); NavigationManager.ensureBarbaClickRouting(); } catch (a) { console.warn("[BOOT] NavigationManager init failed", a); }
			try { DebugCore.install(); } catch (e) { console.warn("[BOOT] DebugCore.install failed", e); }

			// 3) Fallback if Barba never comes up
			function fallback(){if(!window.__ENTRY_FALLBACK_RAN){window.__ENTRY_FALLBACK_RAN=1;try{var r=document.querySelector('[data-barba="container"]')||document.body;if(EntryOrchestrator&&EntryOrchestrator.runEntryFlow&&r)EntryOrchestrator.runEntryFlow(r,{withCoverOut:!1}).finally((function(){try{EntryOrchestrator&&EntryOrchestrator.releasePreloadingGuard&&EntryOrchestrator.releasePreloadingGuard()}catch(r){}}));else{console.warn("[BOOT] runEntryFlow missing");try{EntryOrchestrator&&EntryOrchestrator.releasePreloadingGuard&&EntryOrchestrator.releasePreloadingGuard()}catch(r){}}}catch(r){console.warn("[BOOT] fallback entry failed",r);try{EntryOrchestrator&&EntryOrchestrator.releasePreloadingGuard&&EntryOrchestrator.releasePreloadingGuard()}catch(r){}}}}

			// 4) Wait for GSAP + InitManager + EntryOrchestrator
			//waitFor((function(){return!!(window.gsap&&window.InitManager&&window.EntryOrchestrator)}),(function(){try{var n=document.querySelector('[data-barba="container"]')||document.body;n&&!window.__HARD_ENTRY_DONE&&(window.__HARD_ENTRY_DONE=!0,EntryOrchestrator.runEntryFlow(n,{withCoverOut:!1}).catch((function(n){console.warn("[BOOT] hard entry runEntryFlow failed",n)})))}catch(n){console.warn("[BOOT] hard entry setup failed",n)}waitFor((function(){return!!window.barba&&"function"==typeof barba.init}),(function(){try{EntryOrchestrator.init()}catch(n){console.warn("[BOOT] EntryOrchestrator.init failed",n),fallback()}}),80),setTimeout((function(){window.__barbaInited||fallback()}),250)}),120);
			waitFor((function(){return!!(window.gsap&&window.InitManager&&window.EntryOrchestrator)}),(function(){try{var n=document.querySelector('[data-barba="container"]')||document.body;n&&!window.__HARD_ENTRY_DONE&&(window.__HARD_ENTRY_DONE=1,EntryOrchestrator.runEntryFlow(n,{withCoverOut:!1}).catch((function(n){console.warn("[BOOT] hard entry runEntryFlow failed",n)})))}catch(n){console.warn("[BOOT] hard entry setup failed",n)}waitFor((function(){return!!window.barba&&"function"==typeof barba.init}),(function(){try{EntryOrchestrator.init()}catch(n){console.warn("[BOOT] EntryOrchestrator.init failed",n),fallback()}}),80),setTimeout((function(){window.__barbaInited||fallback()}),250)}),120);
		}
		if (document.readyState !== "loading") { boot(); } else { document.addEventListener("DOMContentLoaded", boot, { once: true }); }
	})();
	
})();
}

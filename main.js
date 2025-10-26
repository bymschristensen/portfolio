// GSAP
	try{gsap.registerPlugin(...[ScrollTrigger,Flip,SplitText,TextPlugin,Observer].filter(Boolean))}catch{}
	const DEBUG = true;
	window.DEBUG = DEBUG;

// Navigation Manager
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
		function reset({next:t}){if(!t?.html)return;const e=(new DOMParser).parseFromString(t.html,"text/html"),a=e.querySelector("html").getAttribute("data-wf-page"),r=e.querySelector("script[data-wf-site-data]")?.textContent;if(document.documentElement.setAttribute("data-wf-page",a),document.querySelectorAll("script[data-wf-site-data]").forEach((t=>t.remove())),r){const t=document.createElement("script");t.type="application/json",t.setAttribute("data-wf-site-data",""),t.textContent=r,document.head.appendChild(t)}window.Webflow?.destroy?.(),window.Webflow?.ready?.();const n=Webflow.require?.("ix2");n?.init()}
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
		const Observers={addGsap:e=>(e&&state.gsapObservers.push(e),e),addDom:e=>(e&&state.domObservers.push(e),e),addTicker:e=>(window.gsap&&"function"==typeof e&&(gsap.ticker.add(e),state.tickers.push(e)),e),clearAll({preserveServicePins:e=!1}={}){try{window.ScrollTrigger&&ScrollTrigger.getAll().forEach((s=>{e&&s.trigger?.classList?.contains("section-single-service")||s.kill()}))}catch{}try{state.gsapObservers.forEach((e=>{try{e.kill&&e.kill()}catch{}}))}catch{}state.gsapObservers=[];try{state.tickers.forEach((e=>{try{gsap.ticker.remove(e)}catch{}}))}catch{}state.tickers=[];try{state.domObservers.forEach((e=>{try{e.disconnect&&e.disconnect()}catch{}}))}catch{}state.domObservers=[]}};
		const Cursor={setDestroy(t){state.cursorDestroy="function"==typeof t?t:null},destroy(){try{state.cursorDestroy&&state.cursorDestroy()}catch{}finally{state.cursorDestroy=null}}};
		function nukeCursorDom(){try{document.querySelectorAll(".cursor-webgl, .custom-cursor").forEach((r=>{try{r.remove()}catch{}}))}catch{}}
		async function doubleRAF(){await new Promise((e=>requestAnimationFrame(e))),await new Promise((e=>requestAnimationFrame(e)))}
		const InitManager={async run(r=document,{preserveServicePins:e=!1}={}){Observers.clearAll({preserveServicePins:e}),Cursor.destroy(),nukeCursorDom(),"function"==typeof window.initAllYourInits&&window.initAllYourInits(r),await doubleRAF(),await doubleRAF();try{window.ScrollTrigger&&ScrollTrigger.refresh()}catch{}},cleanup(r={}){Observers.clearAll(r),Cursor.destroy(),nukeCursorDom()}};
		const Fonts={async ready(){try{await(document.fonts?.ready||Promise.resolve())}catch{}}};
		const Text={
			splitAndMask(e){if(!e)return null;if(e._originalHTML||(e._originalHTML=e.innerHTML),e._split)return e._split;const t=getComputedStyle(e).whiteSpace||"normal",i=e.style.whiteSpace,l=e.style.display;e.style.whiteSpace=t,"inline"===getComputedStyle(e).display&&(e.style.display="block"),e.clientWidth;const n=new SplitText(e,{type:"lines",linesClass:"line",reduceWhiteSpace:!1});return n.lines.forEach((e=>{const i=e.getBoundingClientRect().height||e.offsetHeight||0,l=document.createElement("div");l.className="text-mask",l.style.overflow="hidden",l.style.display="block",l.style.height=i+"px",e.style.whiteSpace=t,e.style.display="block",e.parentNode.insertBefore(l,e),l.appendChild(e)})),gsap.set(n.lines,{yPercent:100,rotation:10,transformOrigin:"0 10%",willChange:"transform,opacity"}),e.style.whiteSpace=i,e.style.display=l,e._split=n,n},
			safelyRevertSplit(e,t){if(e&&t){try{e.revert()}catch{}t._originalHTML&&(t.innerHTML=t._originalHTML,delete t._originalHTML),delete t._split}},
			animateLines:e=>(gsap.set(e,{transformOrigin:"0 10%",rotation:10,yPercent:100,willChange:"transform, opacity"}),gsap.to(e,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08}))
		};
		
		window.splitAndMask ||= Text.splitAndMask;
		window.safelyRevertSplit ||= Text.safelyRevertSplit;
		window.animateLines ||= Text.animateLines;
		
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
				init:async(root)=>{const els=[...document.querySelectorAll('.theme-switch,[data-theme-toggle]')];if(!els.length)return;const get=()=>document.documentElement.getAttribute('data-theme')||'light';const set=t=>{document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t);};const paint=el=>el.classList.toggle('dark',get()==='dark');els.forEach(el=>{if(el._themeBound)return;el._themeBound=!0;paint(el);const onClick=()=>{set(get()==='dark'?'light':'dark');els.forEach(paint);};el.addEventListener('click',onClick);el._unbind=()=>el.removeEventListener('click',onClick);});addEventListener('storage',e=>{if(e.key==='theme'){document.documentElement.setAttribute('data-theme',e.newValue||'light');els.forEach(paint);}});}
			}),
	
			feature({
				id:'textAnimation',
				stage:'main',
				namespaces:'*',
				selectors:['.ta-one'],
				init: async r=>{await CoreUtilities.Fonts.ready();const{splitAndMask:a,safelyRevertSplit:t,animateLines:e}=CoreUtilities.Text,n=".ta-one",o=[...r.querySelectorAll(n)].filter(s=>!s.closest(".cs-headline"));o.forEach(s=>{gsap.set(s,{autoAlpha:0}),t(s._split,s)});const c=CoreUtilities.Observers.addDom(new IntersectionObserver((s,i)=>{s.forEach(d=>{if(!d.isIntersecting)return;const f=d.target;gsap.set(f,{autoAlpha:1});const u=a(f);e(u.lines).eventCallback("onComplete",()=>{t(u,f),f.__taDone=!0}),i&&i.unobserve(f)})},{root:null,rootMargin:"0px 0px -5% 0px",threshold:0}));o.forEach(s=>{if(s.__taDone||s.__taOneDone)return;c.observe(s);const i=s.getBoundingClientRect();if(i.top<innerHeight&&i.bottom>0){c.unobserve(s);gsap.set(s,{autoAlpha:1});const d=a(s);e(d.lines).eventCallback("onComplete",()=>{t(d,s),s.__taDone=!0})}});r.querySelectorAll(".w-tabs .w-tab-pane").forEach(s=>{CoreUtilities.Observers.addDom(new MutationObserver(()=>{if(!s.classList.contains("w--tab-active"))return;s.querySelectorAll(n).forEach(f=>{if(f.__taDone||f.__taOneDone||f.closest(".cs-headline"))return;const u=f.getBoundingClientRect();if(u.top<innerHeight&&u.bottom>0){gsap.set(f,{autoAlpha:1});const v=a(f);e(v.lines).eventCallback("onComplete",()=>{t(v,f),f.__taDone=!0})}})})).observe(s,{attributes:!0,attributeFilter:["class"]})})}
			}),
	
			feature({
				id: 'appearInLine',
				stage: 'main',
				namespaces: '*',
				selectors: ['.appear-in-line'],
				init: async r=>{const s=".appear-in-line";function a(e){if(e.__ailArmed)return;e.__ailArmed=!0;let t=[],i=[];function n(){try{t.forEach(e=>e.revert())}catch{}t=[],i=[],[...e.querySelectorAll(":scope > *:not(:empty)")].forEach(o=>{const r=getComputedStyle(o),s=parseInt(r.columnCount,10)||1,c=o.getBoundingClientRect();if(s>1){const r=new SplitText(o,{type:"lines",linesClass:"split-line"});t.push(r);const l=c.width/s,u=Array.from({length:s},()=>[]);r.lines.forEach(t=>{const i=t.getBoundingClientRect().left-c.left,n=Math.min(s-1,Math.max(0,Math.floor(i/l)));u[n].push(t),gsap.set(t,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"})}),u.forEach(e=>i.push(e))}else gsap.set(o,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"}),i.push([o])})}function o(){if(e.__ailPlaying)return;e.__ailPlaying=!0,e.__ailDone=!1,n(),i.forEach((e,t)=>gsap.to(e,{y:0,opacity:1,filter:"blur(0px)",duration:.8,ease:"power2.out",delay:.12*t})),gsap.delayedCall(.12*(i.length-1)+.85,()=>{try{t.forEach(e=>e.revert())}catch{}e.__ailPlaying=!1,e.__ailDone=!0})}const c=CoreUtilities.Observers.addDom(new IntersectionObserver((t,i)=>{t.forEach(t=>{t.isIntersecting&&(i.unobserve(e),o())})},{root:null,rootMargin:"0px 0px -12% 0px",threshold:0}));c.observe(e);const l=e.getBoundingClientRect();l.top<innerHeight&&l.bottom>0&&(c.unobserve(e),o()),e.__ailReplay=(()=>{e.__ailPlaying||(e.__ailDone=!1,o())}),e.__ailTearDown=(()=>{try{t.forEach(e=>e.revert())}catch{}t=[],i=[]})}r.querySelectorAll(s).forEach(a),r.querySelectorAll(".w-tabs .w-tab-pane").forEach(e=>{CoreUtilities.Observers.addDom(new MutationObserver(()=>{e.classList.contains("w--tab-active")&&e.querySelectorAll(s).forEach(e=>{a(e),e.__ailReplay&&e.__ailReplay()})}).observe(e,{attributes:!0,attributeFilter:["class"]}))})}
			}),
	
			feature({
				id: 'navigation',
				stage: 'main',
				namespaces: '*',
				selectors: ['.nav-primary-wrap'],
				init: async(r)=>{try{const ns=r?.dataset?.barbaNamespace||r.getAttribute?.("data-barba-namespace")||"",D=document;D.querySelectorAll(".nav-primary-wrap").forEach(w=>{if(w.__navReady)return;w.__navReady=!0;const btn=w.querySelector(".nav-button-menu"),label=w.querySelector(".nav-button-text"),phone=w.querySelector(".phone-number"),mins=w.querySelectorAll(".button-minimal-darkmode"),links=w.querySelectorAll(".menu-link"),lineText=w.querySelector(".ta-one-menu"),backdrop=w.querySelector(".menu-wrapper"),box=w.querySelector(".menu-container"),fBtn=w.querySelector(".nav-button-filter"),fBox=w.querySelector(".filters-container"),fItems=w.querySelectorAll(".modal-filters-item"),fCap=w.querySelector(".modal-filters-caption"),fl1=w.querySelector(".filter-line-1"),fl2=w.querySelector(".filter-line-2");if(!btn||!label||!backdrop||!box){w._menuTimeline=null;w._filterTimeline=null;return}const lock=t=>{try{document.body.style.overflow=t?"hidden":""}catch{}},hideMenuHard=()=>{try{box&&(box.style.display="none",box.removeAttribute("data-open"));backdrop&&(backdrop.style.display="none",backdrop.removeAttribute("data-open"));label&&label.dataset&&label.dataset.orig&&(label.textContent=label.dataset.orig);lock(!1)}catch{}},hideFilterHard=()=>{try{fBox&&(fBox.style.display="none",fBox.removeAttribute("data-open"));backdrop&&(backdrop.style.display="none",backdrop.removeAttribute("data-open"));lock(!1)}catch{}};backdrop.style.display="none";box.style.display="none";fBox&&(fBox.style.display="none");label.dataset.orig=label.textContent||"Menu";const showMenu=()=>{backdrop.style.display="flex",box.style.display="flex",backdrop.setAttribute("data-open","1"),box.setAttribute("data-open","1"),lock(!0)},showFilter=()=>{backdrop.style.display="flex",backdrop.setAttribute("data-open","1"),fBox&&(fBox.style.display="flex",fBox.setAttribute("data-open","1")),lock(!0)};let splitRan=!1;const playMenuTitle=()=>{if(splitRan||!lineText)return;splitRan=!0;try{if(window.splitAndMask&&window.animateLines&&window.safelyRevertSplit){const s=splitAndMask(lineText);animateLines(s.lines).eventCallback("onComplete",()=>{safelyRevertSplit(s,lineText)})}}catch{}};const tl=gsap.timeline({paused:!0});tl.call(playMenuTitle,null,0);phone&&tl.from(phone,{opacity:0,duration:.35},">");mins.length&&tl.from(mins,{opacity:0,duration:.35,stagger:.12},"<");links.length&&tl.from(links,{opacity:0,yPercent:240,duration:.4,stagger:.1},"<");tl.to(label,{text:"Close",duration:.2},"<");tl.eventCallback("onReverseComplete",hideMenuHard);let guard=null;const arm=(t,hide)=>{guard&&gsap.ticker.remove(guard),guard=()=>{if(!t.reversed())return;(t.time()<=.02||t.progress()<=.02||!t.isActive())&&(hide(),gsap.ticker.remove(guard),guard=null)},gsap.ticker.add(guard),gsap.delayedCall(.6,()=>{t.reversed()&&(hide(),guard&&(gsap.ticker.remove(guard),guard=null))})};let state=null;const openMenu=()=>{state="menu",showMenu(),tl.timeScale(1).play(0)},closeMenu=()=>{tl.timeScale(2).reverse(),arm(tl,hideMenuHard),state=null},toggleMenu=()=>{if("menu"===state)return closeMenu();if("filter"===state&&tlf){tlf.timeScale(2).reverse();arm(tlf,hideFilterHard);gsap.delayedCall(.02,openMenu);return}openMenu()};btn.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),toggleMenu()},{passive:!1});let tlf=null;if(fBtn&&fBox&&fItems.length){ns==="archive"?(fBtn.style.display="flex",gsap.to(fBtn,{opacity:1,duration:.2})):gsap.to(fBtn,{opacity:0,duration:.2,onComplete:()=>{fBtn.style.display="none"}});tlf=gsap.timeline({paused:!0}).to(fBox,{opacity:1,duration:.35,ease:"power2.out"},0);fl1&&tlf.to(fl1,{rotation:45,transformOrigin:"center",duration:.3},0);fl2&&tlf.to(fl2,{rotation:-45,marginTop:"-4px",transformOrigin:"center",duration:.3},0);fCap&&tlf.from(fCap,{opacity:0,duration:.4},"<");fItems.length&&tlf.from(fItems,{opacity:0,duration:.6,stagger:.15},"<");tlf.eventCallback("onReverseComplete",hideFilterHard);const openFilter=()=>{state="filter",showFilter(),tlf.timeScale(1).play(0)},closeFilter=()=>{tlf.timeScale(2).reverse(),arm(tlf,hideFilterHard),state=null};fBtn.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),"filter"===state?closeFilter():"menu"===state?(closeMenu(),gsap.delayedCall(.02,openFilter)):openFilter()},{passive:!1})}const onEsc=e=>{"Escape"===e.key&&("menu"===state?closeMenu():"filter"===state&&tlf&&tlf.progress()>0&&closeFilter())};D.addEventListener("keydown",onEsc);const onBackdrop=(e)=>{if(!backdrop.contains(e.target))return;("menu"===state&&tl.progress()>0)&&closeMenu();("filter"===state&&tlf&&tlf.progress()>0)&&tlf.timeScale(2).reverse()};backdrop.addEventListener("click",onBackdrop,{passive:!0});links.forEach(a=>{a.addEventListener("click",()=>{if("menu"===state)closeMenu()},{passive:!0})});const reset=()=>{tl.progress()>0&&tl.timeScale(2).reverse(),tlf&&tlf.progress()>0&&tlf.timeScale(2).reverse(),hideMenuHard(),hideFilterHard(),state=null};reset();w._menuTimeline=tl;w._filterTimeline=tlf||null});NavigationManager.attachMenuLocks(document)}catch(e){console.warn("[navigation:init] failed",e)}}
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
		);
	
		// Page: Index
		registries.pages.selected.push(
			feature({
				id: 'selectedWorkLoop',
				stage: 'main',
				namespaces: ['selected'],
				selectors: ['.selected-container', '.selected-content'],
				init: async r=>{const t=r.querySelector('.selected-container'),o=t?.querySelector('.selected-content');if(!t||!o||t.__selectedLoopInited)return;t.__selectedLoopInited=!0;const n=Array.from(o.querySelectorAll('.selected-item-outer'));if(!n.length)return;o.style.justifyContent='center';o.style.transform='translateZ(0)';const a=e=>{const t=getComputedStyle(e);return e.offsetWidth+((parseFloat(t.marginLeft)||0)+(parseFloat(t.marginRight)||0))},s=()=>{const e=Math.max(document.documentElement.clientWidth,window.innerWidth||0),t=window.matchMedia('(max-width:767px)').matches;return Math.round(e*(t?.78:.28))},l=e=>{o.querySelectorAll('.selected-item-outer').forEach(t=>{t._baseW=e,t.style.width=e+'px'})},i=()=>{let e=0;return Array.from(o.children).forEach(t=>{1===t.nodeType&&(e+=a(t))}),e},c=()=>{n.forEach(e=>{const t=e.cloneNode(!0);t.setAttribute('data-clone','true'),o.appendChild(t)})};let d=0;function h(){const e=Array.from(o.children).filter(e=>1===e.nodeType),n=Math.floor(e.length/2);let s=0;for(let t=0;t<n;t++)s+=a(e[t]);const l=a(e[n]);d=-(s+.5*l-.5*t.clientWidth),gsap.set(o,{x:d})}function u(){t.hasAttribute('data-loop-ready')||(t.setAttribute('data-loop-ready','1'),o.dispatchEvent(new CustomEvent('selected:loop-ready',{bubbles:!0})))}!function(){Array.from(o.children).forEach(e=>{1===e.nodeType&&e.hasAttribute('data-clone')&&e.remove()}),l(s()),c(),c();const e=3*t.clientWidth;let n=0;for(;i()<e&&n++<8;)c();l(s())}();let p=0,f=1;const m={t:0},y=gsap.quickTo(m,'t',{duration:.45,ease:'power3.out',onUpdate:()=>{o.querySelectorAll('.selected-item-outer').forEach(e=>{const t=e._baseW||s();e.style.width=t*(1+m.t)+'px'})}});let g=!1;const b=(e,t)=>{const n=(t||16.6667)/16.6667,a=p+1*f;d-=a*n;let s=o.firstElementChild,l=0;for(;s&&d<-a(s)&&l++<50;)d+=a(s),o.appendChild(s),s=o.firstElementChild;let i=o.lastElementChild;for(l=0;i&&d>0&&l++<50;)d-=a(i),o.insertBefore(i,o.firstElementChild),i=o.lastElementChild;gsap.set(o,{x:d});const c=Math.min(1,Math.abs(a)/70);y((a>=0?.14:-.1)*c),Math.abs(a)<3&&Math.abs(m.t)>.002&&!g&&(g=!0,gsap.to(m,{t:0,duration:1.1,ease:'elastic.out(0.62,0.32)',onUpdate:()=>y(m.t)})),Math.abs(a)>=3&&(g=!1);const h=o.querySelectorAll('.selected-item-visual');if(h.length){const e=.5*window.innerWidth,t=.5+.5*c;h.forEach(o=>{const n=o.closest('.selected-visual');if(!n)return;const a=n.getBoundingClientRect(),s=(e-(a.left+.5*a.width))/window.innerWidth;o.style.setProperty('--drift',80*s*t+'px')})}p*=Math.pow(.94,n),Math.abs(p)<.01&&(p=0)};gsap.ticker.add(b),CoreUtilities.Observers.addTicker(b),CoreUtilities.Observers.addGsap(Observer.create({target:o,type:'wheel,touch',wheelSpeed:1,tolerance:6,onChange(e){const t=Math.abs(e.deltaX)>=Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(!t)return;const o=e.event.type.includes('touch')?.34:.08;p+=t*o,p=gsap.utils.clamp(-70,70,p),f=t>0?1:-1}})),h(),u();let w=0;const v=new ResizeObserver(()=>{cancelAnimationFrame(w),w=requestAnimationFrame(()=>{l(s()),y(m.t),h(),u()})});v.observe(t),CoreUtilities.Observers.addDom(v);}
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
				id: 'productPinnedSections',
				stage: 'main',
				namespaces: ['capabilities'],
				selectors: ['.section-single-service'],
				init: async r=>{const e=[...r.querySelectorAll('.section-single-service')];if(!e.length||!window.ScrollTrigger)return;e.forEach(t=>{const i=t.offsetHeight<innerHeight;gsap.timeline({scrollTrigger:{trigger:t,start:i?'top top':'bottom bottom',pin:!0,pinSpacing:!1,scrub:1}}).to(t,{ease:'none',startAt:{filter:'contrast(100%) blur(0px)'},filter:'contrast(10%) blur(10px)'},0)})}
			}),
			feature({
				id: 'productGallery',
				stage: 'late',
				namespaces: ['capabilities'],
				selectors: ['.infinite-gallery'],
				init: async r=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const e=r.querySelectorAll('.infinite-gallery');if(!e.length)return;e.forEach(s=>{const t=s.querySelector('.infinite-gallery-wrapper');if(!t||t.__inited)return;t.__inited=!0,s.setAttribute('data-armed','0');const o=[...t.querySelectorAll('.service-visual-wrapper')];if(!o.length)return void s.setAttribute('data-armed','1');s.setAttribute('data-armed','measure');const i=new Set;let a=0,n=0,c=!1,l=0;const d=('right'===(s.dataset.direction||'left').toLowerCase()?-1:1),p=parseFloat(s.dataset.speed)||.6,h=e=>(e.getBoundingClientRect().width||0)+(parseFloat(getComputedStyle(t).gap||'0')||0);function u(){o.forEach((e,n)=>{e.style.height='';const s=e.getBoundingClientRect().width||e.offsetWidth||0,o=parseFloat(getComputedStyle(e).height)||e.getBoundingClientRect().height||0,r=String(n);e.dataset.key=r,e.dataset.targetH=String(Math.max(0,o)),e.style.minWidth=s+'px',e.style.maxWidth=s+'px',e.style.overflow='hidden',i.has(r)?(e.style.height='',e.dataset.revealed='1',e.dataset.revealing=''):(e.style.height='0px',e.dataset.revealed='0',e.dataset.revealing='')});!function(){o.forEach((e=>{const n=e.dataset.key||'',o=+e.dataset.targetH||0,r=e.cloneNode(!0);r.setAttribute('data-clone','1'),r.dataset.key=n,r.style.minWidth=e.style.minWidth,r.style.maxWidth=e.style.maxWidth,r.style.height=i.has(n)?o+'px':'0px',r.style.overflow='hidden',t.appendChild(r)}))}();!function(){let e=0;for(;(()=>{let e=0;return t.childNodes.forEach((t=>{1===t.nodeType&&(e+=h(t))})),e})()<3*t.clientWidth&&e++<8;)!function(){o.forEach((e=>{const n=e.dataset.key||'',o=+e.dataset.targetH||0,r=e.cloneNode(!0);r.setAttribute('data-clone','1'),r.dataset.key=n,r.style.minWidth=e.style.minWidth,r.style.maxWidth=e.style.maxWidth,r.style.height=i.has(n)?o+'px':'0px',r.style.overflow='hidden',t.appendChild(r)}))}()}()}function f(e){if(!c)return void cancelAnimationFrame(n);if(e-l<80)return void(n=requestAnimationFrame(f));l=e||performance.now();const o=window.innerWidth||document.documentElement.clientWidth||0,r=-.05*o,d=1.05*o,p=[...t.querySelectorAll('.service-visual-wrapper:not([data-clone])')].filter((e=>{const t=e.getBoundingClientRect();return t.right>r&&t.left<d})).filter((e=>'1'!==e.dataset.revealed&&'1'!==e.dataset.revealing)).sort(((e,t)=>e.getBoundingClientRect().left-t.getBoundingClientRect().left));if(p.length){const e=gsap.timeline();p.forEach(((o,a)=>{const n=+o.dataset.targetH||0,c=o.dataset.key||'';o.dataset.revealing='1',e.to(o,{height:n,duration:.9,ease:'power2.out',onComplete:()=>{o.style.height='',o.dataset.revealed='1',o.dataset.revealing='',i.add(c),t.querySelectorAll(`.service-visual-wrapper[data-clone][data-key="${c}"]`).forEach((e=>e.style.height=n+'px'))}},.12*a)}))}n=requestAnimationFrame(f)}u(),s.setAttribute('data-armed','1');const g=new IntersectionObserver((e=>{e.forEach((e=>{e.target===s&&(e.isIntersecting?(c||(c=!0,cancelAnimationFrame(n),n=requestAnimationFrame(f))):(c=!1,cancelAnimationFrame(n)))}))}),{root:null,threshold:0,rootMargin:'0px 0px -5% 0px'});g.observe(s),CoreUtilities.Observers.addDom(g),CoreUtilities.Observers.addDom({disconnect(){c=!1,cancelAnimationFrame(n)}});let y=60*p,v=(e,o)=>{a-=d*y*((o||16.6667)/1e3);let r=t.firstElementChild,n=0;for(;r&&a<-h(r)&&n++<50;)a+=h(r),t.appendChild(r),r=t.firstElementChild;let i=t.lastElementChild;for(n=0;i&&a>0&&n++<50;)a-=h(i),t.insertBefore(i,t.firstElementChild),i=t.lastElementChild;gsap.set(t,{x:a});const c=(window.innerWidth||0)/2;t.querySelectorAll('.service-visual').forEach((e=>{const t=e.closest('.service-visual-wrapper');if(!t)return;const r=t.getBoundingClientRect(),n=(c-(r.left+r.width/2))/(window.innerWidth||1);e.style.setProperty('--drift',40*n+'px')}))};gsap.ticker.add(v),CoreUtilities.Observers.addTicker(v);const m=new ResizeObserver((()=>{u(),i.forEach((e=>{const i=o.find((t=>t.dataset.key===e)),a=i&&+i.dataset.targetH||0;t.querySelectorAll(`.service-visual-wrapper[data-clone][data-key="${e}"]`).forEach((e=>e.style.height=a+'px'))}))}));m.observe(t),CoreUtilities.Observers.addDom(m)})}
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
				runIntroTimeline=function(){return new Promise((t=>{title._originalHTML=title.innerHTML,gsap.set([title,subtitle,imageWrap,counter],{autoAlpha:0,visibility:"hidden"}),gsap.set(title,{autoAlpha:1,visibility:"visible"});const i=splitAndMask(title);gsap.timeline({onComplete(){safelyRevertSplit(i,title),t()}}).to(title,{height:title.scrollHeight,duration:.8,ease:"power2.out"},0).to(i.lines,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08},0).to(subtitle,{autoAlpha:1,visibility:"visible",height:subtitle.scrollHeight,paddingTop:"0.5rem",y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"-=0.2").to(imageWrap,{autoAlpha:1,visibility:"visible",marginTop:"2rem",marginBottom:"2rem",duration:.8,ease:"power2.out"},"+=0.3").to(counter,{autoAlpha:1,visibility:"visible",height:counter.scrollHeight,filter:"blur(0)",duration:.6,ease:"power2.out"},"<")}))};
				runPreloader=async function(){if(runPreloader._started)return;pre.style.display="flex",runPreloader._started=!0;const e=[{ratio:2.5/3,heightVh:40,hold:.05},{ratio:16/9,heightVh:50,hold:.05},{ratio:1,heightVh:34,hold:.05},{ratio:4/3,heightVh:50,hold:.05},{ratio:1.5,heightVh:40,hold:.6}];slides.forEach(((e,t)=>e.style.opacity=0===t?1:0));const t=e.length;let o=0;const a=e.map(((e,a)=>{const r=Math.round((a+1)/t*100),i=Math.round(10*Math.random()-5),n=Math.min(100,Math.max(o+1,r+i));return o=n,n}));function r(t){const{ratio:o,heightVh:a}=e[t%e.length];let r=winH*(a/100),i=r*o;return i>preW&&(i=preW,r=i/o),{w:i,h:r}}for(let t=0;t<slides.length;t++){const o=a[t],i=r(t),n=e[t%e.length].hold,h=gsap.to(bar,{height:o+"%",duration:.8+n,ease:"power1.inOut"}),s={v:0===t?0:a[t-1]},d=gsap.to(s,{v:o,duration:.8+n,ease:"power1.inOut",onUpdate(){counter.textContent=Math.round(s.v)+"%"}});0===t?await gsap.to(imageWrap,{width:i.w,height:i.h,duration:.8,ease:"power2.out"}):await morphCrossfade(slides[t-1],slides[t],imageWrap,i,.8),await new Promise((e=>setTimeout(e,Math.round(1e3*n)))),await Promise.all([h,d])}await gsap.to(bar,{height:"100%",duration:.2,ease:"none"}),counter.textContent="100%",await new Promise((e=>setTimeout(e,200))),await gsap.to(pre,{yPercent:-100,duration:.8,ease:"power2.inOut",onStart(){window.initAllYourInits&&window.initAllYourInits()},onComplete(){sessionStorage.setItem("preloaderSeen","1"),window.removeEventListener("resize",measure),pre.remove()}})};
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
		async function coverOut({closeMenus:n=!0}={}){const{el:e,tint:t}=getOverlay();if(!e){try{window.NavigationManager?.setLock("overlay",!1)}catch{}return!0}if(n)try{window.EntryOrchestrator?.forceCloseMenus?.(document)}catch{}return runningCoverOut||(runningCoverOut=new Promise((n=>{if("none"===getComputedStyle(e).display){e.style.display="none",e.style.pointerEvents="none";try{window.NavigationManager?.setLock("overlay",!1)}catch{}return runningCoverOut=null,n(!0)}gsap.timeline({onStart(){e.style.pointerEvents="auto"},onComplete(){gsap.set(e,{clearProps:"transform,clipPath"}),t&&gsap.set(t,{clearProps:"opacity"}),e.style.display="none",e.style.pointerEvents="none";try{window.NavigationManager?.setLock("overlay",!1)}catch{}runningCoverOut=null,n(!0)}}).to(e,{duration:.6,ease:"power4.in",y:"-100%"},0).to(t||e,{duration:.6,ease:"none",opacity:0},0)})),runningCoverOut)}
		return { coverIn, coverOut };
	})();

// Entry Orchestrator
	window.EntryOrchestrator = window.EntryOrchestrator || (function () {
		const entryConfigByNamespace={selected:{delayHero:!1,entryOffset:-.2},archive:{delayHero:!1,entryOffset:-.2},resources:{delayHero:!1,entryOffset:-.2},capabilities:{delayHero:!0,entryOffset:.1},info:{delayHero:!1,entryOffset:-.2}};
		function getEntryConfig(e){const a=e?.dataset?.barbaNamespace||e?.getAttribute?.("data-barba-namespace")||"";return entryConfigByNamespace[a]||{delayHero:!1,entryOffset:0}}
		function forceCloseMenus(e=document){document.querySelectorAll(".nav-primary-wrap").forEach((e=>{const r=e._menuTimeline,n=e._filterTimeline;r&&r.progress()>0&&r.timeScale(2).reverse(),n&&n.progress()>0&&n.timeScale(2).reverse(),e.querySelector(".menu-wrapper")?.style&&(e.querySelector(".menu-wrapper").style.display="none"),e.querySelector(".menu-container")?.style&&(e.querySelector(".menu-container").style.display="none"),e.querySelector(".filters-container")?.style&&(e.querySelector(".filters-container").style.display="none")})),document.body.style.overflow=""}
		async function finalizeAfterEntry(e){await new Promise((e=>requestAnimationFrame((()=>requestAnimationFrame((()=>setTimeout(e,30)))))));try{window.ScrollTrigger&&requestAnimationFrame((()=>ScrollTrigger.refresh(!0)))}catch{}}
		async function runEntryFlow(n,{withCoverOut:t=!1}={}){n.style.visibility="",t&&await TransitionEffects.coverOut(),await InitManager.run(n,{preserveServicePins:!0});const{tl:e,entryOffset:i}=runPageEntryAnimations(n);await new Promise((t=>{e.call((()=>finalizeAfterEntry(n)),null,i+e.duration()),e.eventCallback("onComplete",t)}))}
		
		// Entry Animations
		const EntryAnimations = {
			selected(e=document){const t=e.querySelector(".selected-container"),a=t?.querySelector(".selected-content"),o=Array.from(e.querySelectorAll(".selected-item-outer")),l=gsap.timeline();return t&&a&&o.length?(o.forEach(e=>{if(e.__entryDone)return;const t=e.querySelector(".selected-visual"),a=e.querySelector(".selected-item-header .headline-m"),o=e.querySelector(".selected-item-details"),l=e.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:0,transformOrigin:"bottom center",opacity:0}),a&&gsap.set(a,{opacity:0}),o&&gsap.set(o,{opacity:0,height:0}),l.length&&gsap.set(l,{opacity:0,y:20,filter:"blur(10px)"})}),((r=>{const o=()=>{requestAnimationFrame(()=>requestAnimationFrame(r))};if(t.hasAttribute("data-loop-ready"))return o();const i=()=>{a.removeEventListener("selected:loop-ready",i,!0),o()};a.addEventListener("selected:loop-ready",i,!0),setTimeout(()=>{a.removeEventListener("selected:loop-ready",i,!0),o()},600)})((()=>{const e=window.innerWidth||document.documentElement.clientWidth,t=window.innerHeight||document.documentElement.clientHeight,a=o.map(a=>{const o=a.getBoundingClientRect();return{o:a,r:o,area:Math.max(0,Math.min(o.right,e)-Math.max(o.left,0))*Math.max(0,Math.min(o.bottom,t)-Math.max(o.top,0)),center:.5*(o.left+o.right)}});let r=a.filter(e=>e.area>1).sort((e,t)=>e.r.left-t.r.left);if(!r.length){const t=.5*e;r=a.slice().sort((e,a)=>Math.abs(e.center-t)-Math.abs(a.center-t)).slice(0,2).sort((e,t)=>e.r.left-t.r.left)}const i=new Set(r.map(e=>e.o));a.forEach(e=>{if(e.o.__entryDone||i.has(e.o))return;const t=e.o.querySelector(".selected-visual"),a=e.o.querySelector(".selected-item-header .headline-m"),o=e.o.querySelector(".selected-item-details"),l=e.o.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:1,opacity:1}),a&&gsap.set(a,{opacity:1}),o&&gsap.set(o,{opacity:1,height:"auto"}),l.length&&gsap.set(l,{opacity:1,y:0,filter:"blur(0px)"}),e.o.__entryDone=!0}),r.forEach((e,t)=>{const a=e.o;if(a.__entryDone)return;const r=a.querySelector(".selected-visual"),i=a.querySelector(".selected-item-header .headline-m"),s=a.querySelector(".selected-item-details"),n=a.querySelectorAll(".selected-item-details .body-s"),c=.15*t;r&&l.set(r,{opacity:1},c).to(r,{scaleY:1,duration:.8,ease:"power2.out"},c),i&&l.set(i,{opacity:1},c+.2).call(()=>{if(i.__splitRun)return;i.__splitRun=!0,CoreUtilities.Fonts.ready().then(()=>{const e=splitAndMask(i);gsap.delayedCall(.15,(()=>{animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,i)))}))})},null,c+.2),s&&l.to(s,{opacity:1,height:"auto",duration:.4,ease:"power2.out"},c+.6),n.length&&l.to(n,{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"power2.out",stagger:.15},c+.6),a.__entryDone=!0})})),l):l},
			capabilities(e,{delayHero:t=!1}={}){const a=gsap.timeline(),o=e.querySelector(".section-table-of-contents");o&&gsap.set(o,{autoAlpha:0});const l=e.querySelector(".approach-mask");l&&(gsap.set(l,{scale:0,transformOrigin:"0% 100%",willChange:"transform"}),a.to(l,{scale:1,duration:1.2,ease:"power2.out"},0));const r=e.querySelector(".section-hero .headline-lg");if(r){gsap.set(r,{autoAlpha:0});const c=t?0.2:0;a.addLabel("heroStart",c).set(r,{autoAlpha:1},"heroStart").call(()=>{CoreUtilities.Fonts.ready().then(()=>{const e=splitAndMask(r);animateLines(e.lines).eventCallback("onComplete",()=>safelyRevertSplit(e,r))})},null,"heroStart")}const s=e.querySelector(".section-hero .button-primary");s&&(gsap.set(s,{autoAlpha:0,y:20,filter:"blur(10px)"}),a.fromTo(s,{autoAlpha:0,y:20,filter:"blur(10px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"heroStart+=0.4"));const n=gsap.utils.toArray(e.querySelectorAll(".table-of-contents-item"));return n.length&&a.from(n,{autoAlpha:0,paddingTop:"6rem",paddingBottom:"6rem",duration:1,ease:"power2.out",stagger:.15},0),o&&a.to(o,{autoAlpha:1,duration:.6,ease:"power2.out"},0),a},
			info(e){const t=gsap.timeline(),a=e.querySelectorAll(".section-scroll-track .w-layout-cell"),o=e.querySelector(".section-hero .subpage-intro h1"),l=e.querySelector(".section-hero .subpage-intro a");a.forEach(e=>gsap.set(e,{scaleY:0,transformOrigin:"bottom center"})),t.to(a,{scaleY:1,duration:1,ease:"power2.out",stagger:{each:.15,from:"start"}},0),o&&(gsap.set(o,{autoAlpha:0}),t.set(o,{autoAlpha:1},.35).call(()=>{CoreUtilities.Fonts.ready().then(()=>{const e=splitAndMask(o);animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,o)))})},null,.35)),l&&(gsap.set(l,{autoAlpha:0,y:20,filter:"blur(10px)"}),t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},.6));return t},
			caseStudy(e){const t=gsap.timeline(),a=document.documentElement,i=e.querySelector(".cs-hero-image"),o=e.querySelector(".cs-headline"),n=e.querySelectorAll(".cs-titles-inner div"),r=e=>{if(!e)return null;let t=e.querySelector(".ta-one,[data-animate-headline],h1")||e;for(;t&&t.children&&1===t.children.length&&t.textContent.trim()===t.children[0].textContent.trim();)t=t.children[0];return t},s=e=>{e&&(e.removeAttribute("data-entry-hidden"),e.removeAttribute("hidden"),e.removeAttribute("aria-hidden"),["hidden","is-hidden","u-hidden","opacity-0","visually-hidden"].forEach(t=>e.classList?.remove(t)))};a.classList.add("entry-ready");const l=r(o);o&&(o.style.visibility="visible"),l&&(l.style.visibility="visible"),i&&gsap.set(i,{autoAlpha:0,y:80,filter:"blur(10px)",overwrite:"auto",immediateRender:!0}),l&&gsap.set(l,{autoAlpha:0,overwrite:"auto",immediateRender:!0}),n.length&&gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),s(i),s(o),n.forEach(s),i&&t.to(i,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},0);if(l){const e=l.style.display,a="inline"===getComputedStyle(l).display;a&&(l.style.display="block"),t.addLabel("headline",.35).set(l,{autoAlpha:1,visibility:"visible"},"headline").call(()=>requestAnimationFrame(()=>{CoreUtilities.Fonts.ready().then(()=>{try{const t=splitAndMask(l);animateLines(t.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(t,l),l.style.display=e}))}catch(t){l.style.display=e,gsap.set(l,{autoAlpha:1})}})}),null,"headline")}return n.length&&t.to(n,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out",stagger:.05},.6),t}
		};
		
		function runPageEntryAnimations(e){const{delayHero:t,entryOffset:n}=getEntryConfig(e),a=gsap.timeline();return"info"===e.dataset.barbaNamespace&&a.add(EntryAnimations.info(e),0),e.querySelector(".section-table-of-contents")&&a.add(EntryAnimations.capabilities(e,{delayHero:t}),0),e.querySelector(".selected-item-outer")&&a.add(EntryAnimations.selected(e),0),e.querySelector(".cs-hero-image")&&a.add(EntryAnimations.caseStudy(e),0),{tl:a,entryOffset:n}}
		
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


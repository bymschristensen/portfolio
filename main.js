// Theme Switch
	function initTheme(){const t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)}initTheme();

// GSAP
	gsap.registerPlugin(ScrollTrigger,Flip,SplitText,TextPlugin,Observer);
	const DEBUG = false;
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
		function installLinkInterceptor(){state.installed||(state.clickHandler=t=>{const e=isInternalAnchor(t);if(!e)return;const a=document.querySelector('[data-barba="container"]')?.dataset?.barbaNamespace||"";if("archive"!==a&&"resources"!==a){const t=e.a.closest("[data-barba-prevent]");if(t&&"true"===t.getAttribute("data-barba-prevent"))return}if(state.locks.size)return dlog("blocked by lock(s):",[...state.locks]),t.preventDefault(),t.stopPropagation(),void t.stopImmediatePropagation();t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),console.info("[intercept→barba]",e.url.href,"locks:",[...state.locks]),window.barba?.go?barba.go(e.url.href):location.href=e.url.href},window.addEventListener("pointerdown",state.clickHandler,{capture:!0}),window.addEventListener("click",state.clickHandler,{capture:!0}),state.installed=!0,dlog("link interceptor installed"))}
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
		function reparent(t=document){t.querySelectorAll("[data-child]").forEach((e=>{if(e.matches(".w-tab-link, .w-tab-pane")||e.closest(".w-tabs"))return;const a=e.getAttribute("data-child");let r=t.querySelector(`[data-parent="${a}"]`);r||t===document||(r=document.querySelector(`[data-parent="${a}"]`)),r&&r.appendChild(e)}))}
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
		const Text={
			splitAndMask(e){if(!e)return null;if(e._originalHTML||(e._originalHTML=e.innerHTML),e._split)return e._split;const t=getComputedStyle(e).whiteSpace||"normal",i=e.style.whiteSpace,l=e.style.display;e.style.whiteSpace=t,"inline"===getComputedStyle(e).display&&(e.style.display="block"),e.clientWidth;const n=new SplitText(e,{type:"lines",linesClass:"line",reduceWhiteSpace:!1});return n.lines.forEach((e=>{const i=e.getBoundingClientRect().height||e.offsetHeight||0,l=document.createElement("div");l.className="text-mask",l.style.overflow="hidden",l.style.display="block",l.style.height=i+"px",e.style.whiteSpace=t,e.style.display="block",e.parentNode.insertBefore(l,e),l.appendChild(e)})),gsap.set(n.lines,{yPercent:100,rotation:10,transformOrigin:"0 10%",willChange:"transform,opacity"}),e.style.whiteSpace=i,e.style.display=l,e._split=n,n},
			safelyRevertSplit(e,t){if(e&&t){try{e.revert()}catch{}t._originalHTML&&(t.innerHTML=t._originalHTML,delete t._originalHTML),delete t._split}},
			animateLines:e=>(gsap.set(e,{transformOrigin:"0 10%",rotation:10,yPercent:100,willChange:"transform, opacity"}),gsap.to(e,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08}))
		};
		
		window.splitAndMask       ||= Text.splitAndMask;
		window.safelyRevertSplit  ||= Text.safelyRevertSplit;
		window.animateLines       ||= Text.animateLines;
		
		return {
			Observers,
			Cursor,
			InitManager,
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
				id:'textAnimation',
				stage:'main',
				namespaces:'*',
				selectors:['.ta-one'],
				init: async r=>{const{splitAndMask:a,safelyRevertSplit:t,animateLines:e}=CoreUtilities.Text,n=".ta-one",o=[...r.querySelectorAll(n)];o.forEach(r=>{gsap.set(r,{autoAlpha:0}),t(r._split,r)});const s=(r,i)=>{if(!r||r.__taDone||r.__taOneDone)return;gsap.set(r,{autoAlpha:1});const n=a(r);e(n.lines).eventCallback("onComplete",()=>{t(n,r),r.__taDone=!0}),i&&i.unobserve(r)},c=CoreUtilities.Observers.addDom(new IntersectionObserver((r,i)=>{r.forEach(r=>{r.isIntersecting&&s(r.target,i)})},{root:null,rootMargin:"0px 0px -5% 0px",threshold:0}));o.forEach(r=>{if(r.__taDone||r.__taOneDone)return;c.observe(r);const i=r.getBoundingClientRect();i.top<innerHeight&&i.bottom>0&&s(r,c)}),r.querySelectorAll(".w-tabs .w-tab-pane").forEach(r=>{CoreUtilities.Observers.addDom(new MutationObserver(()=>{if(!r.classList.contains("w--tab-active"))return;r.querySelectorAll(n).forEach(r=>{if(r.__taDone||r.__taOneDone)return;const i=r.getBoundingClientRect();i.top<innerHeight&&i.bottom>0&&s(r)})})).observe(r,{attributes:!0,attributeFilter:["class"]})})}
			}),
	
			feature({
				id: 'appearInLine',
				stage: 'main',
				namespaces: '*',
				selectors: ['.appear-in-line'],
				init: async r=>{const t=".appear-in-line",o=":scope > *";r.querySelectorAll(t).forEach(t=>{if(t.__ailInit)return;t.__ailInit=!0;const e=[],n=[];Array.from(t.querySelectorAll(o)).forEach(t=>{const o=getComputedStyle(t),i=parseInt(o.columnCount,10)||1,s=t.getBoundingClientRect();if(i>1){const o=new SplitText(t,{type:"lines",linesClass:"split-line"});e.push(o);const a=s.width/i,l=Array.from({length:i},(()=>[]));o.lines.forEach(t=>{const e=t.getBoundingClientRect().left-s.left,o=Math.min(i-1,Math.max(0,Math.floor(e/a)));l[o].push(t),gsap.set(t,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"})}),l.forEach(t=>n.push(t))}else gsap.set(t,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"}),n.push([t])});const i=()=>{if(t.__ailDone)return;n.forEach((t,o=>gsap.to(t,{y:0,opacity:1,filter:"blur(0px)",duration:.8,ease:"power2.out",delay:.15*o})));const o=.15*(n.length-1)+.8;gsap.delayedCall(o+.05,(()=>{e.forEach((t=>t.revert())),t.__ailDone=!0}))},s=CoreUtilities.Observers.addDom(new IntersectionObserver(((e,o)=>{e.forEach((e=>{e.isIntersecting&&(o.unobserve(t),i())}))}),{root:null,rootMargin:"0px 0px -10% 0px",threshold:0}));t._appearData={splits:e,groups:n,observer:s},s.observe(t);const a=t.getBoundingClientRect();a.top<innerHeight&&a.bottom>0&&(s.unobserve(t),i());const l=r.querySelector(".w-tabs")?t.closest(".w-tab-pane"):null;l&&CoreUtilities.Observers.addDom(new MutationObserver((()=>{if(!l.classList.contains("w--tab-active"))return;s.observe(t);const e=t.getBoundingClientRect();e.top<innerHeight&&e.bottom>0&&(s.unobserve(t),i())}))).observe(l,{attributes:!0,attributeFilter:["class"]})})}
			}),
	
			feature({
				id: 'navigation',
				stage: 'main',
				namespaces: '*',
				selectors: ['.nav-primary-wrap'],
				init: async r=>{
					r.querySelectorAll(".nav-primary-wrap").forEach(e=>{const t=e.querySelector(".nav-button-menu"),n=e.querySelector(".nav-button-text"),o=e.querySelector(".phone-number"),l=e.querySelectorAll(".button-minimal-darkmode"),a=e.querySelectorAll(".menu-link"),i=e.querySelector(".ta-one-menu");if(!(t&&n&&o&&l.length&&a.length&&i))return;let s;n.dataset.orig=n.textContent;const c=gsap.timeline({paused:!0}).call(()=>{s=splitAndMask(i),animateLines(s.lines).eventCallback("onComplete",()=>{safelyRevertSplit(s,i),s=null})},null,0).from(o,{opacity:0,duration:.5},">").from(l,{opacity:0,duration:.5,stagger:.2},"<").from(a,{opacity:0,yPercent:240,duration:.5,stagger:.2},"<").to(n,{text:"Close",duration:.3},"<");c.eventCallback("onReverseComplete",()=>{n.textContent=n.dataset.orig}),e._menuTimeline=c,e._menuButton=t});
    				{const u=r.dataset?.barbaNamespace||r.getAttribute("data-barba-namespace")||"";r.querySelectorAll(".nav-primary-wrap").forEach(m=>{const f=m.querySelector(".nav-button-filter"),p=m.querySelector(".filters-container"),d=m.querySelectorAll(".filter-tuner"),h=m.querySelector(".filter-line-1"),y=m.querySelector(".filter-line-2"),v=m.querySelector(".modal-filters-caption"),g=m.querySelectorAll(".modal-filters-item"),w=r.querySelector(".menu-filter-hover"),q=r.querySelectorAll(".menu-filter-image");if(!f||!p||!g.length)return;"archive"===u?(f.style.display="flex",gsap.to(f,{opacity:1,duration:.2})):(gsap.to(f,{opacity:0,duration:.2,onComplete:()=>f.style.display="none"}),p.style.display="none");if(w&&q.length){gsap.set(w,{xPercent:-50,yPercent:-50,scale:0});const e=gsap.quickTo(w,"x",{duration:2.6,ease:"expo"}),t=gsap.quickTo(w,"y",{duration:2.6,ease:"expo"}),n=s=>{e(s.pageX),t(s.pageY)};addEventListener("mousemove",n,{passive:!0}),CoreUtilities.Observers.addDom({disconnect(){removeEventListener("mousemove",n)}});const o=gsap.timeline({paused:!0}).to(w,{scale:1,opacity:1,rotation:0,duration:.5,ease:"power1.inOut"});g.forEach((e,t)=>{e.addEventListener("mouseover",()=>{q[t]?.classList.add("active"),o.play()}),e.addEventListener("mouseout",()=>{o.reverse(),q[t]?.classList.remove("active")})})}const _=gsap.timeline({paused:!0}).to(p,{opacity:1,duration:.4,ease:"power2.out"},0).to(d,{opacity:0,duration:.15},"<").to(h,{rotation:45,transformOrigin:"center",duration:.35},"<").to(y,{rotation:-45,marginTop:"-4px",transformOrigin:"center",duration:.35},"<").from(v,{opacity:0,duration:.5},"<").from(g,{opacity:0,duration:.8,stagger:.2},"<");g.forEach(el=>{el.addEventListener("click",ev=>{ev.preventDefault();const id=el.id.replace("nav-archive-filter-",""),btn=document.getElementById(`archive-filter-${id}`);btn&&btn.click(),_.timeScale(3).reverse()})}),m._filterTimeline=_,m._filterButton=m.querySelector(".nav-button-filter")})}
    				r.querySelectorAll(".nav-primary-wrap").forEach(n=>{if(n._navTriggersBound)return;n._navTriggersBound=!0;const e=n._menuButton,t=n._filterButton,o=n._menuTimeline,l=n._filterTimeline,a=n.querySelector(".menu-wrapper"),i=n.querySelector(".menu-container"),s=n.querySelector(".filters-container");if(!o&&!l)return;let c=null;const p=()=>{i&&(i.style.display="none"),a&&(a.style.display="none"),document.body.style.overflow="",c=null},d=()=>{s&&(s.style.display="none"),a&&(a.style.display="none"),document.body.style.overflow="",c=null};o&&o.eventCallback("onReverseComplete",p),l&&l.eventCallback("onReverseComplete",d),e&&o&&e.addEventListener("click",()=>{"filter"===c&&l?(l.timeScale(2).reverse(),l.eventCallback("onReverseComplete",()=>{d(),c="menu",document.body.style.overflow="hidden",a&&(a.style.display="flex"),i&&(i.style.display="flex"),o.timeScale(1).play(0),l.eventCallback("onReverseComplete",d)})):"menu"!==c?(c="menu",document.body.style.overflow="hidden",a&&(a.style.display="flex"),i&&(i.style.display="flex"),o.timeScale(1).play(0)):o.timeScale(2).reverse()}),t&&l&&t.addEventListener("click",()=>{"menu"===c&&o?(o.timeScale(2).reverse(),o.eventCallback("onReverseComplete",()=>{p(),c="filter",document.body.style.overflow="hidden",a&&(a.style.display="flex"),s&&(s.style.display="flex"),l.timeScale(1).play(0),o.eventCallback("onReverseComplete",p)})):"filter"!==c?(c="filter",document.body.style.overflow="hidden",a&&(a.style.display="flex"),s&&(s.style.display="flex"),l.timeScale(1).play(0)):l.timeScale(2).reverse()})});
    				NavigationManager.attachMenuLocks(r);
				}
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
				init: async r=>{const e=r.querySelector('.nav-button-close-case');if(!e)return;const t=(location.pathname||'/').replace(/\/+$/,''),a=/^\/archive\/[^/]+$/.test(t),s=!!r.querySelector('.cs-hero-image')||!!r.querySelector('.cs-headline')||!!r.querySelector('.cs-gallery-inner');if(a||s){e.style.display='flex',e.style.pointerEvents='auto',e.setAttribute('aria-hidden','false'),e.setAttribute('aria-label',e.getAttribute('aria-label')||'Close case study'),window.gsap?gsap.to(e,{opacity:1,duration:.2}):e.style.opacity='1'}else{const t=()=>{e.style.display='none',e.style.pointerEvents='none'};e.setAttribute('aria-hidden','true'),window.gsap?gsap.to(e,{opacity:0,duration:.2,onComplete:t}):(e.style.opacity='0',t())}}
			}),
			
			feature({
				id: 'themeSwitch',
				stage: 'main',
				namespaces: '*',
				selectors: ['.theme-switch'],
				init: async root=>{const s=root.querySelector(".theme-switch");if(!s)return;const c=document.documentElement.getAttribute("data-theme");s.classList.toggle("dark","dark"===c);s.addEventListener("click",()=>{const t="dark"===document.documentElement.getAttribute("data-theme")?"light":"dark";document.documentElement.setAttribute("data-theme",t);localStorage.setItem("theme",t);s.classList.toggle("dark","dark"===t)})}
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
	
		// Page: Case Study
		registries.pages.caseStudy.push(
			feature({
				id: 'csScrollBackground',
				stage: 'main',
				namespaces: '*', 
				selectors: ['.cs-hero-image', '.cs-details', '.cs-morework'],
				init: async r=>{const s=r.querySelector('.cs-hero-image')?.closest('.barba-container')||r,c=s?.closest?.('.barba-container')||s,d=s.querySelector('.cs-details'),m=s.querySelector('.cs-morework');if(!c||!d||!m||!window.ScrollTrigger)return;const o=getComputedStyle(c).backgroundColor,bg='var(--colors--background)';ScrollTrigger.create({trigger:d,start:'top bottom-=15%',onEnter:()=>gsap.to(c,{backgroundColor:bg,duration:.6,ease:'power1.inOut'}),onLeaveBack:()=>gsap.to(c,{backgroundColor:o,duration:.6,ease:'power1.inOut'})});ScrollTrigger.create({trigger:m,start:'top bottom-=15%',onEnter:()=>gsap.to(c,{backgroundColor:'var(--colors--border)',duration:.6,ease:'power1.inOut'}),onLeaveBack:()=>gsap.to(c,{backgroundColor:bg,duration:.6,ease:'power1.inOut'})});}
			}),
			feature({
				id: 'csPortraitColumns',
				stage: 'late',
				namespaces: '*',
				selectors: ['.cs-gallery-inner'],
				init: async r=>{const t=[...r.querySelectorAll(".cs-gallery-inner")];if(!t.length)return;const a=e=>{if(e.naturalWidth>0&&e.naturalHeight>0)return e.naturalHeight/e.naturalWidth;{const t=parseInt(e.getAttribute("width"),10),a=parseInt(e.getAttribute("height"),10);if(t>0&&a>0)return a/t}const n=e.clientWidth,i=e.clientHeight;return n>0&&i>0?i/n:null};let n=0;const i=e=>{cancelAnimationFrame(n),n=requestAnimationFrame(()=>{e()})},o=()=>{t.forEach(e=>{e.style.removeProperty("width"),e.classList.remove("is-portrait","is-paired")});if(window.innerWidth<1024)return;const n=t.map(e=>e.querySelector("img")).filter(Boolean).map(e=>{const t=a(e),n=!!t&&t>1;return n&&e.closest(".cs-gallery-inner")?.classList.add("is-portrait"),n});for(let e=0;e<t.length-1;e++)n[e]&&n[e+1]&&([t[e],t[e+1]].forEach(e=>{e.style.width="calc(50% - 0.5rem)",e.classList.add("is-paired")}),e+=1)},s=t.map(e=>e.querySelector("img")).filter(Boolean);if(!s.length)return;Promise.all(s.map(e=>{const t=()=>e.naturalWidth>0&&e.naturalHeight>0;if(t())return Promise.resolve();const a="function"==typeof e.decode?e.decode().catch(()=>{}):Promise.resolve(),n=new Promise(e=>{let a=0;const n=()=>{t()||a>=60?e():(a+=1,setTimeout(n,50))};n()}),i=new Promise(t=>{const a=()=>{e.removeEventListener("load",a),t()};e.addEventListener("load",a,{once:!0})});return Promise.race([a,n,i])})).then(()=>{i(o)});const l=new ResizeObserver(()=>i(o));s.forEach(e=>l.observe(e));const c=()=>i(o);window.addEventListener("resize",c,{passive:!0});const d=new MutationObserver(()=>{document.body.contains(r)||(l.disconnect(),window.removeEventListener("resize",c),d.disconnect())});d.observe(document.body,{childList:!0,subtree:!0})}
			})
		);
	
		// Execution order (early → main → late)
		function sortByStage(t){const e={early:0,main:1,late:2};return t.slice().sort(((t,a)=>(e[t.stage]??1)-(e[a.stage]??1)))}
		function buildIndex(){if(state.installed)return;const e=[...registries.common,...registries.pages.selected,...registries.pages.archive,...registries.pages.resources,...registries.pages.capabilities,...registries.pages.caseStudy];state.features=sortByStage(e),state.installed=!0}
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
		async function saveAsync(a=location.pathname+location.search){try{await afterTwoFrames();const{x:t,y:e}=readXY();sessionStorage.setItem(KEY(a),`${t},${e},${Date.now()}`)}catch{}}
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
		async function coverOut({closeMenus:n=!0}={}){const{el:e,tint:t}=getOverlay();if(!e){try{window.NavigationManager?.setLock("overlay",!1)}catch{}return!0}if(n)try{window.forceCloseMenus?.(document)}catch{}return runningCoverOut||(runningCoverOut=new Promise((n=>{if("none"===getComputedStyle(e).display){e.style.display="none",e.style.pointerEvents="none";try{window.NavigationManager?.setLock("overlay",!1)}catch{}return runningCoverOut=null,n(!0)}gsap.timeline({onStart(){e.style.pointerEvents="auto"},onComplete(){gsap.set(e,{clearProps:"transform,clipPath"}),t&&gsap.set(t,{clearProps:"opacity"}),e.style.display="none",e.style.pointerEvents="none";try{window.NavigationManager?.setLock("overlay",!1)}catch{}runningCoverOut=null,n(!0)}}).to(e,{duration:.6,ease:"power4.in",y:"-100%"},0).to(t||e,{duration:.6,ease:"none",opacity:0},0)})),runningCoverOut)}
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
			selected(e=document){const t=e.querySelector(".selected-container"),a=t?.querySelector(".selected-content"),o=Array.from(e.querySelectorAll(".selected-item-outer")),l=gsap.timeline();return t&&a&&o.length?(o.forEach((e=>{if(e.__entryDone)return;const t=e.querySelector(".selected-visual"),a=e.querySelector(".selected-item-header .headline-m"),o=e.querySelector(".selected-item-details"),l=e.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:0,transformOrigin:"bottom center",opacity:0}),a&&gsap.set(a,{opacity:0}),o&&gsap.set(o,{opacity:0,height:0}),l.length&&gsap.set(l,{opacity:0,y:20,filter:"blur(10px)"})})),(e=>{const o=()=>{requestAnimationFrame((()=>requestAnimationFrame(e)))};if(t.hasAttribute("data-loop-ready"))return o();const l=()=>{a.removeEventListener("selected:loop-ready",l,!0),o()};a.addEventListener("selected:loop-ready",l,!0),setTimeout((()=>{a.removeEventListener("selected:loop-ready",l,!0),o()}),600)})((()=>{const e=window.innerWidth||document.documentElement.clientWidth,t=window.innerHeight||document.documentElement.clientHeight,a=o.map((a=>{const o=a.getBoundingClientRect();return{o:a,r:o,area:Math.max(0,Math.min(o.right,e)-Math.max(o.left,0))*Math.max(0,Math.min(o.bottom,t)-Math.max(o.top,0)),center:.5*(o.left+o.right)}}));let r=a.filter((e=>e.area>1)).sort(((e,t)=>e.r.left-t.r.left));if(!r.length){const t=.5*e;r=a.slice().sort(((e,a)=>Math.abs(e.center-t)-Math.abs(a.center-t))).slice(0,2).sort(((e,t)=>e.r.left-t.r.left))}const s=new Set(r.map((e=>e.o)));a.forEach((e=>{if(e.o.__entryDone||s.has(e.o))return;const t=e.o.querySelector(".selected-visual"),a=e.o.querySelector(".selected-item-header .headline-m"),o=e.o.querySelector(".selected-item-details"),l=e.o.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:1,opacity:1}),a&&gsap.set(a,{opacity:1}),o&&gsap.set(o,{opacity:1,height:"auto"}),l.length&&gsap.set(l,{opacity:1,y:0,filter:"blur(0px)"}),e.o.__entryDone=!0})),r.forEach(((e,t)=>{const a=e.o;if(a.__entryDone)return;const o=a.querySelector(".selected-visual"),r=a.querySelector(".selected-item-header .headline-m"),s=a.querySelector(".selected-item-details"),n=a.querySelectorAll(".selected-item-details .body-s"),i=.15*t;o&&l.set(o,{opacity:1},i).to(o,{scaleY:1,duration:.8,ease:"power2.out"},i),r&&l.set(r,{opacity:1},i+.2).call((()=>{if(r.__splitRun)return;r.__splitRun=!0;const e=splitAndMask(r);gsap.delayedCall(.15,(()=>{animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,r)))}))}),null,i+.2),s&&l.to(s,{opacity:1,height:"auto",duration:.4,ease:"power2.out"},i+.6),n.length&&l.to(n,{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"power2.out",stagger:.15},i+.6),a.__entryDone=!0}))})),l):l},
			capabilities(e,{delayHero:t=!1}={}){const a=gsap.timeline(),o=e.querySelector(".section-table-of-contents");o&&gsap.set(o,{autoAlpha:0});const l=e.querySelector(".approach-mask");l&&(gsap.set(l,{scale:0,transformOrigin:"0% 100%",willChange:"transform"}),a.to(l,{scale:1,duration:1.2,ease:"power2.out"},0));const r=e.querySelector(".section-hero .headline-lg");if(r){gsap.set(r,{autoAlpha:0});const c=t?0.2:0;a.addLabel("heroStart",c).set(r,{autoAlpha:1},"heroStart").call((()=>{const e=splitAndMask(r);animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,r)))}),null,"heroStart")}const s=e.querySelector(".section-hero .button-primary");s&&(gsap.set(s,{autoAlpha:0,y:20,filter:"blur(10px)"}),a.fromTo(s,{autoAlpha:0,y:20,filter:"blur(10px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"heroStart+=0.4"));const n=gsap.utils.toArray(e.querySelectorAll(".table-of-contents-item"));return n.length&&a.from(n,{autoAlpha:0,paddingTop:"6rem",paddingBottom:"6rem",duration:1,ease:"power2.out",stagger:.15},0),o&&a.to(o,{autoAlpha:1,duration:.6,ease:"power2.out"},0),a},
			info(e){const t=gsap.timeline(),a=e.querySelectorAll(".section-scroll-track .w-layout-cell"),o=e.querySelector(".section-hero .subpage-intro h1"),l=e.querySelector(".section-hero .subpage-intro a");if(a.forEach((e=>gsap.set(e,{scaleY:0,transformOrigin:"bottom center"}))),t.to(a,{scaleY:1,duration:1,ease:"power2.out",stagger:{each:.15,from:"start"}},0),o){gsap.set(o,{autoAlpha:0});const e=splitAndMask(o);t.set(o,{autoAlpha:1},.35).call((()=>animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,o)))),null,.35)}return l&&(gsap.set(l,{autoAlpha:0,y:20,filter:"blur(10px)"}),t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},.6)),t},
			caseStudy(e){const t=gsap.timeline(),a=e.querySelector(".cs-hero-image"),o=e.querySelector(".cs-headline"),l=e.querySelectorAll(".cs-titles-inner div");return a&&gsap.set(a,{autoAlpha:0,y:80,filter:"blur(10px)"}),o&&gsap.set(o,{autoAlpha:0}),l.length&&gsap.set(l,{autoAlpha:0,y:20,filter:"blur(10px)"}),a&&t.to(a,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},0),o&&t.addLabel("headline",.35).set(o,{autoAlpha:1,display:"block"},"headline").call((()=>{const e=splitAndMask(o);animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,o)))}),null,"headline"),l.length&&t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out",stagger:.05},.6),t}
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
							forceCloseMenus();
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


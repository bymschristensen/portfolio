// Theme Switch
	function initTheme(){const t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)}initTheme();

// GSAP
	gsap.registerPlugin(ScrollTrigger,Flip,SplitText,TextPlugin,Observer);
	const DEBUG = true;
	window.DEBUG = true;
	if (DEBUG) {
		  // 1) Log unhandled errors (including async)
		  window.addEventListener('error',  e => console.error('[Error]', e.message, e.filename, e.lineno, e.error));
		  window.addEventListener('unhandledrejection', e => console.error('[Unhandled Rejection]', e.reason));
		
		  // 2) Loud logging wrapper
		  window.dlog = (...args) => console.debug('[DEBUG]', ...args);
		
		  // 3) ScrollTrigger markers + quick sanity settings
		  if (window.ScrollTrigger) {
		    ScrollTrigger.defaults({ markers: true });               // see triggers on page
		    ScrollTrigger.config({ ignoreMobileResize: true });       // reduces noisy refreshes
		  }
		
		  // 4) Barba lifecycle breadcrumbs
		  if (window.barba) {
		    barba.hooks.beforeEnter(({ next }) => dlog('barba:beforeEnter', next?.container?.dataset?.barbaNamespace));
		    barba.hooks.afterEnter(({ next })  => dlog('barba:afterEnter', next?.container?.dataset?.barbaNamespace));
		    barba.hooks.after   (()            => dlog('barba:after (transition complete)'));
		  }
	}

// 1. NavigationManager
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

// 2. WebflowAdapter
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

// === Module 4: PreloaderService (OFF by default) ===
	window.PreloaderService = (function () {
		let _enabled = false;
		let _built = false;
		let runIntroTimeline = async () => {};
		let runPreloader     = async () => {};
		
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

// 5. ScrollState
	window.ScrollState = (function () {
		const PREFIX = 'scroll:';
		let config = { maxAgeMs: null };
		const KEY = (p) => `${PREFIX}${p}`;
		function init(n={}){config={...config,...n};try{prune({maxAgeMs:config.maxAgeMs})}catch{}}
		function save(o=location.pathname+location.search){try{const t=`${window.scrollX},${window.scrollY},${Date.now()}`;sessionStorage.setItem(KEY(o),t)}catch{}}
		function read(n=location.pathname+location.search,t={}){try{const e=sessionStorage.getItem(KEY(n));if(!e)return null;const l=e.split(","),a=parseInt(l[0],10)||0,r=parseInt(l[1],10)||0,s=l[2]?parseInt(l[2],10):null,o=t.maxAgeMs??config.maxAgeMs;return null!=o&&null!=s&&Date.now()-s>o?null:{x:a,y:r}}catch{return null}}
		function prune({maxAgeMs:t=null}={}){if(null!=t)try{const e=Date.now();for(let s=sessionStorage.length-1;s>=0;s--){const n=sessionStorage.key(s);if(!n||!n.startsWith(PREFIX))continue;const o=sessionStorage.getItem(n),i=o?.split(",")[2];i&&(e-parseInt(i,10)>t&&sessionStorage.removeItem(n))}}catch{}}
		try { history.scrollRestoration = 'manual'; } catch {}
		return { init, KEY, save, read, prune, get config(){ return config; } };
	})();

// 7. TransitionEffects
	window.TransitionEffects = (function () {
		let runningCoverOut = null;
		function getOverlay(){const e=document.querySelector(".page-overlay"),t=e?.querySelector(".page-overlay-tint")||null;return{el:e,tint:t}}
		async function coverIn(){const{el:t,tint:e}=getOverlay();if(!t)return!0;try{window.NavigationManager?.setLock("overlay",!0)}catch{}return t.style.display="block",t.style.pointerEvents="auto",gsap.set(t,{y:"100%",clipPath:"polygon(0% 0%,100% 20%,100% 100%,0% 100%)",willChange:"transform,clip-path"}),e&&gsap.set(e,{opacity:0,willChange:"opacity"}),new Promise((o=>{gsap.timeline({defaults:{duration:1.35,ease:"power4.inOut"},onComplete:()=>o(!0)}).to(t,{y:"0%"},0).to(t,{clipPath:"polygon(0% 0%,100% 0%,100% 100%,0% 100%)"},0).to(e||t,{opacity:1,ease:"none"},.6)}))}
		async function coverOut({closeMenus:n=!0}={}){const{el:e,tint:t}=getOverlay();if(!e){try{window.NavigationManager?.setLock("overlay",!1)}catch{}return!0}if(n)try{window.forceCloseMenus?.(document)}catch{}return runningCoverOut||(runningCoverOut=new Promise((n=>{if("none"===getComputedStyle(e).display){e.style.display="none",e.style.pointerEvents="none";try{window.NavigationManager?.setLock("overlay",!1)}catch{}return runningCoverOut=null,n(!0)}gsap.timeline({onStart(){e.style.pointerEvents="auto"},onComplete(){gsap.set(e,{clearProps:"transform,clipPath"}),t&&gsap.set(t,{clearProps:"opacity"}),e.style.display="none",e.style.pointerEvents="none";try{window.NavigationManager?.setLock("overlay",!1)}catch{}runningCoverOut=null,n(!0)}}).to(e,{duration:.6,ease:"power4.in",y:"-100%"},0).to(t||e,{duration:.6,ease:"none",opacity:0},0)})),runningCoverOut)}
		return { coverIn, coverOut };
	})();

// System Helpers
	function registerGsapObserver(e){return window._gsapObservers.push(e),e}function registerTicker(e){return window._activeTickers.push(e),e}function registerObserver(e){return window._activeObservers.push(e),e}window._gsapObservers=window._gsapObservers||[],window._activeTickers=window._activeTickers||[],window._activeObservers=window._activeObservers||[];
	let destroyCursor = null;	
	function destroyAllYourInits(){document.querySelectorAll(".cursor-webgl, .custom-cursor").forEach((r=>{try{r.remove()}catch(r){}}));try{window.ScrollTrigger&&ScrollTrigger.getAll().forEach((r=>r.kill()))}catch(r){}if(window.Observer&&Observer.getAll)try{Observer.getAll().forEach((r=>{try{r.kill&&r.kill()}catch(r){}}))}catch(r){}try{Array.isArray(window._gsapObservers)&&(window._gsapObservers.forEach((r=>{try{r.kill&&r.kill()}catch(r){}})),window._gsapObservers=[])}catch(r){}try{Array.isArray(window._activeTickers)&&(window._activeTickers.forEach((r=>{try{gsap.ticker.remove(r)}catch(r){}})),window._activeTickers=[])}catch(r){}try{Array.isArray(window._activeObservers)&&(window._activeObservers.forEach((r=>{try{r.disconnect&&r.disconnect()}catch(r){}})),window._activeObservers=[])}catch(r){}try{"function"==typeof destroyCursor&&(destroyCursor(),destroyCursor=null)}catch(r){}}	
	function runSafeInit(e,{preserveServicePins:r=!1}={}){return new Promise(i=>{const n=async()=>{if(window.ScrollTrigger)ScrollTrigger.getAll().forEach(s=>{(r&&s.trigger?.classList?.contains("section-single-service"))||s.kill()});(window._activeObservers||[]).forEach(s=>{try{"function"==typeof s.disconnect&&s.disconnect()}catch{}}),window._activeObservers=[];initAllYourInits(e),await new Promise(s=>requestAnimationFrame(s)),await new Promise(s=>requestAnimationFrame(s)),window.ScrollTrigger&&ScrollTrigger.refresh(),i()};/^((?!chrome|android).)*safari/i.test(navigator.userAgent)?requestAnimationFrame(n):document.fonts&&document.fonts.ready?document.fonts.ready.then(()=>{requestAnimationFrame(()=>{requestAnimationFrame(()=>{"requestIdleCallback"in window?requestIdleCallback(n):setTimeout(n,0)})})}):setTimeout(n,600)})}

// Site Helpers
	function setActiveTab(e){document.querySelectorAll("[data-tab-link] a, [data-tab-link].is-active, a.is-active").forEach((e=>e.classList.remove("is-active")));const c="selected"===e?"selectedOpen":"archive"===e?"archiveOpen":"resources"===e?"resourcesOpen":"",t=c?document.querySelector(`#${c} a`)||document.querySelector(`#${c}`):null;t&&t.classList.add("is-active")}
	function applyOverscroll(e){const o="selected"===e?"none":"auto";document.documentElement.style.setProperty("overscroll-behavior",o,"important"),document.documentElement.style.setProperty("overscroll-behavior-y",o,"important"),document.body.style.setProperty("overscroll-behavior",o,"important"),document.body.style.setProperty("overscroll-behavior-y",o,"important")}
	

// Text Animation + Appear in Line
	function splitAndMask(e){if(e._originalHTML||(e._originalHTML=e.innerHTML),e._split)return e._split;const t=getComputedStyle(e).whiteSpace||"normal",i=e.style.whiteSpace,l=e.style.display;e.style.whiteSpace=t,"inline"===getComputedStyle(e).display&&(e.style.display="block"),e.clientWidth;const s=new SplitText(e,{type:"lines",linesClass:"line",reduceWhiteSpace:!1});return s.lines.forEach(n=>{const a=n.getBoundingClientRect().height||n.offsetHeight||0,o=document.createElement("div");o.className="text-mask",o.style.overflow="hidden",o.style.display="block",o.style.height=a+"px",n.style.whiteSpace=t,n.style.display="block",n.parentNode.insertBefore(o,n),o.appendChild(n)}),gsap.set(s.lines,{yPercent:100,rotation:10,transformOrigin:"0 10%",willChange:"transform,opacity"}),e.style.whiteSpace=i,e.style.display=l,e._split=s,s}
	function safelyRevertSplit(e,i){e&&i&&(e.revert(),i._originalHTML&&(i.innerHTML=i._originalHTML,delete i._originalHTML),delete i._split)}
	function animateLines(t){return gsap.set(t,{transformOrigin:"0 10%",rotation:10,yPercent:100,willChange:"transform, opacity"}),gsap.to(t,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08})}
	function initTextAnimationOne(e=document,t=".ta-one"){e.querySelectorAll(t).forEach((e=>{gsap.set(e,{autoAlpha:0}),safelyRevertSplit(e._split,e)}));const n=registerObserver(new IntersectionObserver(((e,t)=>{e.forEach((e=>{if(!e.isIntersecting)return;const n=e.target;gsap.set(n,{autoAlpha:1});const s=splitAndMask(n);animateLines(s.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(s,n)})),t.unobserve(n)}))}),{root:null,rootMargin:"0px 0px -5% 0px",threshold:0}));e.querySelectorAll(t).forEach((e=>{n.observe(e);const t=e.getBoundingClientRect();if(t.top<window.innerHeight&&t.bottom>0){gsap.set(e,{autoAlpha:1});const t=splitAndMask(e);animateLines(t.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(t,e)})),n.unobserve(e)}}));e.querySelector(".w-tabs")&&e.querySelectorAll(".w-tab-pane").forEach((e=>{registerObserver(new MutationObserver((()=>{e.classList.contains("w--tab-active")&&e.querySelectorAll(t).forEach((e=>{const t=e.getBoundingClientRect();if(t.top<window.innerHeight&&t.bottom>0){gsap.set(e,{autoAlpha:1});const t=splitAndMask(e);animateLines(t.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(t,e)}))}}))}))).observe(e,{attributes:!0,attributeFilter:["class"]})}))}
	function initAppearInLine(e=document,t=".appear-in-line",r=":scope > *"){const o=.15,n=.8;e.querySelectorAll(t).forEach((t=>{const a=[],s=[];Array.from(t.querySelectorAll(r)).forEach((e=>{const t=getComputedStyle(e),r=parseInt(t.columnCount,10)||1,o=e.getBoundingClientRect();if(r>1){const t=new SplitText(e,{type:"lines",linesClass:"split-line"});a.push(t);const n=o.width/r,i=Array.from({length:r},(()=>[]));t.lines.forEach((e=>{const t=e.getBoundingClientRect().left-o.left,a=Math.min(Math.floor(t/n),r-1);i[a].push(e),gsap.set(e,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"})})),i.forEach((e=>s.push(e)))}else gsap.set(e,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"}),s.push([e])}));const i=registerObserver(new IntersectionObserver(((e,t)=>{e.forEach((e=>{if(!e.isIntersecting)return;t.unobserve(e.target),s.forEach(((e,t)=>{gsap.to(e,{y:0,opacity:1,filter:"blur(0px)",duration:n,ease:"power2.out",delay:t*o})}));const r=(s.length-1)*o+n;gsap.delayedCall(r+.05,(()=>{a.forEach((e=>e.revert()))}))}))}),{root:null,rootMargin:"0px 0px -10% 0px",threshold:0}));t._appearData={splits:a,groups:s,observer:i},i.observe(t);const l=t.getBoundingClientRect();if(l.top<window.innerHeight&&l.bottom>0){i.unobserve(t),s.forEach(((e,t)=>{gsap.to(e,{y:0,opacity:1,filter:"blur(0px)",duration:n,ease:"power2.out",delay:t*o})}));const e=(s.length-1)*o+n;gsap.delayedCall(e+.05,(()=>a.forEach((e=>e.revert()))))}if(e.querySelector(".w-tabs")){const e=t.closest(".w-tab-pane");e&&registerObserver(new MutationObserver((()=>{if(!e.classList.contains("w--tab-active"))return;i.observe(t);const r=t.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0){i.unobserve(t),s.forEach(((e,t)=>{gsap.to(e,{y:0,opacity:1,filter:"blur(0px)",duration:n,ease:"power2.out",delay:t*o})}));const e=(s.length-1)*o+n;gsap.delayedCall(e+.05,(()=>a.forEach((e=>e.revert()))))}}))).observe(e,{attributes:!0,attributeFilter:["class"]})}}))}

// Reparent data-child into matching data-parent + Theme Switch + Custom Cursor + Accordions (incl. group behavior)
	function initThemeSwitch(t=document){const e=t.querySelector(".theme-switch");if(!e)return;const c=document.documentElement.getAttribute("data-theme");e.classList.toggle("dark","dark"===c),e.addEventListener("click",(()=>{const t="dark"===document.documentElement.getAttribute("data-theme")?"light":"dark";document.documentElement.setAttribute("data-theme",t),localStorage.setItem("theme",t),e.classList.toggle("dark","dark"===t)}))}
	function initCustomCursor(e=document){if(e.__customCursorDestroy)return e.__customCursorDestroy;if(!matchMedia("(pointer:fine)").matches&&!matchMedia("(hover:hover)").matches)return document.body.classList.remove("cursor--disable-all-cursors"),e.__customCursorDestroy=()=>{},e.__customCursorDestroy;const t=document.createElement("canvas");t.className="cursor-webgl",document.body.appendChild(t);const s=t.getContext("2d"),o=document.createElement("div");o.className="custom-cursor";const n=document.createElement("div");n.className="cursor-content",o.appendChild(n),document.body.appendChild(o);const r=innerWidth/2,i=innerHeight/2,a={x:r,y:i,tx:r,ty:i};gsap.set(o,{x:a.x,y:a.y,scale:1,opacity:0,transformOrigin:"center center"}),gsap.set(n,{scale:1,transformOrigin:"center center"});const c=Array.from({length:40},(()=>({x:a.x,y:a.y,vx:0,vy:0}))),u={s:1};let l=0,d=0;function m(){l=innerWidth,d=innerHeight,t.width=l,t.height=d}m();let v=null,y=null,h=null;const p=gsap.quickSetter(o,"x","px"),g=gsap.quickSetter(o,"y","px");let x=null,f=!1,L=!1;const C=.01,E=.005;let b=a.x,w=a.y;function _(){clearTimeout(x),x=setTimeout(F,1e4)}function A(){const e=document.documentElement,t=e.clientWidth,s=e.clientHeight;b=(.25+.5*Math.random())*t,w=(.25+.5*Math.random())*s}function F(){if(f||L)return;f=!0,A();const e=()=>{f&&!L&&(Math.random()<E&&A(),a.tx+=(b-a.tx)*C,a.ty+=(w-a.ty)*C,h=requestAnimationFrame(e))};h=requestAnimationFrame(e)}function q(){f=!1,h&&cancelAnimationFrame(h),h=null}const M=e=>{L||(q(),_(),a.tx=e.clientX,a.ty=e.clientY)},T=()=>{document.hidden?q():_()},k=e=>{const t=e.target.closest("[data-cursor]");if(!t)return;n.innerHTML="",o.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),u.s=1;const s=(t.dataset.cursor||"").toLowerCase();let r=1;if("hide"===s)return o.classList.add("cursor--hide"),document.body.classList.add("cursor--disable-all-cursors"),gsap.set(o,{scale:0,opacity:0,overwrite:!0}),void gsap.set(u,{s:0,overwrite:!0});if("scaleup"===s)r=3,o.classList.add("cursor--scaleup");else if("text"===s)n.textContent=t.dataset.text||"",o.classList.add("cursor--active"),r=3;else if("icon"===s){const e=(t.dataset.icon||"").trim();if(e.toLowerCase().endsWith(".svg")){const t=new Image;t.src=e,t.style.width=t.style.height="1em",n.appendChild(t)}else if(e){const t=document.createElement("i");t.className=e,n.appendChild(t)}o.classList.add("cursor--active"),r=3}gsap.killTweensOf(n),gsap.set(n,{scale:1/r}),gsap.to(o,{scale:r,opacity:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(u,{s:r,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0})},D=e=>{e.target.closest("[data-cursor]")&&(n.innerHTML="",o.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),gsap.killTweensOf(n),gsap.set(n,{scale:1}),gsap.to(o,{scale:1,opacity:0,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(u,{s:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}))};function N(){if(!L){L=!0,q(),v&&cancelAnimationFrame(v),y&&cancelAnimationFrame(y),removeEventListener("resize",m),document.removeEventListener("mousemove",M),document.removeEventListener("pointerover",k),document.removeEventListener("pointerout",D),document.removeEventListener("visibilitychange",T);try{t.remove()}catch(e){}try{o.remove()}catch(e){}e.__customCursorDestroy=null}}return addEventListener("resize",m),document.addEventListener("mousemove",M,{passive:!0}),document.addEventListener("pointerover",k,{passive:!0}),document.addEventListener("pointerout",D,{passive:!0}),document.addEventListener("visibilitychange",T),v=requestAnimationFrame((function e(){s.clearRect(0,0,l,d),a.x+=.45*(a.tx-a.x),a.y+=.45*(a.ty-a.y),c.forEach(((e,t)=>{if(0===t)return e.x=a.x,void(e.y=a.y);const s=c[t-1];e.vx+=.4*(s.x-e.x),e.vy+=.4*(s.y-e.y),e.vx*=.5,e.vy*=.5,e.x+=e.vx,e.y+=e.vy}));const t=getComputedStyle(document.documentElement).getPropertyValue("--colors--highlight").trim()||"#000";s.strokeStyle=t;for(let e=0;e<c.length-1;e++){const t=c[e],o=c[e+1],n=e/(c.length-1);s.lineWidth=16*(1-n)+2*n,s.lineCap="round",s.beginPath(),s.moveTo(t.x,t.y),s.lineTo(o.x,o.y),s.stroke()}s.beginPath(),s.fillStyle=t,s.arc(a.x,a.y,10*u.s,0,2*Math.PI),s.fill(),v=requestAnimationFrame(e)})),y=requestAnimationFrame((function e(){p(a.x),g(a.y),y=requestAnimationFrame(e)})),_(),e.__customCursorDestroy=N,N}
	function initAccordions(e=document){const o=e.querySelectorAll(".accordion-list");if(!o.length)return;let t;const i=()=>{clearTimeout(t),t=setTimeout((()=>ScrollTrigger.refresh()),100)};o.forEach((e=>{const o=e.querySelectorAll(".accordion-subservice, .accordion-mindset, .accordion-quote");o.length&&o.forEach((e=>{const t=e.querySelector(".accordion-header"),c=e.querySelector(".cross-line-animating"),r=e.querySelector(".accordion-content"),a=e.querySelector(".accordion-icon-quote"),n=e.classList.contains("accordion-quote");if(!t||!c||!r)return;gsap.set(r,{maxHeight:0,opacity:0,paddingBottom:0,paddingTop:n?0:void 0});const s=gsap.timeline({paused:!0,defaults:{ease:"power2.out"}}).to(t,{paddingTop:"2rem",duration:.4},0).to(c,{rotation:0,duration:.4},0).to(r,{maxHeight:600,opacity:1,paddingBottom:n?"0rem":"2rem",paddingTop:n?"2rem":void 0,duration:.5,onUpdate:i,onComplete:()=>gsap.set(r,{maxHeight:"none"})},0);n&&a&&s.from(a,{opacity:0,duration:.4},0),e._accordionTimeline=s,e.addEventListener("click",(()=>{if(s.isActive())return;const c=t.classList.contains("accordion-active");o.forEach((o=>{if(o!==e){const e=o.querySelector(".accordion-header"),t=o._accordionTimeline;e.classList.contains("accordion-active")&&!t.isActive()&&(e.classList.remove("accordion-active"),t.reverse())}})),c?(gsap.set(r,{maxHeight:r.offsetHeight}),s.eventCallback("onReverseComplete",i),s.reverse()):(gsap.set(r,{maxHeight:0}),s.play()),t.classList.toggle("accordion-active",!c)}))}))}))}

// Unified Navigation System
	function initMenuNavigation(e=document){e.querySelectorAll(".nav-primary-wrap").forEach((e=>{const t=e.querySelector(".nav-button-menu"),n=e.querySelector(".nav-button-text"),o=e.querySelector(".phone-number"),l=e.querySelectorAll(".button-minimal-darkmode"),r=e.querySelectorAll(".menu-link"),a=e.querySelector(".ta-one-menu");if(!(t&&n&&o&&l.length&&r.length&&a))return;let i;n.dataset.orig=n.textContent;const u=gsap.timeline({paused:!0}).call((()=>{i=splitAndMask(a),animateLines(i.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(i,a),i=null}))}),null,0).from(o,{opacity:0,duration:.5},">").from(l,{opacity:0,duration:.5,stagger:.2},"<").from(r,{opacity:0,yPercent:240,duration:.5,stagger:.2},"<").to(n,{text:"Close",duration:.3},"<");u.eventCallback("onReverseComplete",(()=>{n.textContent=n.dataset.orig})),e._menuTimeline=u,e._menuButton=t}))}
	function initMenuLinkHover(e=document){if(!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches)return;e.querySelectorAll(".menu-link").forEach(n=>{if(n._hoverBound)return;n._hoverBound=!0;let t=n.querySelector(".menu-link-bg");t||(t=document.createElement("div"),t.classList.add("menu-link-bg"),n.appendChild(t)),n.addEventListener("mouseenter",o=>{const{top:i,height:r}=n.getBoundingClientRect(),s=o.clientY-i<r/2;t.style.transformOrigin=s?"top center":"bottom center",gsap.to(t,{scaleY:1,duration:.3,ease:"power2.out"})}),n.addEventListener("mouseleave",o=>{const{top:i,height:r}=n.getBoundingClientRect(),s=o.clientY-i<r/2;t.style.transformOrigin=s?"top center":"bottom center",gsap.to(t,{scaleY:0,duration:.3,ease:"power2.in"})})})}
	function initFilterNavigation(e=document){const t=e.dataset?.barbaNamespace||e.getAttribute("data-barba-namespace")||"";e.querySelectorAll(".nav-primary-wrap").forEach(r=>{const a=r.querySelector(".nav-button-filter"),o=r.querySelector(".filters-container"),i=r.querySelectorAll(".filter-tuner"),n=r.querySelector(".filter-line-1"),l=r.querySelector(".filter-line-2"),c=r.querySelector(".modal-filters-caption"),s=r.querySelectorAll(".modal-filters-item"),u=e.querySelector(".menu-filter-hover"),d=e.querySelectorAll(".menu-filter-image");if(!a||!o||!s.length)return;("archive"===t?(a.style.display="flex",gsap.to(a,{opacity:1,duration:.2})):(gsap.to(a,{opacity:0,duration:.2,onComplete:()=>a.style.display="none"}),o.style.display="none"));if(u&&d.length){gsap.set(u,{xPercent:-50,yPercent:-50,scale:0});const e=gsap.quickTo(u,"x",{duration:2.6,ease:"expo"}),t=gsap.quickTo(u,"y",{duration:2.6,ease:"expo"}),r=r=>{e(r.pageX),t(r.pageY)};window.addEventListener("mousemove",r,{passive:!0}),registerObserver({disconnect(){window.removeEventListener("mousemove",r)}});const a=gsap.timeline({paused:!0}).to(u,{scale:1,opacity:1,rotation:0,duration:.5,ease:"power1.inOut"});s.forEach(((e,t)=>{e.addEventListener("mouseover",(()=>{d[t]?.classList.add("active"),a.play()})),e.addEventListener("mouseout",(()=>{a.reverse(),d[t]?.classList.remove("active")}))}))}const p=gsap.timeline({paused:!0}).to(o,{opacity:1,duration:.4,ease:"power2.out"},0).to(i,{opacity:0,duration:.15},"<").to(n,{rotation:45,transformOrigin:"center",duration:.35},"<").to(l,{rotation:-45,marginTop:"-4px",transformOrigin:"center",duration:.35},"<").from(c,{opacity:0,duration:.5},"<").from(s,{opacity:0,duration:.8,stagger:.2},"<");s.forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const r=e.id.replace("nav-archive-filter-",""),a=document.getElementById(`archive-filter-${r}`);a&&a.click(),p.timeScale(3).reverse()})}),r._filterTimeline=p,r._filterButton=r.querySelector(".nav-button-filter")})}
	function initNavigationTriggers(e=document){e.querySelectorAll(".nav-primary-wrap").forEach(a=>{if(a._navTriggersBound)return;a._navTriggersBound=!0;const l=a._menuButton,t=a._filterButton,n=a._menuTimeline,o=a._filterTimeline,i=a.querySelector(".menu-wrapper"),r=a.querySelector(".menu-container"),s=a.querySelector(".filters-container");if(!n&&!o)return;let c=null;const d=()=>{r&&(r.style.display="none"),i&&(i.style.display="none"),document.body.style.overflow="",c=null},h=()=>{s&&(s.style.display="none"),i&&(i.style.display="none"),document.body.style.overflow="",c=null};n&&n.eventCallback("onReverseComplete",d),o&&o.eventCallback("onReverseComplete",h),l&&n&&l.addEventListener("click",()=>{"filter"===c&&o?(o.timeScale(2).reverse(),o.eventCallback("onReverseComplete",()=>{h(),c="menu",document.body.style.overflow="hidden",i&&(i.style.display="flex"),r&&(r.style.display="flex"),n.timeScale(1).play(0),o.eventCallback("onReverseComplete",h)})):"menu"!==c?(c="menu",document.body.style.overflow="hidden",i&&(i.style.display="flex"),r&&(r.style.display="flex"),n.timeScale(1).play(0)):n.timeScale(2).reverse()}),t&&o&&t.addEventListener("click",()=>{"menu"===c&&n?(n.timeScale(2).reverse(),n.eventCallback("onReverseComplete",()=>{d(),c="filter",document.body.style.overflow="hidden",i&&(i.style.display="flex"),s&&(s.style.display="flex"),o.timeScale(1).play(0),n.eventCallback("onReverseComplete",d)})):"filter"!==c?(c="filter",document.body.style.overflow="hidden",i&&(i.style.display="flex"),s&&(s.style.display="flex"),o.timeScale(1).play(0)):o.timeScale(2).reverse()})})}
	function initNavigation(e=document){initMenuNavigation(e);initFilterNavigation(e);initNavigationTriggers(e)}
	function initCaseStudyCloseButton(e=document){const t=e.querySelector(".nav-button-close-case");if(!t)return;const a=(location.pathname||"/").replace(/\/+$/,""),o=/^\/archive\/[^/]+$/.test(a),s=!!e.querySelector(".cs-hero-image")||!!e.querySelector(".cs-headline")||!!e.querySelector(".cs-gallery-inner");if(o||s)t.style.display="flex",t.style.pointerEvents="auto",t.setAttribute("aria-hidden","false"),t.setAttribute("aria-label",t.getAttribute("aria-label")||"Close case study"),window.gsap?gsap.to(t,{opacity:1,duration:.2}):t.style.opacity="1";else{const e=()=>{t.style.display="none",t.style.pointerEvents="none"};t.setAttribute("aria-hidden","true"),window.gsap?gsap.to(t,{opacity:0,duration:.2,onComplete:e}):(t.style.opacity="0",e())}}

// Page: Index (Selected Work)
	function initSelectedWorkLoop(e=document){const t=e.querySelector(".selected-container"),r=t?.querySelector(".selected-content");if(!t||!r||t.__selectedLoopInited)return;t.__selectedLoopInited=!0;const n=Array.from(r.querySelectorAll(".selected-item-outer"));if(!n.length)return;r.style.justifyContent="center",r.style.transform="translateZ(0)";const o=s=>{const c=getComputedStyle(s);return s.offsetWidth+((parseFloat(c.marginLeft)||0)+(parseFloat(c.marginRight)||0))},a=()=>{const s=Math.max(document.documentElement.clientWidth,window.innerWidth||0),c=window.matchMedia("(max-width: 767px)").matches;return Math.round(s*(c?0.78:0.28))},l=s=>{r.querySelectorAll(".selected-item-outer").forEach(i=>{i._baseW=s,i.style.width=s+"px"})},u=()=>{let s=0;return Array.from(r.children).forEach(i=>{1===i.nodeType&&(s+=o(i))}),s},i=()=>{n.forEach(s=>{const c=s.cloneNode(!0);c.setAttribute("data-clone","true"),r.appendChild(c)})};let c=0;function d(){const s=Array.from(r.children).filter(m=>1===m.nodeType),i=Math.floor(s.length/2);let d2=0;for(let m=0;m<i;m++)d2+=o(s[m]);const g=o(s[i]);c=-(d2+.5*g-.5*t.clientWidth),gsap.set(r,{x:c})}function h(){t.hasAttribute("data-loop-ready")||(t.setAttribute("data-loop-ready","1"),r.dispatchEvent(new CustomEvent("selected:loop-ready",{bubbles:!0})))}(function(){Array.from(r.children).forEach(s=>{1===s.nodeType&&s.hasAttribute("data-clone")&&s.remove()}),l(a()),i(),i();const s=3*t.clientWidth;let m=0;for(;u()<s&&m++<8;)i();l(a())})();let s=0,f=1;const p={t:0},m=gsap.quickTo(p,"t",{duration:.45,ease:"power3.out",onUpdate:y});function y(){r.querySelectorAll(".selected-item-outer").forEach(v=>{const w=v._baseW||a();v.style.width=w*(1+p.t)+"px"})}let b=!1;const g=(v,w)=>{const A=w/16.6667,S=s+1*f;c-=S*A;let L=r.firstElementChild,x=0;for(;L&&c<-o(L)&&(c+=o(L),r.appendChild(L),L=r.firstElementChild,!(++x>50)););let C=r.lastElementChild;for(x=0;C&&c>0&&(c-=o(C),r.insertBefore(C,r.firstElementChild),C=r.lastElementChild,!(++x>50)););gsap.set(r,{x:c});const E=Math.min(1,Math.abs(S)/70);m((S>=0?.14:-.1)*E),Math.abs(S)<3&&Math.abs(p.t)>.002&&!b&&(b=!0,gsap.to(p,{t:0,duration:1.1,ease:"elastic.out(0.62, 0.32)",onUpdate:y})),Math.abs(S)>=3&&(b=!1);const k=r.querySelectorAll(".selected-item-visual");if(k.length){const q=.5*window.innerWidth,T=.5+.5*E;k.forEach(N=>{const O=N.closest(".selected-visual");if(!O)return;const D=O.getBoundingClientRect(),M=(q-(D.left+.5*D.width))/window.innerWidth;N.style.setProperty("--drift",80*M*T+"px")})}s*=Math.pow(.94,A),Math.abs(s)<.01&&(s=0)};gsap.ticker.add(g),registerTicker(g),registerGsapObserver(Observer.create({target:r,type:"wheel,touch",wheelSpeed:1,tolerance:6,onChange(v){const w=Math.abs(v.deltaX)>=Math.abs(v.deltaY)?v.deltaX:v.deltaY;if(!w)return;const A=v.event.type.includes("touch")?.34:.08;s+=w*A,s=gsap.utils.clamp(-70,70,s),f=w>0?1:-1}})),d(),h();let v=0;const w=new ResizeObserver(()=>{cancelAnimationFrame(v),v=requestAnimationFrame(()=>{l(a()),y(),d(),h()})});w.observe(t),registerObserver(w)}	

// Page: Archive
	function initArchiveFilters(e=document){const t=Array.from(e.querySelectorAll(".filters-tab")),r=Array.from(e.querySelectorAll(".list-item-archive-project")),o=Array.from(e.querySelectorAll("[id^='nav-archive-filter-']"));if(!t.length||!r.length)return;r.forEach((e=>{e._catsNorm||(e._catsNorm=Array.from(e.querySelectorAll(".archive-categories .cms-categories")).map((e=>(e.textContent||"").trim().toLowerCase().replace(/[\W_]+/g,""))))}));const a=e=>"all"===e?r.length:r.filter((t=>t._catsNorm.includes(e))).length;function l(t,o=!0){const a=e.querySelector("#archive-results-counter"),l=a&&parseInt((a.textContent||"").replace(/\D/g,""),10)||0;r.forEach((e=>{const r="all"===t||e._catsNorm.includes(t);e.style.display=r?"":"none"}));const c=r.filter((e=>"none"!==e.style.display)),i=c.length;if(a&&gsap.to({v:l},{v:i,duration:o?.5:.01,ease:"power1.out",onUpdate(){a.textContent=Math.round(this.targets()[0].v)}}),!c.length)return;if(o){const e=gsap.timeline();e.set(c,{y:100,opacity:0,filter:"blur(0px)",willChange:"transform,opacity"}),e.to(c,{y:0,opacity:1,duration:.6,ease:"power2.out",stagger:.12})}else gsap.set(c,{y:0,opacity:1,filter:"blur(0px)"});const s=c.find((e=>null!==e.offsetParent));e.querySelectorAll(".list-item-archive-project.open").forEach((e=>e.classList.remove("open"))),s&&s.classList.add("open")}t.forEach((e=>{const t=e.id.replace("archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),r=e.querySelector(".filters-counter");r&&(r.textContent=`(${a(t)})`)})),o.forEach((e=>{const t=e.querySelector(".nav-counter-filters"),r=e.id.replace("nav-archive-filter-","").toLowerCase().replace(/[\W_]+/g,"");t&&(t.textContent=`(${a(r)})`)})),t.forEach((e=>{e.addEventListener("click",(r=>{r.preventDefault(),t.forEach((e=>e.classList.remove("active"))),e.classList.add("active");l(e.id.replace("archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),!0)}))}));const c=e.querySelector("#archive-filter-all");c&&c.classList.add("active"),l("all",!1);const i=Array.from(e.querySelectorAll(".list-item-archive-project img")).slice(0,12);("requestIdleCallback"in window?window.requestIdleCallback:e=>setTimeout(e,0))((()=>{i.forEach((e=>{e&&e.decode&&e.decode().catch((()=>{}))}))}))}

// Page: Resources
	function initResourcesPinnedSections(t=document){if(!window.gsap||!window.ScrollTrigger)return;const e=Array.from(t.querySelectorAll(".section-resources .resource-item"));if(!e.length)return;const r=window.matchMedia("(pointer: coarse), (hover: none)").matches,o={first:{visual:{start:"top 85%",end:"bottom top",dist:-320,blur:6},title:{start:"top 55%",end:"bottom top",dist:320},block:{start:"bottom 115%",end:"bottom top",dist:-480},contrast:!0},middle:{visual:{start:"top 85%",end:"bottom top",dist:-320,blur:6},title:{start:"top 70%",end:"bottom top",dist:320},block:{start:"bottom 115%",end:"bottom top",dist:-480},contrast:!0},last:{visual:{start:"top 85%",end:"bottom top",dist:-320,blur:6},title:{start:"top 70%",end:"bottom top",dist:560},block:{start:"bottom 100%",end:"bottom top",dist:-120},contrast:!1}};e.forEach(((t,s)=>{const i=t.querySelector(".resource-visual"),n=t.querySelector(".resource-item h2"),a=t.querySelector(".resource-block"),l=0===s,c=s===e.length-1,p=o[l?"first":c?"last":"middle"],d=e[s+1]||null,g=d||t,u=d?"top top":p.visual.end;if(i){const e=gsap.quickSetter(i,"y","px"),r=gsap.quickSetter(i,"filter"),o=p.visual.blur||0;ScrollTrigger.create({trigger:t,start:p.visual.start,endTrigger:g,end:u,scrub:!0,onUpdate:t=>{const s=t.progress;e(p.visual.dist*s),r(o?`blur(${o*s}px)`:"none")}})}if(!r&&n&&gsap.to(n,{y:p.title.dist,ease:"none",overwrite:"auto",force3D:!0,scrollTrigger:{trigger:t,start:p.title.start,endTrigger:g,end:u,scrub:!0,anticipatePin:1,invalidateOnRefresh:!0}}),!r&&a){const e=gsap.quickSetter(a,"y","px");ScrollTrigger.create({trigger:t,start:p.block.start,endTrigger:g,end:u,scrub:!0,onUpdate:t=>e(p.block.dist*t.progress)})}if(!c){const e=t.offsetHeight<window.innerHeight?"top top":"bottom bottom";gsap.timeline({scrollTrigger:{trigger:t,start:e,endTrigger:d||t,end:d?"top top":"bottom top",pin:!0,pinSpacing:!1,scrub:1,anticipatePin:1,invalidateOnRefresh:!0,onUpdate:e=>{if(!p.contrast)return void gsap.set(t,{filter:"contrast(100%) blur(0px)"});const r=e.progress,o=Math.max(0,Math.min(1,(r-.15)/.85)),s=100+-90*o,i=10*o;gsap.set(t,{filter:`contrast(${s}%) blur(${i}px)`})}}}).set(t,{filter:"contrast(100%) blur(0px)"})}})),ScrollTrigger.refresh(!0)}
	
// Page: Capabilities / Services
	function initServicesPinnedSections(t=document){const e=Array.from(t.querySelectorAll(".section-single-service"));e.length&&window.ScrollTrigger&&e.forEach((t=>{const e=t.offsetHeight<window.innerHeight;gsap.timeline({scrollTrigger:{trigger:t,start:e?"top top":"bottom bottom",pin:!0,pinSpacing:!1,scrub:1}}).to(t,{ease:"none",startAt:{filter:"contrast(100%) blur(0px)"},filter:"contrast(10%) blur(10px)"},0)}))}
	function initServicesGallery(e=document){const t=e.querySelectorAll(".infinite-gallery");t.length&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&t.forEach((e=>{const t=e.querySelector(".infinite-gallery-wrapper");if(!t||t.__inited)return;t.__inited=!0,e.setAttribute("data-armed","0");const r=Array.from(t.querySelectorAll(".service-visual-wrapper"));if(!r.length)return void e.setAttribute("data-armed","1");e.setAttribute("data-armed","measure");const i=new Set;r.forEach(((e,t)=>{e.style.height="";const r=e.getBoundingClientRect().width,i=parseFloat(getComputedStyle(e).height)||e.getBoundingClientRect().height||0;e.dataset.key=String(t),e.dataset.targetH=String(i),e.style.minWidth=r+"px",e.style.maxWidth=r+"px",e.style.height="0px",e.style.overflow="hidden",e.dataset.revealed="0"}));const a="right"===(e.dataset.direction||"left").toLowerCase(),n=parseFloat(e.dataset.speed)||.6,l=parseFloat(getComputedStyle(t).gap||0)||0,o=e=>e.getBoundingClientRect().width+l;function s(){r.forEach((e=>{const r=e.cloneNode(!0),a=e.dataset.key||"",n=+e.dataset.targetH||0;r.setAttribute("data-clone","1"),r.dataset.key=a,r.style.minWidth=e.style.minWidth,r.style.maxWidth=e.style.maxWidth,r.style.height=i.has(a)?n+"px":"0px",r.style.overflow="hidden",t.appendChild(r)}))}function d(){let e=0;return t.childNodes.forEach((t=>{1===t.nodeType&&(e+=o(t))})),e}function c(){Array.from(t.querySelectorAll(".service-visual-wrapper[data-clone]")).forEach((e=>e.remove())),s(),s();let e=0;for(;d()<3*t.clientWidth&&e++<8;)s()}c(),e.setAttribute("data-armed","1");let h=0,g=!1,u=0;function f(e){if(!g)return void cancelAnimationFrame(h);if(e-u<80)return void(h=requestAnimationFrame(f));u=e||performance.now();const r=window.innerWidth,a=-.05*r,n=1.05*r,l=Array.from(t.querySelectorAll(".service-visual-wrapper")).filter((e=>{const t=e.getBoundingClientRect();return t.right>a&&t.left<n})).filter((e=>"1"!==e.dataset.revealed&&"1"!==e.dataset.revealing)).sort(((e,t)=>e.getBoundingClientRect().left-t.getBoundingClientRect().left));if(l.length){const e=gsap.timeline();l.forEach(((r,a)=>{const n=+r.dataset.targetH||0,l=r.dataset.key||"";r.dataset.revealing="1",e.to(r,{height:n,duration:.9,ease:"power2.out",onComplete:()=>{r.style.height="",r.dataset.revealed="1",r.dataset.revealing="",i.add(l),t.querySelectorAll('.service-visual-wrapper[data-clone][data-key="'+l+'"]').forEach((e=>{e.style.height=n+"px"}))}},.12*a)}))}h=requestAnimationFrame(f)}const p=new IntersectionObserver((t=>{t.forEach((t=>{t.target===e&&(t.isIntersecting?g||(g=!0,cancelAnimationFrame(h),h=requestAnimationFrame(f)):(g=!1,cancelAnimationFrame(h)))}))}),{root:null,threshold:0,rootMargin:"0px 0px -5% 0px"});p.observe(e),registerObserver(p);let m=0,y=a?-1:1,v=60*n;const w=(e,r)=>{m-=y*v*(r/1e3);let i=t.firstElementChild,a=0;for(;i&&m<-o(i)&&(m+=o(i),t.appendChild(i),i=t.firstElementChild,!(++a>50)););let n=t.lastElementChild;for(a=0;n&&m>0&&(m-=o(n),t.insertBefore(n,t.firstElementChild),n=t.lastElementChild,!(++a>50)););gsap.set(t,{x:m});const l=window.innerWidth/2;t.querySelectorAll(".service-visual").forEach((e=>{const t=e.closest(".service-visual-wrapper");if(!t)return;const r=t.getBoundingClientRect(),i=(l-(r.left+r.width/2))/window.innerWidth;e.style.setProperty("--drift",40*i+"px")}))};gsap.ticker.add(w),registerTicker(w);const A=new ResizeObserver((()=>c()));A.observe(t),registerObserver(A)}))}

// Page: Case Studies
	function initCaseStudyBackgroundScroll(o){const r=o.closest(".barba-container"),e=o.querySelector(".cs-details"),t=o.querySelector(".cs-morework");if(!r||!e||!t)return;const a=getComputedStyle(r).backgroundColor,n="var(--colors--background)";ScrollTrigger.create({trigger:e,start:"top bottom-=15%",onEnter:()=>gsap.to(r,{backgroundColor:n,duration:.6,ease:"power1.inOut"}),onLeaveBack:()=>gsap.to(r,{backgroundColor:a,duration:.6,ease:"power1.inOut"})}),ScrollTrigger.create({trigger:t,start:"top bottom-=15%",onEnter:()=>gsap.to(r,{backgroundColor:"var(--colors--border)",duration:.6,ease:"power1.inOut"}),onLeaveBack:()=>gsap.to(r,{backgroundColor:n,duration:.6,ease:"power1.inOut"})})}
	function initDynamicPortraitColumns(e=document){const t=Array.from(e.querySelectorAll(".cs-gallery-inner"));if(!t.length)return;const r=e=>{if(e.naturalWidth>0&&e.naturalHeight>0)return e.naturalHeight/e.naturalWidth;const t=(e=>{const t=parseInt(e.getAttribute("width"),10),r=parseInt(e.getAttribute("height"),10);return t>0&&r>0?r/t:null})(e);if(t)return t;const r=e.clientWidth,n=e.clientHeight;return r>0&&n>0?n/r:null};let n=0;const i=e=>{cancelAnimationFrame(n),n=requestAnimationFrame((()=>{e()}))},o=()=>{if(t.forEach((e=>{e.style.removeProperty("width"),e.classList.remove("is-portrait","is-paired")})),!(window.innerWidth>=1024))return;const e=t.map((e=>e.querySelector("img"))).filter(Boolean).map((e=>{const t=r(e),n=!!t&&t>1;return n&&e.closest(".cs-gallery-inner")?.classList.add("is-portrait"),n}));for(let r=0;r<t.length-1;r++)e[r]&&e[r+1]&&([t[r],t[r+1]].forEach((e=>{e.style.width="calc(50% - 0.5rem)",e.classList.add("is-paired")})),r+=1)},s=t.map((e=>e.querySelector("img"))).filter(Boolean);if(!s.length)return;Promise.all(s.map((e=>{const t=()=>e.naturalWidth>0&&e.naturalHeight>0;if(t())return Promise.resolve();const r="function"==typeof e.decode?e.decode().catch((()=>{})):Promise.resolve(),n=new Promise((e=>{let r=0;const n=()=>t()?e():(r+=50,r>=3e3?e():void setTimeout(n,50));n()})),i=new Promise((t=>{const r=()=>{e.removeEventListener("load",r),t()};e.addEventListener("load",r,{once:!0})}));return Promise.race([r,n,i])}))).then((()=>{i(o)}));const a=new ResizeObserver((()=>i(o)));s.forEach((e=>a.observe(e)));const c=()=>i(o);window.addEventListener("resize",c,{passive:!0});const l=new MutationObserver((()=>{document.body.contains(e)||(a.disconnect(),window.removeEventListener("resize",c),l.disconnect())}));l.observe(document.body,{childList:!0,subtree:!0})}
	
// Page Entry Animations
	function animateSelectedEntries(e=document){const t=e.querySelector(".selected-container"),r=t?.querySelector(".selected-content"),o=Array.from(e.querySelectorAll(".selected-item-outer")),l=gsap.timeline();if(!t||!r||!o.length)return l;o.forEach((e=>{if(e.__entryDone)return;const t=e.querySelector(".selected-visual"),r=e.querySelector(".selected-item-header .headline-m"),o=e.querySelector(".selected-item-details"),l=e.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:0,transformOrigin:"bottom center",opacity:0}),r&&gsap.set(r,{opacity:0}),o&&gsap.set(o,{opacity:0,height:0}),l.length&&gsap.set(l,{opacity:0,y:20,filter:"blur(10px)"})}));return(e=>{const o=()=>{requestAnimationFrame((()=>requestAnimationFrame(e)))};if(t.hasAttribute("data-loop-ready"))return o();const l=()=>{r.removeEventListener("selected:loop-ready",l,!0),o()};r.addEventListener("selected:loop-ready",l,!0),setTimeout((()=>{r.removeEventListener("selected:loop-ready",l,!0),o()}),600)})((()=>{const e=window.innerWidth||document.documentElement.clientWidth,t=window.innerHeight||document.documentElement.clientHeight,r=o.map((r=>{const o=r.getBoundingClientRect();return{o:r,r:o,area:Math.max(0,Math.min(o.right,e)-Math.max(o.left,0))*Math.max(0,Math.min(o.bottom,t)-Math.max(o.top,0)),center:.5*(o.left+o.right)}}));let a=r.filter((e=>e.area>1)).sort(((e,t)=>e.r.left-t.r.left));if(!a.length){const t=.5*e;a=r.slice().sort(((e,r)=>Math.abs(e.center-t)-Math.abs(r.center-t))).slice(0,2).sort(((e,t)=>e.r.left-t.r.left))}const n=new Set(a.map((e=>e.o)));r.forEach((e=>{if(e.o.__entryDone||n.has(e.o))return;const t=e.o.querySelector(".selected-visual"),r=e.o.querySelector(".selected-item-header .headline-m"),o=e.o.querySelector(".selected-item-details"),l=e.o.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:1,opacity:1}),r&&gsap.set(r,{opacity:1}),o&&gsap.set(o,{opacity:1,height:"auto"}),l.length&&gsap.set(l,{opacity:1,y:0,filter:"blur(0px)"}),e.o.__entryDone=!0}));a.forEach(((e,t)=>{const r=e.o;if(r.__entryDone)return;const o=r.querySelector(".selected-visual"),a=r.querySelector(".selected-item-header .headline-m"),n=r.querySelector(".selected-item-details"),i=r.querySelectorAll(".selected-item-details .body-s"),s=.15*t;o&&l.set(o,{opacity:1},s).to(o,{scaleY:1,duration:.8,ease:"power2.out"},s),a&&l.set(a,{opacity:1},s+.2).call((()=>{if(a.__splitRun)return;a.__splitRun=!0;const e=splitAndMask(a);gsap.delayedCall(.15,(()=>{animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,a)))}))}),null,s+.2),n&&l.to(n,{opacity:1,height:"auto",duration:.4,ease:"power2.out"},s+.6),i.length&&l.to(i,{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"power2.out",stagger:.15},s+.6),r.__entryDone=!0}))})),l}
	function animateCapabilitiesEntry(t,{delayHero:e=!1}={}){const a=gsap.timeline(),o=t.querySelector(".section-table-of-contents");o&&gsap.set(o,{autoAlpha:0});const r=t.querySelector(".approach-mask");r&&(gsap.set(r,{scale:0,transformOrigin:"0% 100%",willChange:"transform"}),a.to(r,{scale:1,duration:1.2,ease:"power2.out"},0));const l=t.querySelector(".section-hero .headline-lg");if(l){gsap.set(l,{autoAlpha:0});const n=e?0.2:0;a.addLabel("heroStart",n).set(l,{autoAlpha:1},"heroStart").call(()=>{const s=splitAndMask(l);animateLines(s.lines).eventCallback("onComplete",()=>safelyRevertSplit(s,l))},null,"heroStart")}const n=t.querySelector(".section-hero .button-primary");n&&(gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),a.fromTo(n,{autoAlpha:0,y:20,filter:"blur(10px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"heroStart+=0.4"));const s=gsap.utils.toArray(t.querySelectorAll(".table-of-contents-item"));return s.length&&a.from(s,{autoAlpha:0,paddingTop:"6rem",paddingBottom:"6rem",duration:1,ease:"power2.out",stagger:.15},0),o&&a.to(o,{autoAlpha:1,duration:.6,ease:"power2.out"},0),a}
	function animateInfoEntry(e){const t=gsap.timeline(),a=e.querySelectorAll(".section-scroll-track .w-layout-cell"),o=e.querySelector(".section-hero .subpage-intro h1"),l=e.querySelector(".section-hero .subpage-intro a");if(a.forEach((e=>gsap.set(e,{scaleY:0,transformOrigin:"bottom center"}))),t.to(a,{scaleY:1,duration:1,ease:"power2.out",stagger:{each:.15,from:"start"}},0),o){gsap.set(o,{autoAlpha:0});const e=splitAndMask(o);t.set(o,{autoAlpha:1},.35).call((()=>animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,o)))),null,.35)}return l&&(gsap.set(l,{autoAlpha:0,y:20,filter:"blur(10px)"}),t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},.6)),t}
	function animateCaseStudyEntry(e){const t=gsap.timeline(),l=e.querySelector(".cs-hero-image"),a=e.querySelector(".cs-headline"),n=e.querySelectorAll(".cs-titles-inner div");return l&&gsap.set(l,{autoAlpha:0,y:80,filter:"blur(10px)"}),a&&gsap.set(a,{autoAlpha:0}),n.length&&gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),l&&t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},0),a&&t.addLabel("headline",.35).set(a,{autoAlpha:1,display:"block"},"headline").call((()=>{const e=splitAndMask(a);animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,a)))}),null,"headline"),n.length&&t.to(n,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out",stagger:.05},.6),t}
	
// Barba helpers
	const entryConfigByNamespace={selected:{delayHero:!1,entryOffset:-.2},archive:{delayHero:!1,entryOffset:-.2},resources:{delayHero:!1,entryOffset:-.2},capabilities:{delayHero:!0,entryOffset:.1},info:{delayHero:!1,entryOffset:-.2}};
	function getEntryConfig(e){const a=e?.dataset?.barbaNamespace||e?.getAttribute?.("data-barba-namespace")||"";return entryConfigByNamespace[a]||{delayHero:!1,entryOffset:0}}
	function runPageEntryAnimations(e){const{delayHero:t,entryOffset:a}=getEntryConfig(e),n=gsap.timeline();return"info"===e.dataset.barbaNamespace&&n.add(animateInfoEntry(e),0),e.querySelector(".section-table-of-contents")&&n.add(animateCapabilitiesEntry(e,{delayHero:t}),0),e.querySelector(".selected-item-outer")&&n.add(animateSelectedEntries(e),0),e.querySelector(".cs-hero-image")&&n.add(animateCaseStudyEntry(e),0),{tl:n,entryOffset:a}}
	async function finalizeAfterEntry(i){await new Promise((i=>requestAnimationFrame((()=>requestAnimationFrame((()=>setTimeout(i,30))))))),"function"==typeof initDynamicPortraitColumns&&initDynamicPortraitColumns(i),"function"==typeof initServicesPinnedSections&&initServicesPinnedSections(i),"function"==typeof initServicesGallery&&initServicesGallery(i),i.querySelector(".cs-hero-image")&&"function"==typeof initCaseStudyBackgroundScroll&&initCaseStudyBackgroundScroll(i),requestAnimationFrame((()=>ScrollTrigger.refresh(!0)))}
	async function runEntryFlow(t,{withCoverOut:n=!1}={}){t.style.visibility="";if(n) await TransitionEffects.coverOut();await runSafeInit(t,{preserveServicePins:!0});const{tl:e,entryOffset:i}=runPageEntryAnimations(t);await new Promise((n=>{e.call((()=>finalizeAfterEntry(t)),null,i+e.duration()),e.eventCallback("onComplete",n)}))}
	function forceCloseMenus(e=document){document.querySelectorAll(".nav-primary-wrap").forEach((e=>{const r=e._menuTimeline,l=e._filterTimeline;r&&r.progress()>0&&r.timeScale(2).reverse(),l&&l.progress()>0&&l.timeScale(2).reverse();const n=e.querySelector(".menu-wrapper"),o=e.querySelector(".menu-container"),t=e.querySelector(".filters-container");n?.style&&(n.style.display="none"),o?.style&&(o.style.display="none"),t?.style&&(t.style.display="none")})),document.body.style.overflow=""}
	
// ===== Debug helpers =====
function logBarbaSanity() {
  try {
    const ns = document.querySelector('[data-barba="container"]')?.getAttribute('data-barba-namespace') || '(none)';
    const overlay = !!document.querySelector('.page-overlay');
    const work = ['selected','archive','resources'];

    // Log overlay + current namespace
    console.group('%c[Sanity] Page state', 'color:#0aa; font-weight:bold');
    console.log('Namespace:', ns);
    console.log('Overlay present:', overlay);

    // Log all links that go to each namespace + whether they’re prevented
    const targets = [
      ['/new-index',      'selected'],
      ['/archive',        'archive'],
      ['/resources',      'resources'],
      ['/capabilities',   'capabilities'],
      ['/info',           'info'],
    ];

    targets.forEach(([path, label]) => {
      const links = [...document.querySelectorAll(`a[href*="${path}"]`)];
      if (!links.length) return;
      console.groupCollapsed(`Links → ${label} (${links.length})`);
      links.forEach((a, i) => {
        const preventNode = a.closest('[data-barba-prevent]');
        const preventVal  = preventNode?.getAttribute('data-barba-prevent');
        console.log(`#${i+1}`, {
          text: (a.textContent||'').trim().slice(0,60),
          href: a.getAttribute('href') || a.href,
          hasPreventAncestor: !!preventNode,
          preventValue: preventVal ?? null
        });
      });
      console.groupEnd();
    });

    // Quick rule preview: would work→work be fade?
    console.log('Work set:', work.join(', '), ' | work→work should be FADE, others SWIPE');
    console.groupEnd();
  } catch (err) {
    console.warn('[Sanity] Failed:', err);
  }
}

function installDebugProbes() {
  // 1) Wrap prevent() ONLY if it exists
  if (window.barba && !barba.__preventWrapped && barba.options && typeof barba.options.prevent === 'function') {
    const originalPrevent = barba.options.prevent;
    barba.options.prevent = (args) => {
      const blocked = originalPrevent(args);
      if (blocked) {
        const a = args.el && (args.el.tagName === 'A' ? args.el : args.el.closest?.('a'));
        console.warn('[barba][prevent] blocked', {
          text: a ? (a.textContent||'').trim().slice(0,80) : null,
          href: a ? (a.getAttribute('href') || a.href) : null,
          el: a
        });
      }
      return blocked;
    };
    barba.__preventWrapped = true;
  }

  // 2) Link probe (idempotent)
  if (!window.__linkProbeInstalled) {
    document.addEventListener('click', (ev) => {
      const a = ev.target && (ev.target.tagName === 'A' ? ev.target : ev.target.closest?.('a'));
      if (!a) return;
      const preventNode = a.closest('[data-barba-prevent]');
      const preventVal  = preventNode?.getAttribute('data-barba-prevent');
      console.log('[link]', {
        href: a.getAttribute('href') || a.href,
        text: (a.textContent||'').trim().slice(0,80),
        hasPreventAncestor: !!preventNode,
        preventValue: preventVal ?? null
      });
    }, true);
    window.__linkProbeInstalled = true;
  }

  // 3) Transition logger (idempotent)
  if (!window.__logTransitionChoice) {
    window.__logTransitionChoice = (name, data) => {
      const from = data?.current?.container?.dataset?.barbaNamespace || '(none)';
      const to   = data?.next?.container?.dataset?.barbaNamespace || '(none)';
      console.info(`[transition] ${name}`, { from, to });
    };
  }

  // 4) Barba hooks (only if hooks exist)
  if (window.barba && barba.hooks && !window.__barbaHooksInstalled) {
    barba.hooks.before(({ current, next }) => {
      const from = current?.container?.dataset?.barbaNamespace || '(none)';
      const to   = next?.container?.dataset?.barbaNamespace || '(none)';
      console.group('%c[barba] navigating', 'color:#6a0dad; font-weight:bold');
      console.log('from → to:', from, '→', to);
      console.groupEnd();
    });
    barba.hooks.after(() => setTimeout(logBarbaSanity, 0));
    window.__barbaHooksInstalled = true;
  }
}

	!function(){
		function boot() {
			ScrollState.init({ maxAgeMs: 30 * 60 * 1000 });
			NavigationManager.init({ debug: DEBUG });
			NavigationManager.installLinkInterceptor();
			window.initBarba && window.initBarba();
		}
		if (document.readyState !== "loading") boot();
		else document.addEventListener("DOMContentLoaded", boot, { once: true });
	}();

// Barba Init
	function initBarba() {
		logBarbaSanity();
		if (window.__barbaInited) return;
  		window.__barbaInited = true;
		
		barba.init({
			debug: DEBUG,
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
					name: "initial-preloader",
					once: async ({ next }) => {
						// Toggle when you want it live:
						// PreloaderService.enable(true);
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
						ScrollState.save();
						await gsap.to(current.container, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' });
						destroyAllYourInits();
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
						document.body.style.overflow = "";
						ScrollState.save();
						const ok = await TransitionEffects.coverIn();
						if (!ok) { await gsap.to(current.container, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }); }
						destroyAllYourInits();
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
		installDebugProbes();
		logBarbaSanity();
	}

// Run All Initialisers
	let _firstLoadDone = false;
	function initAllYourInits(root = document) {
		const ns = root?.dataset?.barbaNamespace || root.getAttribute("data-barba-namespace") || "";
		setActiveTab(ns);
  		applyOverscroll(ns);
		
		WebflowAdapter.reparent(root);
		initTextAnimationOne(root);
		initAppearInLine(root);
		initNavigation(root);
		initMenuLinkHover(root);
		initCaseStudyCloseButton(root);
		NavigationManager.attachMenuLocks(root);
		initThemeSwitch(root);
		initAccordions(root);
		
		if (ns === "selected") {
			initSelectedWorkLoop(root);
		}
		if (ns === "archive") {
			initArchiveFilters(root);
		}
		if (ns === "resources") {
			initResourcesPinnedSections(root);
		}
		
		requestAnimationFrame(() => WebflowAdapter.reinit());
		if (destroyCursor) { destroyCursor(); destroyCursor = null; }
		if (window.matchMedia('(pointer:fine)').matches) {
			destroyCursor = initCustomCursor(root);
		}
	}

if(typeof initBarba==="function")window.initBarba=initBarba;
if (typeof runEntryFlow === 'function')      window.runEntryFlow = runEntryFlow;
if (typeof finalizeAfterEntry === 'function') window.finalizeAfterEntry = finalizeAfterEntry;
if (typeof runPageEntryAnimations === 'function') window.runPageEntryAnimations = runPageEntryAnimations;
if (typeof getEntryConfig === 'function')    window.getEntryConfig = getEntryConfig;
if(typeof initAllYourInits==="function")window.initAllYourInits=initAllYourInits;

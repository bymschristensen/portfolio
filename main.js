// Theme Switch
	function initTheme(){const t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)}initTheme();

// GSAP
	gsap.registerPlugin(ScrollTrigger,Flip,SplitText,TextPlugin,Observer);
	const DEBUG = true;
	window.DEBUG = true;

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

// 3. Core Utilities
	window.CoreUtilities = (function () {
		const state={gsapObservers:[],domObservers:[],tickers:[],cursorDestroy:null};
		const Observers={addGsap:e=>(e&&state.gsapObservers.push(e),e),addDom:e=>(e&&state.domObservers.push(e),e),addTicker:e=>(window.gsap&&"function"==typeof e&&(gsap.ticker.add(e),state.tickers.push(e)),e),clearAll({preserveServicePins:e=!1}={}){try{window.ScrollTrigger&&ScrollTrigger.getAll().forEach((s=>{e&&s.trigger?.classList?.contains("section-single-service")||s.kill()}))}catch{}try{state.gsapObservers.forEach((e=>{try{e.kill&&e.kill()}catch{}}))}catch{}state.gsapObservers=[];try{state.tickers.forEach((e=>{try{gsap.ticker.remove(e)}catch{}}))}catch{}state.tickers=[];try{state.domObservers.forEach((e=>{try{e.disconnect&&e.disconnect()}catch{}}))}catch{}state.domObservers=[]}};
		const Cursor={setDestroy(t){state.cursorDestroy="function"==typeof t?t:null},destroy(){try{state.cursorDestroy&&state.cursorDestroy()}catch{}finally{state.cursorDestroy=null}}};
		function nukeCursorDom(){try{document.querySelectorAll(".cursor-webgl, .custom-cursor").forEach((r=>{try{r.remove()}catch{}}))}catch{}}
		async function doubleRAF(){await new Promise((e=>requestAnimationFrame(e))),await new Promise((e=>requestAnimationFrame(e)))}
		const InitManager={async run(r=document,{preserveServicePins:e=!1}={}){Observers.clearAll({preserveServicePins:e}),Cursor.destroy(),nukeCursorDom(),"function"==typeof window.initAllYourInits&&window.initAllYourInits(r),await doubleRAF(),await doubleRAF();try{window.ScrollTrigger&&ScrollTrigger.refresh()}catch{}},cleanup(r={}){Observers.clearAll(r),Cursor.destroy(),nukeCursorDom()}};
		return {
			Observers,
			Cursor,
			InitManager
		};
	})();

// 4. PreloaderService
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

// 8. EntryOrchestrator
	window.EntryOrchestrator = window.EntryOrchestrator || (function () {
		const entryConfigByNamespace={selected:{delayHero:!1,entryOffset:-.2},archive:{delayHero:!1,entryOffset:-.2},resources:{delayHero:!1,entryOffset:-.2},capabilities:{delayHero:!0,entryOffset:.1},info:{delayHero:!1,entryOffset:-.2}};
		function getEntryConfig(e){const a=e?.dataset?.barbaNamespace||e?.getAttribute?.("data-barba-namespace")||"";return entryConfigByNamespace[a]||{delayHero:!1,entryOffset:0}}
		function runPageEntryAnimations(e){const{delayHero:t,entryOffset:a}=getEntryConfig(e),n=gsap.timeline();return"info"===e.dataset.barbaNamespace&&n.add(animateInfoEntry(e),0),e.querySelector(".section-table-of-contents")&&n.add(animateCapabilitiesEntry(e,{delayHero:t}),0),e.querySelector(".selected-item-outer")&&n.add(animateSelectedEntries(e),0),e.querySelector(".cs-hero-image")&&n.add(animateCaseStudyEntry(e),0),{tl:n,entryOffset:a}}
		async function finalizeAfterEntry(i){await new Promise((i=>requestAnimationFrame((()=>requestAnimationFrame((()=>setTimeout(i,30))))))),"function"==typeof initDynamicPortraitColumns&&initDynamicPortraitColumns(i),"function"==typeof initServicesPinnedSections&&initServicesPinnedSections(i),"function"==typeof initServicesGallery&&initServicesGallery(i),i.querySelector(".cs-hero-image")&&"function"==typeof initCaseStudyBackgroundScroll&&initCaseStudyBackgroundScroll(i),requestAnimationFrame((()=>ScrollTrigger.refresh(!0)))}
		async function runEntryFlow(t,{withCoverOut:n=!1}={}){t.style.visibility="",n&&await TransitionEffects.coverOut(),await CoreUtilities.InitManager.run(t,{preserveServicePins:!0});const{tl:e,entryOffset:i}=runPageEntryAnimations(t);await new Promise((n=>{e.call((()=>finalizeAfterEntry(t)),null,i+e.duration()),e.eventCallback("onComplete",n)}))}
		function forceCloseMenus(e=document){document.querySelectorAll(".nav-primary-wrap").forEach((e=>{const r=e._menuTimeline,n=e._filterTimeline;r&&r.progress()>0&&r.timeScale(2).reverse(),n&&n.progress()>0&&n.timeScale(2).reverse(),e.querySelector(".menu-wrapper")?.style&&(e.querySelector(".menu-wrapper").style.display="none"),e.querySelector(".menu-container")?.style&&(e.querySelector(".menu-container").style.display="none"),e.querySelector(".filters-container")?.style&&(e.querySelector(".filters-container").style.display="none")})),document.body.style.overflow=""}
		
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
							ScrollState.save();
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
							ScrollState.save();
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
		
		return { init, getEntryConfig, runPageEntryAnimations, finalizeAfterEntry, runEntryFlow, forceCloseMenus };
	})();

// (Optional) BC aliases – keep old globals working
window.initBarba              = () => window.EntryOrchestrator.init();
window.runEntryFlow           = (...args) => window.EntryOrchestrator.runEntryFlow(...args);
window.finalizeAfterEntry     = (...args) => window.EntryOrchestrator.finalizeAfterEntry(...args);
window.runPageEntryAnimations = (...args) => window.EntryOrchestrator.runPageEntryAnimations(...args);
window.getEntryConfig         = (...args) => window.EntryOrchestrator.getEntryConfig(...args);
window.forceCloseMenus        = (...args) => window.EntryOrchestrator.forceCloseMenus(...args);





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

// Site Helpers
	function setActiveTab(e){document.querySelectorAll("[data-tab-link] a, [data-tab-link].is-active, a.is-active").forEach((e=>e.classList.remove("is-active")));const c="selected"===e?"selectedOpen":"archive"===e?"archiveOpen":"resources"===e?"resourcesOpen":"",t=c?document.querySelector(`#${c} a`)||document.querySelector(`#${c}`):null;t&&t.classList.add("is-active")}
	function applyOverscroll(e){const o="selected"===e?"none":"auto";document.documentElement.style.setProperty("overscroll-behavior",o,"important"),document.documentElement.style.setProperty("overscroll-behavior-y",o,"important"),document.body.style.setProperty("overscroll-behavior",o,"important"),document.body.style.setProperty("overscroll-behavior-y",o,"important")}
	
// Text Animation + Appear in Line
	function splitAndMask(e){if(e._originalHTML||(e._originalHTML=e.innerHTML),e._split)return e._split;const t=getComputedStyle(e).whiteSpace||"normal",i=e.style.whiteSpace,l=e.style.display;e.style.whiteSpace=t,"inline"===getComputedStyle(e).display&&(e.style.display="block"),e.clientWidth;const s=new SplitText(e,{type:"lines",linesClass:"line",reduceWhiteSpace:!1});return s.lines.forEach(n=>{const a=n.getBoundingClientRect().height||n.offsetHeight||0,o=document.createElement("div");o.className="text-mask",o.style.overflow="hidden",o.style.display="block",o.style.height=a+"px",n.style.whiteSpace=t,n.style.display="block",n.parentNode.insertBefore(o,n),o.appendChild(n)}),gsap.set(s.lines,{yPercent:100,rotation:10,transformOrigin:"0 10%",willChange:"transform,opacity"}),e.style.whiteSpace=i,e.style.display=l,e._split=s,s}
	function safelyRevertSplit(e,i){e&&i&&(e.revert(),i._originalHTML&&(i.innerHTML=i._originalHTML,delete i._originalHTML),delete i._split)}
	function animateLines(t){return gsap.set(t,{transformOrigin:"0 10%",rotation:10,yPercent:100,willChange:"transform, opacity"}),gsap.to(t,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08})}
	function initTextAnimationOne(e=document,t=".ta-one"){const n=[...e.querySelectorAll(t)];n.forEach((e=>{gsap.set(e,{autoAlpha:0}),safelyRevertSplit(e._split,e)}));const o=CoreUtilities.Observers.addDom(new IntersectionObserver(((e,t)=>{e.forEach((e=>{if(!e.isIntersecting)return;const n=e.target;if(n.__taOneDone)return void t.unobserve(n);gsap.set(n,{autoAlpha:1});const o=splitAndMask(n);animateLines(o.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(o,n),n.__taOneDone=!0})),t.unobserve(n)}))}),{root:null,rootMargin:"0px 0px -5% 0px",threshold:0}));n.forEach((e=>{if(e.__taOneDone)return;o.observe(e);const t=e.getBoundingClientRect();if(t.top<window.innerHeight&&t.bottom>0){gsap.set(e,{autoAlpha:1});const t=splitAndMask(e);animateLines(t.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(t,e),e.__taOneDone=!0})),o.unobserve(e)}}));e.querySelectorAll(".w-tabs .w-tab-pane").forEach((e=>{CoreUtilities.Observers.addDom(new MutationObserver((()=>{e.classList.contains("w--tab-active")&&e.querySelectorAll(t).forEach((e=>{if(e.__taOneDone)return;const t=e.getBoundingClientRect();if(t.top<window.innerHeight&&t.bottom>0){gsap.set(e,{autoAlpha:1});const t=splitAndMask(e);animateLines(t.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(t,e),e.__taOneDone=!0}))}}))}))).observe(e,{attributes:!0,attributeFilter:["class"]})}))}
	function initAppearInLine(e=document,t=".appear-in-line",o=":scope > *"){e.querySelectorAll(t).forEach((t=>{if(t.__ailInit)return;t.__ailInit=!0;const n=[],r=[];Array.from(t.querySelectorAll(o)).forEach((e=>{const t=getComputedStyle(e),o=parseInt(t.columnCount,10)||1,i=e.getBoundingClientRect();if(o>1){const t=new SplitText(e,{type:"lines",linesClass:"split-line"});n.push(t);const s=i.width/o,a=Array.from({length:o},(()=>[]));t.lines.forEach((e=>{const t=e.getBoundingClientRect().left-i.left,n=Math.min(o-1,Math.max(0,Math.floor(t/s)));a[n].push(e),gsap.set(e,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"})})),a.forEach((e=>r.push(e)))}else gsap.set(e,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"}),r.push([e])}));const i=()=>{if(t.__ailDone)return;r.forEach(((e,t)=>gsap.to(e,{y:0,opacity:1,filter:"blur(0px)",duration:.8,ease:"power2.out",delay:.15*t})));const e=.15*(r.length-1)+.8;gsap.delayedCall(e+.05,(()=>{n.forEach((e=>e.revert())),t.__ailDone=!0}))},s=CoreUtilities.Observers.addDom(new IntersectionObserver(((e,o)=>{e.forEach((e=>{e.isIntersecting&&(o.unobserve(t),i())}))}),{root:null,rootMargin:"0px 0px -10% 0px",threshold:0}));t._appearData={splits:n,groups:r,observer:s},s.observe(t);const a=t.getBoundingClientRect();a.top<window.innerHeight&&a.bottom>0&&(s.unobserve(t),i());const l=e.querySelector(".w-tabs")?t.closest(".w-tab-pane"):null;l&&CoreUtilities.Observers.addDom(new MutationObserver((()=>{if(!l.classList.contains("w--tab-active"))return;s.observe(t);const e=t.getBoundingClientRect();e.top<window.innerHeight&&e.bottom>0&&(s.unobserve(t),i())}))).observe(l,{attributes:!0,attributeFilter:["class"]})}))}

// Reparent data-child into matching data-parent + Theme Switch + Custom Cursor + Accordions (incl. group behavior)
	function initThemeSwitch(t=document){const e=t.querySelector(".theme-switch");if(!e)return;const c=document.documentElement.getAttribute("data-theme");e.classList.toggle("dark","dark"===c),e.addEventListener("click",(()=>{const t="dark"===document.documentElement.getAttribute("data-theme")?"light":"dark";document.documentElement.setAttribute("data-theme",t),localStorage.setItem("theme",t),e.classList.toggle("dark","dark"===t)}))}
	function initCustomCursor(e=document){if(e.__customCursorDestroy)return CoreUtilities.Cursor.setDestroy(e.__customCursorDestroy),e.__customCursorDestroy;if(!matchMedia("(pointer:fine)").matches&&!matchMedia("(hover:hover)").matches)return document.body.classList.remove("cursor--disable-all-cursors"),e.__customCursorDestroy=()=>{},CoreUtilities.Cursor.setDestroy(e.__customCursorDestroy),e.__customCursorDestroy;const t=document.createElement("canvas");t.className="cursor-webgl",document.body.appendChild(t);const s=t.getContext("2d"),o=document.createElement("div");o.className="custom-cursor";const r=document.createElement("div");r.className="cursor-content",o.appendChild(r),document.body.appendChild(o);const n=innerWidth/2,i=innerHeight/2,c={x:n,y:i,tx:n,ty:i};gsap.set(o,{x:c.x,y:c.y,scale:1,opacity:0,transformOrigin:"center center"}),gsap.set(r,{scale:1,transformOrigin:"center center"});const a=Array.from({length:40},(()=>({x:c.x,y:c.y,vx:0,vy:0}))),u={s:1};let l=0,m=0;function d(){l=innerWidth,m=innerHeight,t.width=l,t.height=m}d();let y=null,v=null,h=null;const p=gsap.quickSetter(o,"x","px"),g=gsap.quickSetter(o,"y","px");let x=null,f=!1,C=!1;const L=.01,E=.005;let _=c.x,b=c.y;function w(){clearTimeout(x),x=setTimeout(A,1e4)}function D(){const e=document.documentElement,t=e.clientWidth,s=e.clientHeight;_=(.25+.5*Math.random())*t,b=(.25+.5*Math.random())*s}function A(){if(f||C)return;f=!0,D();const e=()=>{f&&!C&&(Math.random()<E&&D(),c.tx+=(_-c.tx)*L,c.ty+=(b-c.ty)*L,h=requestAnimationFrame(e))};h=requestAnimationFrame(e)}function F(){f=!1,h&&cancelAnimationFrame(h),h=null}const q=e=>{C||(F(),w(),c.tx=e.clientX,c.ty=e.clientY)},M=()=>{document.hidden?F():w()},T=e=>{const t=e.target.closest("[data-cursor]");if(!t)return;r.innerHTML="",o.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),u.s=1;const s=(t.dataset.cursor||"").toLowerCase();let n=1;if("hide"===s)return o.classList.add("cursor--hide"),document.body.classList.add("cursor--disable-all-cursors"),gsap.set(o,{scale:0,opacity:0,overwrite:!0}),void gsap.set(u,{s:0,overwrite:!0});if("scaleup"===s)n=3,o.classList.add("cursor--scaleup");else if("text"===s)r.textContent=t.dataset.text||"",o.classList.add("cursor--active"),n=3;else if("icon"===s){const e=(t.dataset.icon||"").trim();if(e.toLowerCase().endsWith(".svg")){const t=new Image;t.src=e,t.style.width=t.style.height="1em",r.appendChild(t)}else if(e){const t=document.createElement("i");t.className=e,r.appendChild(t)}o.classList.add("cursor--active"),n=3}gsap.killTweensOf(r),gsap.set(r,{scale:1/n}),gsap.to(o,{scale:n,opacity:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(u,{s:n,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0})},k=e=>{e.target.closest("[data-cursor]")&&(r.innerHTML="",o.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),gsap.killTweensOf(r),gsap.set(r,{scale:1}),gsap.to(o,{scale:1,opacity:0,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(u,{s:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}))};function N(){if(!C){C=!0,F(),y&&cancelAnimationFrame(y),v&&cancelAnimationFrame(v),removeEventListener("resize",d),document.removeEventListener("mousemove",q),document.removeEventListener("pointerover",T),document.removeEventListener("pointerout",k),document.removeEventListener("visibilitychange",M);try{t.remove()}catch(e){}try{o.remove()}catch(e){}e.__customCursorDestroy=null}}return addEventListener("resize",d),document.addEventListener("mousemove",q,{passive:!0}),document.addEventListener("pointerover",T,{passive:!0}),document.addEventListener("pointerout",k,{passive:!0}),document.addEventListener("visibilitychange",M),y=requestAnimationFrame((function e(){s.clearRect(0,0,l,m),c.x+=.45*(c.tx-c.x),c.y+=.45*(c.ty-c.y),a.forEach(((e,t)=>{if(0===t)return e.x=c.x,void(e.y=c.y);const s=a[t-1];e.vx+=.4*(s.x-e.x),e.vy+=.4*(s.y-e.y),e.vx*=.5,e.vy*=.5,e.x+=e.vx,e.y+=e.vy}));const t=getComputedStyle(document.documentElement).getPropertyValue("--colors--highlight").trim()||"#000";s.strokeStyle=t;for(let e=0;e<a.length-1;e++){const t=a[e],o=a[e+1],r=e/(a.length-1);s.lineWidth=16*(1-r)+2*r,s.lineCap="round",s.beginPath(),s.moveTo(t.x,t.y),s.lineTo(o.x,o.y),s.stroke()}s.beginPath(),s.fillStyle=t,s.arc(c.x,c.y,10*u.s,0,2*Math.PI),s.fill(),y=requestAnimationFrame(e)})),v=requestAnimationFrame((function e(){p(c.x),g(c.y),v=requestAnimationFrame(e)})),w(),e.__customCursorDestroy=N,CoreUtilities.Cursor.setDestroy(N),N}
	function initAccordions(e=document){const o=e.querySelectorAll(".accordion-list");if(!o.length)return;let t;const i=()=>{clearTimeout(t),t=setTimeout((()=>ScrollTrigger.refresh()),100)};o.forEach((e=>{const o=e.querySelectorAll(".accordion-subservice, .accordion-mindset, .accordion-quote");o.length&&o.forEach((e=>{const t=e.querySelector(".accordion-header"),c=e.querySelector(".cross-line-animating"),r=e.querySelector(".accordion-content"),a=e.querySelector(".accordion-icon-quote"),n=e.classList.contains("accordion-quote");if(!t||!c||!r)return;gsap.set(r,{maxHeight:0,opacity:0,paddingBottom:0,paddingTop:n?0:void 0});const s=gsap.timeline({paused:!0,defaults:{ease:"power2.out"}}).to(t,{paddingTop:"2rem",duration:.4},0).to(c,{rotation:0,duration:.4},0).to(r,{maxHeight:600,opacity:1,paddingBottom:n?"0rem":"2rem",paddingTop:n?"2rem":void 0,duration:.5,onUpdate:i,onComplete:()=>gsap.set(r,{maxHeight:"none"})},0);n&&a&&s.from(a,{opacity:0,duration:.4},0),e._accordionTimeline=s,e.addEventListener("click",(()=>{if(s.isActive())return;const c=t.classList.contains("accordion-active");o.forEach((o=>{if(o!==e){const e=o.querySelector(".accordion-header"),t=o._accordionTimeline;e.classList.contains("accordion-active")&&!t.isActive()&&(e.classList.remove("accordion-active"),t.reverse())}})),c?(gsap.set(r,{maxHeight:r.offsetHeight}),s.eventCallback("onReverseComplete",i),s.reverse()):(gsap.set(r,{maxHeight:0}),s.play()),t.classList.toggle("accordion-active",!c)}))}))}))}

// Unified Navigation System
	function initMenuNavigation(e=document){e.querySelectorAll(".nav-primary-wrap").forEach((e=>{const t=e.querySelector(".nav-button-menu"),n=e.querySelector(".nav-button-text"),o=e.querySelector(".phone-number"),l=e.querySelectorAll(".button-minimal-darkmode"),r=e.querySelectorAll(".menu-link"),a=e.querySelector(".ta-one-menu");if(!(t&&n&&o&&l.length&&r.length&&a))return;let i;n.dataset.orig=n.textContent;const u=gsap.timeline({paused:!0}).call((()=>{i=splitAndMask(a),animateLines(i.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(i,a),i=null}))}),null,0).from(o,{opacity:0,duration:.5},">").from(l,{opacity:0,duration:.5,stagger:.2},"<").from(r,{opacity:0,yPercent:240,duration:.5,stagger:.2},"<").to(n,{text:"Close",duration:.3},"<");u.eventCallback("onReverseComplete",(()=>{n.textContent=n.dataset.orig})),e._menuTimeline=u,e._menuButton=t}))}
	function initMenuLinkHover(e=document){if(!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches)return;e.querySelectorAll(".menu-link").forEach(n=>{if(n._hoverBound)return;n._hoverBound=!0;let t=n.querySelector(".menu-link-bg");t||(t=document.createElement("div"),t.classList.add("menu-link-bg"),n.appendChild(t)),n.addEventListener("mouseenter",o=>{const{top:i,height:r}=n.getBoundingClientRect(),s=o.clientY-i<r/2;t.style.transformOrigin=s?"top center":"bottom center",gsap.to(t,{scaleY:1,duration:.3,ease:"power2.out"})}),n.addEventListener("mouseleave",o=>{const{top:i,height:r}=n.getBoundingClientRect(),s=o.clientY-i<r/2;t.style.transformOrigin=s?"top center":"bottom center",gsap.to(t,{scaleY:0,duration:.3,ease:"power2.in"})})})}
	function initFilterNavigation(e=document){const t=e.dataset?.barbaNamespace||e.getAttribute("data-barba-namespace")||"";e.querySelectorAll(".nav-primary-wrap").forEach(r=>{const a=r.querySelector(".nav-button-filter"),o=r.querySelector(".filters-container"),i=r.querySelectorAll(".filter-tuner"),n=r.querySelector(".filter-line-1"),l=r.querySelector(".filter-line-2"),c=r.querySelector(".modal-filters-caption"),s=r.querySelectorAll(".modal-filters-item"),u=e.querySelector(".menu-filter-hover"),d=e.querySelectorAll(".menu-filter-image");if(!a||!o||!s.length)return;("archive"===t?(a.style.display="flex",gsap.to(a,{opacity:1,duration:.2})):(gsap.to(a,{opacity:0,duration:.2,onComplete:()=>a.style.display="none"}),o.style.display="none"));if(u&&d.length){gsap.set(u,{xPercent:-50,yPercent:-50,scale:0});const e=gsap.quickTo(u,"x",{duration:2.6,ease:"expo"}),t=gsap.quickTo(u,"y",{duration:2.6,ease:"expo"}),r=r=>{e(r.pageX),t(r.pageY)};window.addEventListener("mousemove",r,{passive:!0}),CoreUtilities.Observers.addDom({disconnect(){window.removeEventListener("mousemove",r)}});const a=gsap.timeline({paused:!0}).to(u,{scale:1,opacity:1,rotation:0,duration:.5,ease:"power1.inOut"});s.forEach(((e,t)=>{e.addEventListener("mouseover",(()=>{d[t]?.classList.add("active"),a.play()})),e.addEventListener("mouseout",(()=>{a.reverse(),d[t]?.classList.remove("active")}))}))}const p=gsap.timeline({paused:!0}).to(o,{opacity:1,duration:.4,ease:"power2.out"},0).to(i,{opacity:0,duration:.15},"<").to(n,{rotation:45,transformOrigin:"center",duration:.35},"<").to(l,{rotation:-45,marginTop:"-4px",transformOrigin:"center",duration:.35},"<").from(c,{opacity:0,duration:.5},"<").from(s,{opacity:0,duration:.8,stagger:.2},"<");s.forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const r=e.id.replace("nav-archive-filter-",""),a=document.getElementById(`archive-filter-${r}`);a&&a.click(),p.timeScale(3).reverse()})}),r._filterTimeline=p,r._filterButton=r.querySelector(".nav-button-filter")})}
	function initNavigationTriggers(e=document){e.querySelectorAll(".nav-primary-wrap").forEach(a=>{if(a._navTriggersBound)return;a._navTriggersBound=!0;const l=a._menuButton,t=a._filterButton,n=a._menuTimeline,o=a._filterTimeline,i=a.querySelector(".menu-wrapper"),r=a.querySelector(".menu-container"),s=a.querySelector(".filters-container");if(!n&&!o)return;let c=null;const d=()=>{r&&(r.style.display="none"),i&&(i.style.display="none"),document.body.style.overflow="",c=null},h=()=>{s&&(s.style.display="none"),i&&(i.style.display="none"),document.body.style.overflow="",c=null};n&&n.eventCallback("onReverseComplete",d),o&&o.eventCallback("onReverseComplete",h),l&&n&&l.addEventListener("click",()=>{"filter"===c&&o?(o.timeScale(2).reverse(),o.eventCallback("onReverseComplete",()=>{h(),c="menu",document.body.style.overflow="hidden",i&&(i.style.display="flex"),r&&(r.style.display="flex"),n.timeScale(1).play(0),o.eventCallback("onReverseComplete",h)})):"menu"!==c?(c="menu",document.body.style.overflow="hidden",i&&(i.style.display="flex"),r&&(r.style.display="flex"),n.timeScale(1).play(0)):n.timeScale(2).reverse()}),t&&o&&t.addEventListener("click",()=>{"menu"===c&&n?(n.timeScale(2).reverse(),n.eventCallback("onReverseComplete",()=>{d(),c="filter",document.body.style.overflow="hidden",i&&(i.style.display="flex"),s&&(s.style.display="flex"),o.timeScale(1).play(0),n.eventCallback("onReverseComplete",d)})):"filter"!==c?(c="filter",document.body.style.overflow="hidden",i&&(i.style.display="flex"),s&&(s.style.display="flex"),o.timeScale(1).play(0)):o.timeScale(2).reverse()})})}
	function initNavigation(e=document){initMenuNavigation(e);initFilterNavigation(e);initNavigationTriggers(e)}
	function initCaseStudyCloseButton(e=document){const t=e.querySelector(".nav-button-close-case");if(!t)return;const a=(location.pathname||"/").replace(/\/+$/,""),o=/^\/archive\/[^/]+$/.test(a),s=!!e.querySelector(".cs-hero-image")||!!e.querySelector(".cs-headline")||!!e.querySelector(".cs-gallery-inner");if(o||s)t.style.display="flex",t.style.pointerEvents="auto",t.setAttribute("aria-hidden","false"),t.setAttribute("aria-label",t.getAttribute("aria-label")||"Close case study"),window.gsap?gsap.to(t,{opacity:1,duration:.2}):t.style.opacity="1";else{const e=()=>{t.style.display="none",t.style.pointerEvents="none"};t.setAttribute("aria-hidden","true"),window.gsap?gsap.to(t,{opacity:0,duration:.2,onComplete:e}):(t.style.opacity="0",e())}}

// Page: Index (Selected Work)
	function initSelectedWorkLoop(e=document){const t=e.querySelector(".selected-container"),o=t?.querySelector(".selected-content");if(!t||!o||t.__selectedLoopInited)return;t.__selectedLoopInited=!0;const r=Array.from(o.querySelectorAll(".selected-item-outer"));if(!r.length)return;o.style.justifyContent="center",o.style.transform="translateZ(0)";const n=e=>{const t=getComputedStyle(e);return e.offsetWidth+((parseFloat(t.marginLeft)||0)+(parseFloat(t.marginRight)||0))},a=()=>{const e=Math.max(document.documentElement.clientWidth,window.innerWidth||0),t=window.matchMedia("(max-width: 767px)").matches;return Math.round(e*(t?.78:.28))},s=e=>{o.querySelectorAll(".selected-item-outer").forEach((t=>{t._baseW=e,t.style.width=e+"px"}))},l=()=>{let e=0;return Array.from(o.children).forEach((t=>{1===t.nodeType&&(e+=n(t))})),e},i=()=>{r.forEach((e=>{const t=e.cloneNode(!0);t.setAttribute("data-clone","true"),o.appendChild(t)}))};let c=0;function d(){const e=Array.from(o.children).filter((e=>1===e.nodeType)),r=Math.floor(e.length/2);let a=0;for(let t=0;t<r;t++)a+=n(e[t]);const s=n(e[r]);c=-(a+.5*s-.5*t.clientWidth),gsap.set(o,{x:c})}function h(){t.hasAttribute("data-loop-ready")||(t.setAttribute("data-loop-ready","1"),o.dispatchEvent(new CustomEvent("selected:loop-ready",{bubbles:!0})))}!function(){Array.from(o.children).forEach((e=>{1===e.nodeType&&e.hasAttribute("data-clone")&&e.remove()})),s(a()),i(),i();const e=3*t.clientWidth;let r=0;for(;l()<e&&r++<8;)i();s(a())}();let u=0,p=1;const f={t:0},m=gsap.quickTo(f,"t",{duration:.45,ease:"power3.out",onUpdate:()=>{o.querySelectorAll(".selected-item-outer").forEach((e=>{const t=e._baseW||a();e.style.width=t*(1+f.t)+"px"}))}});let y=!1;const b=(e,t)=>{const r=(t||16.6667)/16.6667,a=u+1*p;c-=a*r;let s=o.firstElementChild,l=0;for(;s&&c<-n(s)&&l++<50;)c+=n(s),o.appendChild(s),s=o.firstElementChild;let i=o.lastElementChild;for(l=0;i&&c>0&&l++<50;)c-=n(i),o.insertBefore(i,o.firstElementChild),i=o.lastElementChild;gsap.set(o,{x:c});const d=Math.min(1,Math.abs(a)/70);m((a>=0?.14:-.1)*d),Math.abs(a)<3&&Math.abs(f.t)>.002&&!y&&(y=!0,gsap.to(f,{t:0,duration:1.1,ease:"elastic.out(0.62, 0.32)",onUpdate:()=>m(f.t)})),Math.abs(a)>=3&&(y=!1);const h=o.querySelectorAll(".selected-item-visual");if(h.length){const e=.5*window.innerWidth,t=.5+.5*d;h.forEach((o=>{const r=o.closest(".selected-visual");if(!r)return;const n=r.getBoundingClientRect(),a=(e-(n.left+.5*n.width))/window.innerWidth;o.style.setProperty("--drift",80*a*t+"px")}))}u*=Math.pow(.94,r),Math.abs(u)<.01&&(u=0)};gsap.ticker.add(b),CoreUtilities.Observers.addTicker(b),CoreUtilities.Observers.addGsap(Observer.create({target:o,type:"wheel,touch",wheelSpeed:1,tolerance:6,onChange(e){const t=Math.abs(e.deltaX)>=Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(!t)return;const o=e.event.type.includes("touch")?.34:.08;u+=t*o,u=gsap.utils.clamp(-70,70,u),p=t>0?1:-1}})),d(),h();let w=0;const g=new ResizeObserver((()=>{cancelAnimationFrame(w),w=requestAnimationFrame((()=>{s(a()),m(f.t),d(),h()}))}));g.observe(t),CoreUtilities.Observers.addDom(g)}

// Page: Archive
	function initArchiveFilters(e=document){const t=Array.from(e.querySelectorAll(".filters-tab")),r=Array.from(e.querySelectorAll(".list-item-archive-project")),a=Array.from(e.querySelectorAll("[id^='nav-archive-filter-']"));if(!t.length||!r.length)return;r.forEach((e=>{e._catsNorm||(e._catsNorm=Array.from(e.querySelectorAll(".archive-categories .cms-categories")).map((e=>(e.textContent||"").trim().toLowerCase().replace(/[\W_]+/g,""))))}));const l=e=>"all"===e?r.length:r.filter((t=>t._catsNorm.includes(e))).length;function o(t,a=!0){const l=e.querySelector("#archive-results-counter"),o=l&&parseInt((l.textContent||"").replace(/\D/g,""),10)||0;r.forEach((e=>{const r="all"===t||e._catsNorm.includes(t);e.style.display=r?"":"none"}));const c=r.filter((e=>"none"!==e.style.display)),i=c.length;if(l&&gsap.to({v:o},{v:i,duration:a?.5:.01,ease:"power1.out",onUpdate(){l.textContent=Math.round(this.targets()[0].v)}}),!c.length)return;if(a){gsap.timeline().set(c,{y:100,opacity:0,filter:"blur(0px)",willChange:"transform,opacity"}).to(c,{y:0,opacity:1,duration:.6,ease:"power2.out",stagger:.12})}else gsap.set(c,{y:0,opacity:1,filter:"blur(0px)"});e.querySelectorAll(".list-item-archive-project.open").forEach((e=>e.classList.remove("open")));const s=c.find((e=>null!==e.offsetParent));s&&s.classList.add("open")}t.forEach((e=>{const t=e.id.replace("archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),r=e.querySelector(".filters-counter");r&&(r.textContent=`(${l(t)})`)})),a.forEach((e=>{const t=e.id.replace("nav-archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),r=e.querySelector(".nav-counter-filters");r&&(r.textContent=`(${l(t)})`)})),t.forEach((e=>{e.addEventListener("click",(r=>{r.preventDefault(),t.forEach((e=>e.classList.remove("active"))),e.classList.add("active");o(e.id.replace("archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),!0)}))}));const c=e.querySelector("#archive-filter-all");c&&c.classList.add("active"),o("all",!1);const i=Array.from(e.querySelectorAll(".list-item-archive-project img")).slice(0,12);("requestIdleCallback"in window?window.requestIdleCallback:e=>setTimeout(e,0))((()=>{i.forEach((e=>{e&&e.decode&&e.decode().catch((()=>{}))}))}))}

// Page: Resources
	function initResourcesPinnedSections(t=document){if(!window.gsap||!window.ScrollTrigger)return;const e=Array.from(t.querySelectorAll(".section-resources .resource-item"));if(!e.length)return;const r=window.matchMedia("(pointer: coarse), (hover: none)").matches,o={first:{visual:{start:"top 85%",end:"bottom top",dist:-320,blur:6},title:{start:"top 55%",end:"bottom top",dist:320},block:{start:"bottom 115%",end:"bottom top",dist:-480},contrast:!0},middle:{visual:{start:"top 85%",end:"bottom top",dist:-320,blur:6},title:{start:"top 70%",end:"bottom top",dist:320},block:{start:"bottom 115%",end:"bottom top",dist:-480},contrast:!0},last:{visual:{start:"top 85%",end:"bottom top",dist:-320,blur:6},title:{start:"top 70%",end:"bottom top",dist:560},block:{start:"bottom 100%",end:"bottom top",dist:-120},contrast:!1}};e.forEach(((t,s)=>{const i=t.querySelector(".resource-visual"),n=t.querySelector(".resource-item h2"),a=t.querySelector(".resource-block"),l=0===s,c=s===e.length-1,p=o[l?"first":c?"last":"middle"],d=e[s+1]||null,g=d||t,u=d?"top top":p.visual.end;if(i){const e=gsap.quickSetter(i,"y","px"),r=gsap.quickSetter(i,"filter"),o=p.visual.blur||0;ScrollTrigger.create({trigger:t,start:p.visual.start,endTrigger:g,end:u,scrub:!0,onUpdate:t=>{const s=t.progress;e(p.visual.dist*s),r(o?`blur(${o*s}px)`:"none")}})}if(!r&&n&&gsap.to(n,{y:p.title.dist,ease:"none",overwrite:"auto",force3D:!0,scrollTrigger:{trigger:t,start:p.title.start,endTrigger:g,end:u,scrub:!0,anticipatePin:1,invalidateOnRefresh:!0}}),!r&&a){const e=gsap.quickSetter(a,"y","px");ScrollTrigger.create({trigger:t,start:p.block.start,endTrigger:g,end:u,scrub:!0,onUpdate:t=>e(p.block.dist*t.progress)})}if(!c){const e=t.offsetHeight<window.innerHeight?"top top":"bottom bottom";gsap.timeline({scrollTrigger:{trigger:t,start:e,endTrigger:d||t,end:d?"top top":"bottom top",pin:!0,pinSpacing:!1,scrub:1,anticipatePin:1,invalidateOnRefresh:!0,onUpdate:e=>{if(!p.contrast)return void gsap.set(t,{filter:"contrast(100%) blur(0px)"});const r=e.progress,o=Math.max(0,Math.min(1,(r-.15)/.85)),s=100+-90*o,i=10*o;gsap.set(t,{filter:`contrast(${s}%) blur(${i}px)`})}}}).set(t,{filter:"contrast(100%) blur(0px)"})}})),ScrollTrigger.refresh(!0)}
	
// Page: Capabilities / Services
	function initServicesPinnedSections(t=document){const e=Array.from(t.querySelectorAll(".section-single-service"));e.length&&window.ScrollTrigger&&e.forEach((t=>{const e=t.offsetHeight<window.innerHeight;gsap.timeline({scrollTrigger:{trigger:t,start:e?"top top":"bottom bottom",pin:!0,pinSpacing:!1,scrub:1}}).to(t,{ease:"none",startAt:{filter:"contrast(100%) blur(0px)"},filter:"contrast(10%) blur(10px)"},0)}))}
	function initServicesGallery(e=document){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const t=e.querySelectorAll(".infinite-gallery");t.length&&t.forEach((e=>{const t=e.querySelector(".infinite-gallery-wrapper");if(!t||t.__inited)return;t.__inited=!0,e.setAttribute("data-armed","0");const r=Array.from(t.querySelectorAll(".service-visual-wrapper"));if(!r.length)return void e.setAttribute("data-armed","1");e.setAttribute("data-armed","measure");const i=new Set;let a=0,n=0,s=!1,l=0;const o="right"===(e.dataset.direction||"left").toLowerCase(),d=Number.parseFloat(e.dataset.speed)||.6,c=e=>(e.getBoundingClientRect().width||0)+(()=>{const e=parseFloat(getComputedStyle(t).gap||"0");return Number.isFinite(e)?e:0})();function h(){r.forEach((e=>{const r=e.dataset.key||"",a=+e.dataset.targetH||0,n=e.cloneNode(!0);n.setAttribute("data-clone","1"),n.dataset.key=r,n.style.minWidth=e.style.minWidth,n.style.maxWidth=e.style.maxWidth,n.style.height=i.has(r)?a+"px":"0px",n.style.overflow="hidden",t.appendChild(n)}))}function u(){let e=0;return t.childNodes.forEach((t=>{1===t.nodeType&&(e+=c(t))})),e}function m(){Array.from(t.querySelectorAll(".service-visual-wrapper[data-clone]")).forEach((e=>e.remove())),r.forEach(((e,t)=>{e.style.height="";const r=e.getBoundingClientRect().width||e.offsetWidth||0,a=parseFloat(getComputedStyle(e).height)||e.getBoundingClientRect().height||0,n=String(t);e.dataset.key=n,e.dataset.targetH=String(Math.max(0,a)),e.style.minWidth=r+"px",e.style.maxWidth=r+"px",e.style.overflow="hidden",i.has(n)?(e.style.height="",e.dataset.revealed="1",e.dataset.revealing=""):(e.style.height="0px",e.dataset.revealed="0",e.dataset.revealing="")})),h(),h();let e=0;for(;u()<3*t.clientWidth&&e++<8;)h()}function g(e){if(!s)return void cancelAnimationFrame(n);if(e-l<80)return void(n=requestAnimationFrame(g));l=e||performance.now();const r=window.innerWidth||document.documentElement.clientWidth||0,a=-.05*r,o=1.05*r,d=Array.from(t.querySelectorAll(".service-visual-wrapper:not([data-clone])")).filter((e=>{const t=e.getBoundingClientRect();return t.right>a&&t.left<o})).filter((e=>"1"!==e.dataset.revealed&&"1"!==e.dataset.revealing)).sort(((e,t)=>e.getBoundingClientRect().left-t.getBoundingClientRect().left));if(d.length){const e=gsap.timeline();d.forEach(((r,a)=>{const n=+r.dataset.targetH||0,s=r.dataset.key||"";r.dataset.revealing="1",e.to(r,{height:n,duration:.9,ease:"power2.out",onComplete:()=>{r.style.height="",r.dataset.revealed="1",r.dataset.revealing="",i.add(s),t.querySelectorAll(`.service-visual-wrapper[data-clone][data-key="${s}"]`).forEach((e=>e.style.height=n+"px"))}},.12*a)}))}n=requestAnimationFrame(g)}m(),e.setAttribute("data-armed","1");const f=new IntersectionObserver((t=>{t.forEach((t=>{t.target===e&&(t.isIntersecting?s||(s=!0,cancelAnimationFrame(n),n=requestAnimationFrame(g)):(s=!1,cancelAnimationFrame(n)))}))}),{root:null,threshold:0,rootMargin:"0px 0px -5% 0px"});f.observe(e),CoreUtilities.Observers.addDom(f),CoreUtilities.Observers.addDom({disconnect(){s=!1,cancelAnimationFrame(n)}});const p=o?-1:1,y=60*d,v=(e,r)=>{a-=p*y*((r||16.6667)/1e3);let i=t.firstElementChild,n=0;for(;i&&a<-c(i)&&n++<50;)a+=c(i),t.appendChild(i),i=t.firstElementChild;let s=t.lastElementChild;for(n=0;s&&a>0&&n++<50;)a-=c(s),t.insertBefore(s,t.firstElementChild),s=t.lastElementChild;gsap.set(t,{x:a});const l=(window.innerWidth||0)/2;t.querySelectorAll(".service-visual").forEach((e=>{const t=e.closest(".service-visual-wrapper");if(!t)return;const r=t.getBoundingClientRect(),i=(l-(r.left+r.width/2))/(window.innerWidth||1);e.style.setProperty("--drift",40*i+"px")}))};gsap.ticker.add(v),CoreUtilities.Observers.addTicker(v);const w=new ResizeObserver((()=>{m(),i.forEach((e=>{const i=r.find((t=>t.dataset.key===e)),a=i&&+i.dataset.targetH||0;t.querySelectorAll(`.service-visual-wrapper[data-clone][data-key="${e}"]`).forEach((e=>e.style.height=a+"px"))}))}));w.observe(t),CoreUtilities.Observers.addDom(w)}))}

// Page: Case Studies
	function initCaseStudyBackgroundScroll(o){const r=o.closest(".barba-container"),e=o.querySelector(".cs-details"),t=o.querySelector(".cs-morework");if(!r||!e||!t)return;const a=getComputedStyle(r).backgroundColor,n="var(--colors--background)";ScrollTrigger.create({trigger:e,start:"top bottom-=15%",onEnter:()=>gsap.to(r,{backgroundColor:n,duration:.6,ease:"power1.inOut"}),onLeaveBack:()=>gsap.to(r,{backgroundColor:a,duration:.6,ease:"power1.inOut"})}),ScrollTrigger.create({trigger:t,start:"top bottom-=15%",onEnter:()=>gsap.to(r,{backgroundColor:"var(--colors--border)",duration:.6,ease:"power1.inOut"}),onLeaveBack:()=>gsap.to(r,{backgroundColor:n,duration:.6,ease:"power1.inOut"})})}
	function initDynamicPortraitColumns(e=document){const t=Array.from(e.querySelectorAll(".cs-gallery-inner"));if(!t.length)return;const r=e=>{if(e.naturalWidth>0&&e.naturalHeight>0)return e.naturalHeight/e.naturalWidth;const t=(e=>{const t=parseInt(e.getAttribute("width"),10),r=parseInt(e.getAttribute("height"),10);return t>0&&r>0?r/t:null})(e);if(t)return t;const r=e.clientWidth,n=e.clientHeight;return r>0&&n>0?n/r:null};let n=0;const i=e=>{cancelAnimationFrame(n),n=requestAnimationFrame((()=>{e()}))},o=()=>{if(t.forEach((e=>{e.style.removeProperty("width"),e.classList.remove("is-portrait","is-paired")})),!(window.innerWidth>=1024))return;const e=t.map((e=>e.querySelector("img"))).filter(Boolean).map((e=>{const t=r(e),n=!!t&&t>1;return n&&e.closest(".cs-gallery-inner")?.classList.add("is-portrait"),n}));for(let r=0;r<t.length-1;r++)e[r]&&e[r+1]&&([t[r],t[r+1]].forEach((e=>{e.style.width="calc(50% - 0.5rem)",e.classList.add("is-paired")})),r+=1)},s=t.map((e=>e.querySelector("img"))).filter(Boolean);if(!s.length)return;Promise.all(s.map((e=>{const t=()=>e.naturalWidth>0&&e.naturalHeight>0;if(t())return Promise.resolve();const r="function"==typeof e.decode?e.decode().catch((()=>{})):Promise.resolve(),n=new Promise((e=>{let r=0;const n=()=>t()?e():(r+=50,r>=3e3?e():void setTimeout(n,50));n()})),i=new Promise((t=>{const r=()=>{e.removeEventListener("load",r),t()};e.addEventListener("load",r,{once:!0})}));return Promise.race([r,n,i])}))).then((()=>{i(o)}));const a=new ResizeObserver((()=>i(o)));s.forEach((e=>a.observe(e)));const c=()=>i(o);window.addEventListener("resize",c,{passive:!0});const l=new MutationObserver((()=>{document.body.contains(e)||(a.disconnect(),window.removeEventListener("resize",c),l.disconnect())}));l.observe(document.body,{childList:!0,subtree:!0})}
	
// Page Entry Animations
	function animateSelectedEntries(e=document){const t=e.querySelector(".selected-container"),r=t?.querySelector(".selected-content"),o=Array.from(e.querySelectorAll(".selected-item-outer")),l=gsap.timeline();if(!t||!r||!o.length)return l;o.forEach((e=>{if(e.__entryDone)return;const t=e.querySelector(".selected-visual"),r=e.querySelector(".selected-item-header .headline-m"),o=e.querySelector(".selected-item-details"),l=e.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:0,transformOrigin:"bottom center",opacity:0}),r&&gsap.set(r,{opacity:0}),o&&gsap.set(o,{opacity:0,height:0}),l.length&&gsap.set(l,{opacity:0,y:20,filter:"blur(10px)"})}));return(e=>{const o=()=>{requestAnimationFrame((()=>requestAnimationFrame(e)))};if(t.hasAttribute("data-loop-ready"))return o();const l=()=>{r.removeEventListener("selected:loop-ready",l,!0),o()};r.addEventListener("selected:loop-ready",l,!0),setTimeout((()=>{r.removeEventListener("selected:loop-ready",l,!0),o()}),600)})((()=>{const e=window.innerWidth||document.documentElement.clientWidth,t=window.innerHeight||document.documentElement.clientHeight,r=o.map((r=>{const o=r.getBoundingClientRect();return{o:r,r:o,area:Math.max(0,Math.min(o.right,e)-Math.max(o.left,0))*Math.max(0,Math.min(o.bottom,t)-Math.max(o.top,0)),center:.5*(o.left+o.right)}}));let a=r.filter((e=>e.area>1)).sort(((e,t)=>e.r.left-t.r.left));if(!a.length){const t=.5*e;a=r.slice().sort(((e,r)=>Math.abs(e.center-t)-Math.abs(r.center-t))).slice(0,2).sort(((e,t)=>e.r.left-t.r.left))}const n=new Set(a.map((e=>e.o)));r.forEach((e=>{if(e.o.__entryDone||n.has(e.o))return;const t=e.o.querySelector(".selected-visual"),r=e.o.querySelector(".selected-item-header .headline-m"),o=e.o.querySelector(".selected-item-details"),l=e.o.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:1,opacity:1}),r&&gsap.set(r,{opacity:1}),o&&gsap.set(o,{opacity:1,height:"auto"}),l.length&&gsap.set(l,{opacity:1,y:0,filter:"blur(0px)"}),e.o.__entryDone=!0}));a.forEach(((e,t)=>{const r=e.o;if(r.__entryDone)return;const o=r.querySelector(".selected-visual"),a=r.querySelector(".selected-item-header .headline-m"),n=r.querySelector(".selected-item-details"),i=r.querySelectorAll(".selected-item-details .body-s"),s=.15*t;o&&l.set(o,{opacity:1},s).to(o,{scaleY:1,duration:.8,ease:"power2.out"},s),a&&l.set(a,{opacity:1},s+.2).call((()=>{if(a.__splitRun)return;a.__splitRun=!0;const e=splitAndMask(a);gsap.delayedCall(.15,(()=>{animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,a)))}))}),null,s+.2),n&&l.to(n,{opacity:1,height:"auto",duration:.4,ease:"power2.out"},s+.6),i.length&&l.to(i,{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"power2.out",stagger:.15},s+.6),r.__entryDone=!0}))})),l}
	function animateCapabilitiesEntry(t,{delayHero:e=!1}={}){const a=gsap.timeline(),o=t.querySelector(".section-table-of-contents");o&&gsap.set(o,{autoAlpha:0});const r=t.querySelector(".approach-mask");r&&(gsap.set(r,{scale:0,transformOrigin:"0% 100%",willChange:"transform"}),a.to(r,{scale:1,duration:1.2,ease:"power2.out"},0));const l=t.querySelector(".section-hero .headline-lg");if(l){gsap.set(l,{autoAlpha:0});const n=e?0.2:0;a.addLabel("heroStart",n).set(l,{autoAlpha:1},"heroStart").call(()=>{const s=splitAndMask(l);animateLines(s.lines).eventCallback("onComplete",()=>safelyRevertSplit(s,l))},null,"heroStart")}const n=t.querySelector(".section-hero .button-primary");n&&(gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),a.fromTo(n,{autoAlpha:0,y:20,filter:"blur(10px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"heroStart+=0.4"));const s=gsap.utils.toArray(t.querySelectorAll(".table-of-contents-item"));return s.length&&a.from(s,{autoAlpha:0,paddingTop:"6rem",paddingBottom:"6rem",duration:1,ease:"power2.out",stagger:.15},0),o&&a.to(o,{autoAlpha:1,duration:.6,ease:"power2.out"},0),a}
	function animateInfoEntry(e){const t=gsap.timeline(),a=e.querySelectorAll(".section-scroll-track .w-layout-cell"),o=e.querySelector(".section-hero .subpage-intro h1"),l=e.querySelector(".section-hero .subpage-intro a");if(a.forEach((e=>gsap.set(e,{scaleY:0,transformOrigin:"bottom center"}))),t.to(a,{scaleY:1,duration:1,ease:"power2.out",stagger:{each:.15,from:"start"}},0),o){gsap.set(o,{autoAlpha:0});const e=splitAndMask(o);t.set(o,{autoAlpha:1},.35).call((()=>animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,o)))),null,.35)}return l&&(gsap.set(l,{autoAlpha:0,y:20,filter:"blur(10px)"}),t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},.6)),t}
	function animateCaseStudyEntry(e){const t=gsap.timeline(),l=e.querySelector(".cs-hero-image"),a=e.querySelector(".cs-headline"),n=e.querySelectorAll(".cs-titles-inner div");return l&&gsap.set(l,{autoAlpha:0,y:80,filter:"blur(10px)"}),a&&gsap.set(a,{autoAlpha:0}),n.length&&gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),l&&t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},0),a&&t.addLabel("headline",.35).set(a,{autoAlpha:1,display:"block"},"headline").call((()=>{const e=splitAndMask(a);animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,a)))}),null,"headline"),n.length&&t.to(n,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out",stagger:.05},.6),t}
	

	!function(){
		function boot() {
			ScrollState.init({ maxAgeMs: 30 * 60 * 1000 });
			NavigationManager.init({ debug: DEBUG });
			NavigationManager.ensureBarbaClickRouting();
			DebugCore.install();
			EntryOrchestrator.init();
		}
		if (document.readyState !== "loading") boot();
		else document.addEventListener("DOMContentLoaded", boot, { once: true });
	}();

// Run All Initialisers
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
		if (window.matchMedia('(pointer:fine)').matches) {
			const _destroy = initCustomCursor(root);
			CoreUtilities.Cursor.setDestroy(_destroy);
		}
	}


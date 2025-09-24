// Theme Switch
	function initTheme(){const t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)}initTheme();

// GSAP
	gsap.registerPlugin(ScrollTrigger,Flip,SplitText,TextPlugin,Observer);
	const DEBUG = false; if (DEBUG && window.ScrollTrigger) { ScrollTrigger.config({ log: true }); }

// Helpers
	let _gsapObservers=[],_activeTickers=[];function registerGsapObserver(e){return _gsapObservers.push(e),e}function registerTicker(e){return _activeTickers.push(e),e}let _activeObservers=[];function registerObserver(e){return _activeObservers.push(e),e}
	function resetWebflow(t){const e=(new DOMParser).parseFromString(t.next.html,"text/html"),a=e.querySelector("html").getAttribute("data-wf-page"),o=e.querySelector("script[data-wf-site-data]")?.textContent;if(document.documentElement.setAttribute("data-wf-page",a),document.querySelectorAll("script[data-wf-site-data]").forEach((t=>t.remove())),o){const t=document.createElement("script");t.type="application/json",t.setAttribute("data-wf-site-data",""),t.textContent=o,document.head.appendChild(t)}window.Webflow?.destroy?.(),window.Webflow?.ready?.();const n=Webflow.require?.("ix2");n?.init()}
	function destroyAllYourInits(){try{if(window.ScrollTrigger)ScrollTrigger.getAll().forEach(e=>e.kill())}catch(e){}if(window.Observer&&Observer.getAll)try{Observer.getAll().forEach(e=>e.kill())}catch(e){}try{Array.isArray(window._gsapObservers)&&(window._gsapObservers.forEach(e=>{try{e.kill&&e.kill()}catch(e){}}),window._gsapObservers=[])}catch(e){}try{Array.isArray(window._activeTickers)&&(window._activeTickers.forEach(e=>{try{gsap.ticker.remove(e)}catch(e){}}),window._activeTickers=[])}catch(e){}try{Array.isArray(window._activeObservers)&&(window._activeObservers.forEach(e=>{try{e.disconnect&&e.disconnect()}catch(e){}}),window._activeObservers=[])}catch(e){}try{const e=window.__cursorState;e&&(window.removeEventListener("resize",e.onResize),document.removeEventListener("mousemove",e.onMove),document.removeEventListener("pointerover",e.onOver),document.removeEventListener("pointerout",e.onOut),cancelAnimationFrame(e.rafDraw),cancelAnimationFrame(e.rafFollow),cancelAnimationFrame(e.rafIdle),clearTimeout(e.idleTimeout)),window.__cursorState=null,window.__cursorInited=!1}catch(e){}try{const e=document.querySelector("canvas.cursor-webgl");e&&e.remove()}catch(e){}try{const e=document.querySelector(".custom-cursor");e&&e.remove()}catch(e){}}
	function runSafeInit(e,{preserveServicePins:r=!1}={}){return new Promise((i=>{const n=async()=>{window.ScrollTrigger&&ScrollTrigger.getAll().forEach((e=>{r&&e.trigger?.classList?.contains("section-single-service")||e.kill()})),_activeObservers.forEach((e=>{"function"==typeof e.disconnect&&e.disconnect()})),_activeObservers=[],initAllYourInits(e),await new Promise((e=>requestAnimationFrame(e))),await new Promise((e=>requestAnimationFrame(e))),ScrollTrigger.refresh(),i()};/^((?!chrome|android).)*safari/i.test(navigator.userAgent)?requestAnimationFrame(n):document.fonts&&document.fonts.ready?document.fonts.ready.then((()=>{requestAnimationFrame((()=>{requestAnimationFrame((()=>{"requestIdleCallback"in window?requestIdleCallback(n):setTimeout(n,0)}))}))})):setTimeout(n,600)}))}
	function reinitWebflowModules(){if(window.Webflow&&Webflow.require){try{Webflow.ready&&Webflow.ready()}catch(e){}try{const e=Webflow.require("tabs");e&&"function"==typeof e.ready&&e.ready()}catch(e){}}}
	function isSlowConnection() { const nav = navigator.connection || {};	return nav.effectiveType && nav.effectiveType !== "4g"; }
	function isReload() { const entries = performance.getEntriesByType("navigation"); return entries.length ? entries[0].type === "reload" : performance.navigation?.type === 1; }
	function shouldShowPreloader() {
		// return isSlowConnection() || isReload() || !sessionStorage.getItem("preloaderSeen");
		return false;
	}

// Functions
	function splitAndMask(e){if(e._originalHTML||(e._originalHTML=e.innerHTML),e._split)return e._split;const t=getComputedStyle(e).whiteSpace||"normal",i=e.style.whiteSpace,l=e.style.display;e.style.whiteSpace=t,"inline"===getComputedStyle(e).display&&(e.style.display="block"),e.clientWidth;const s=new SplitText(e,{type:"lines",linesClass:"line",reduceWhiteSpace:!1});return s.lines.forEach((e=>{const i=e.getBoundingClientRect().height||e.offsetHeight||0,l=document.createElement("div");l.className="text-mask",l.style.overflow="hidden",l.style.display="block",l.style.height=i+"px",e.style.whiteSpace=t,e.style.display="block",e.parentNode.insertBefore(l,e),l.appendChild(e)})),gsap.set(s.lines,{yPercent:100,rotation:10,transformOrigin:"0 10%",willChange:"transform,opacity"}),e.style.whiteSpace=i,e.style.display=l,s}
	function safelyRevertSplit(e,i){e&&i&&(e.revert(),i._originalHTML&&(i.innerHTML=i._originalHTML,delete i._originalHTML),delete i._split)}
	function animateLines(t){return gsap.set(t,{transformOrigin:"0 10%",rotation:10,yPercent:100,willChange:"transform, opacity"}),gsap.to(t,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08})}
	function triggerTAOne(e){const n=splitAndMask(e);requestAnimationFrame((()=>{animateLines(n.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(n,e)}))}))}
	function initTextAnimationOne(e=document,t=".ta-one"){e.querySelectorAll(t).forEach((e=>{gsap.set(e,{autoAlpha:0}),safelyRevertSplit(e._split,e)}));const r=registerObserver(new IntersectionObserver(((e,t)=>{e.forEach((e=>{if(!e.isIntersecting)return;const r=e.target;gsap.set(r,{autoAlpha:1}),triggerTAOne(r),t.unobserve(r)}))}),{root:null,rootMargin:"0px 0px -5% 0px",threshold:0}));e.querySelectorAll(t).forEach((e=>{r.observe(e);const t=e.getBoundingClientRect();t.top<window.innerHeight&&t.bottom>0&&(gsap.set(e,{autoAlpha:1}),triggerTAOne(e),r.unobserve(e))})),e.querySelectorAll(".w-tab-pane").forEach((e=>{registerObserver(new MutationObserver((()=>{e.classList.contains("w--tab-active")&&e.querySelectorAll(t).forEach((e=>{gsap.set(e,{autoAlpha:0}),safelyRevertSplit(e._split,e),r.observe(e);const t=e.getBoundingClientRect();t.top<window.innerHeight&&t.bottom>0&&(gsap.set(e,{autoAlpha:1}),triggerTAOne(e),r.unobserve(e))}))}))).observe(e,{attributes:!0,attributeFilter:["class"]})}))}
	function initReparentChildren(t=document){t.querySelectorAll("[data-child]").forEach((e=>{if(e.matches(".w-tab-link, .w-tab-pane")||e.closest(".w-tabs"))return;const a=e.getAttribute("data-child");let n=t.querySelector(`[data-parent="${a}"]`);n||t===document||(n=document.querySelector(`[data-parent="${a}"]`)),n&&n.appendChild(e)}))}
	function markTabLinksForBarba(a=document){a.querySelectorAll(".w-tab-link").forEach((a=>{a.setAttribute("data-barba-prevent","all")}))}
	function initLinkMappings(e=document){const r=[{triggerId:"selectedOpen",targetId:"selected"},{triggerId:"archiveOpen",targetId:"archive"},{triggerId:"resourcesOpen",targetId:"resources"},{triggerId:"resourcesOpenShortcut",targetId:"resources"}];for(let e=1;e<=4;e++)r.push({triggerId:`recommendationsOpen${e}`,targetId:"recommendations"});r.forEach((({triggerId:r,targetId:t})=>{const c=e.querySelector(`#${r}`),n=e.querySelector(`#${t}`);if (c && n && !c.classList.contains("w-tab-link")){c.addEventListener("click",e=>{e.preventDefault();n.click();});}}))}
	function initSelectedWorkLoop(e=document){const t=e.querySelector(".selected-container"),n=t?.querySelector(".selected-content");if(!t||!n)return;if(t.__selectedLoopInited)return;t.__selectedLoopInited=!0;const o=Array.from(n.querySelectorAll(".selected-item-outer"));if(!o.length)return;n.style.justifyContent="center",n.style.transform="translateZ(0)";const r=e=>e.offsetWidth+(e=>(parseFloat(getComputedStyle(e).marginLeft)||0)+(parseFloat(getComputedStyle(e).marginRight)||0))(e),a=()=>{const e=Math.max(document.documentElement.clientWidth,window.innerWidth||0);return Math.round(e*(window.matchMedia("(max-width: 767px)").matches?.78:.28))};function l(e){Array.from(n.querySelectorAll(".selected-item-outer")).forEach((t=>{t._baseW=e,t.style.width=e+"px"}))}function s(){let e=0;return Array.from(n.children).forEach((t=>{1===t.nodeType&&(e+=r(t))})),e}function i(){o.forEach((e=>{const t=e.cloneNode(!0);t.setAttribute("data-clone","true"),n.appendChild(t)}))}function c(){const e=Array.from(n.children).filter((e=>1===e.nodeType)),o=Math.floor(e.length/2);let a=0;for(let t=0;t<o;t++)a+=r(e[t]);const l=r(e[o]);h=-(a+.5*l-.5*t.clientWidth),gsap.set(n,{x:h})}function d(){t.hasAttribute("data-loop-ready")||(t.setAttribute("data-loop-ready","1"),n.dispatchEvent(new CustomEvent("selected:loop-ready",{bubbles:!0})))}!function(){Array.from(n.children).forEach((e=>1===e.nodeType&&e.hasAttribute("data-clone")&&e.remove())),l(a()),i(),i();const e=3*t.clientWidth;let o=0;for(;s()<e&&o++<8;)i();l(a())}();let h=0,u=0,f=1;const p={t:0},m=gsap.quickTo(p,"t",{duration:.45,ease:"power3.out",onUpdate:y});function y(){Array.from(n.querySelectorAll(".selected-item-outer")).forEach((e=>{const t=e._baseW||a();e.style.width=t*(1+p.t)+"px"}))}let b=!1;const w=t.closest(".w-tab-pane");gsap.ticker.add(((e,t)=>{if(w&&!w.classList.contains("w--tab-active"))return;const o=t/16.6667,a=u+1*f;h-=a*o;let l=n.firstElementChild,s=0;for(;l&&h<-r(l);){const e=r(l);if(h+=e,n.appendChild(l),l=n.firstElementChild,++s>50)break}let i=n.lastElementChild;for(s=0;i&&h>0;){const e=r(i);if(h-=e,n.insertBefore(i,n.firstElementChild),i=n.lastElementChild,++s>50)break}gsap.set(n,{x:h});const c=Math.min(1,Math.abs(a)/70);m((a>=0?.14:-.1)*c),Math.abs(a)<3&&Math.abs(p.t)>.002&&!b&&(b=!0,gsap.to(p,{t:0,duration:1.1,ease:"elastic.out(0.62,0.32)",onUpdate:y})),Math.abs(a)>=3&&(b=!1);const d=n.querySelectorAll(".selected-item-visual");if(d.length){const e=.5*window.innerWidth,t=.5+.5*c;d.forEach((n=>{const o=n.closest(".selected-visual");if(!o)return;const r=o.getBoundingClientRect(),a=(e-(r.left+.5*r.width))/window.innerWidth;n.style.setProperty("--drift",80*a*t+"px")}))}u*=Math.pow(.94,o),Math.abs(u)<.01&&(u=0)})),Observer.create({target:n,type:"wheel,touch",wheelSpeed:1,tolerance:6,onChange(e){const t=Math.abs(e.deltaX)>=Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(!t)return;const n=e.event.type.includes("touch")?.34:.08;u+=t*n,u=gsap.utils.clamp(-70,70,u),f=t>0?1:-1}}),c(),d();let g=0;new ResizeObserver((()=>{cancelAnimationFrame(g),g=requestAnimationFrame((()=>{l(a()),y(),c(),d()}))})).observe(t)}
	function initOverscrollBehavior(e=document){const r=Array.from(e.querySelectorAll(".w-tab-pane")),t=(()=>{let e=0;return()=>{cancelAnimationFrame(e),e=requestAnimationFrame((()=>{requestAnimationFrame((()=>{ScrollTrigger?.refresh(!0)}))}))}})(),o=new MutationObserver((()=>{e.querySelector(".wrapper-selected-work.w--tab-active")?document.body.style.overscrollBehavior="none":document.body.style.overscrollBehavior="",t()}));r.forEach((e=>o.observe(e,{attributes:!0,attributeFilter:["class"]}))),e.querySelector(".wrapper-selected-work.w--tab-active")&&(document.body.style.overscrollBehavior="none"),registerObserver(o)}
	function initCounters(e=document){[{id:"work-counter-selected",selector:".selected-item-outer"},{id:"work-counter-archive",selector:".list-item-archive-project"},{id:"work-counter-resources",selector:".list-item-resource"},{id:"archive-results-counter",selector:".list-item-archive-project"}].forEach((({id:t,selector:r})=>{const o=e.querySelector(`#${t}`);if(!o)return;const c=e.querySelectorAll(r).length;if("archive-results-counter"===t){const e=o.textContent||"",t={value:parseInt(e.replace(/\D/g,""),10)||0};gsap.to(t,{value:c,duration:.5,ease:"power1.out",onUpdate:()=>{o.textContent=Math.round(t.value)}})}else o.textContent=`(${c})`}))}
	function openFirstArchiveProject(e=document){e.querySelectorAll(".list-item-archive-project.open").forEach((e=>e.classList.remove("open")));const t=Array.from(e.querySelectorAll(".list-item-archive-project")).find((e=>null!==e.offsetParent));t&&(t.classList.add("open"),requestAnimationFrame((()=>{["scroll","resize"].forEach((e=>{window.dispatchEvent(new Event(e,{bubbles:!0})),document.documentElement.dispatchEvent(new Event(e,{bubbles:!0})),document.body.dispatchEvent(new Event(e,{bubbles:!0}))})),[document.documentElement,document.body].forEach((e=>{e.scrollTop+=2,e.scrollTop-=2}))})))}
	function initArchiveFilters(e=document){const t=Array.from(e.querySelectorAll(".filters-tab")),r=Array.from(e.querySelectorAll(".list-item-archive-project")),a=Array.from(e.querySelectorAll("[id^='nav-archive-filter-']"));r.forEach((e=>{e._catsNorm||(e._catsNorm=Array.from(e.querySelectorAll(".archive-categories .cms-categories")).map((e=>e.textContent.trim().toLowerCase().replace(/[\W_]+/g,""))))}));const o=e=>"all"===e?r.length:r.filter((t=>t._catsNorm.includes(e))).length;function c(t,a=!0){const o=e.querySelector("#archive-results-counter");if(!o)return;const c=parseInt(o.textContent?.replace(/\D/g,""),10)||0;r.forEach((e=>{e.style.display="all"===t||e._catsNorm.includes(t)?"":"none"}));const l=r.filter((e=>"none"!==e.style.display)),i=l.length;if(gsap.to({v:c},{v:i,duration:a?.5:.01,ease:"power1.out",onUpdate:function(){o.textContent=Math.round(this.targets()[0].v)}}),!l.length)return;if(a){const e=gsap.timeline();e.set(l,{y:100,opacity:0,filter:"blur(0px)",willChange:"transform,opacity"}),e.to(l,{y:0,opacity:1,duration:.6,ease:"power2.out",stagger:.12})}else gsap.set(l,{y:0,opacity:1,filter:"blur(0px)"});const s=l.find((e=>null!==e.offsetParent));e.querySelectorAll(".list-item-archive-project.open").forEach((e=>e.classList.remove("open"))),s&&s.classList.add("open")}t.forEach((e=>{const t=e.id.replace("archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),r=e.querySelector(".filters-counter");r&&(r.textContent=`(${o(t)})`)})),a.forEach((e=>{const t=e.querySelector(".nav-counter-filters"),r=e.id.replace("nav-archive-filter-","").toLowerCase().replace(/[\W_]+/g,"");t&&(t.textContent=`(${o(r)})`)})),t.forEach((e=>{e.addEventListener("click",(r=>{r.preventDefault(),t.forEach((e=>e.classList.remove("active"))),e.classList.add("active");c(e.id.replace("archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),!0)}))}));const l=e.querySelector("#archive-filter-all");l&&l.classList.add("active");const i=e.querySelector('.w-tab-pane[data-w-tab="Archive"]');let s=!1;const n=new MutationObserver((()=>{i&&i.classList.contains("w--tab-active")&&(s||(s=!0,c("all",!0)))}));i&&n.observe(i,{attributes:!0,attributeFilter:["class"]}),registerObserver(n),c("all",!1);const u=Array.from(e.querySelectorAll(".list-item-archive-project img")).slice(0,12);("requestIdleCallback"in window?window.requestIdleCallback:e=>setTimeout(e,0))((()=>{u.forEach((e=>{e&&e.decode&&e.decode().catch((()=>{}))}))}))}
	function initMenuNavigation(e=document){e.querySelectorAll(".nav-primary-wrap").forEach((e=>{const t=e.querySelector(".nav-button-menu"),n=e.querySelector(".nav-button-text"),o=e.querySelector(".phone-number"),l=e.querySelectorAll(".button-minimal-darkmode"),r=e.querySelectorAll(".menu-link"),a=e.querySelector(".ta-one-menu");if(!(t&&n&&o&&l.length&&r.length&&a))return;let i;n.dataset.orig=n.textContent;const u=gsap.timeline({paused:!0}).call((()=>{i=splitAndMask(a),animateLines(i.lines).eventCallback("onComplete",(()=>{safelyRevertSplit(i,a),i=null}))}),null,0).from(o,{opacity:0,duration:.5},">").from(l,{opacity:0,duration:.5,stagger:.2},"<").from(r,{opacity:0,yPercent:240,duration:.5,stagger:.2},"<").to(n,{text:"Close",duration:.3},"<");u.eventCallback("onReverseComplete",(()=>{n.textContent=n.dataset.orig})),e._menuTimeline=u,e._menuButton=t}))}
	function initFilterNavigation(e=document){e.querySelectorAll(".nav-primary-wrap").forEach((t=>{const r=t.querySelector(".nav-button-filter"),i=t.querySelector(".filters-container"),o=t.querySelectorAll(".filter-tuner"),a=t.querySelector(".filter-line-1"),n=t.querySelector(".filter-line-2"),l=t.querySelector(".modal-filters-caption"),c=t.querySelectorAll(".modal-filters-item"),s=e.querySelector(".menu-filter-hover"),u=e.querySelectorAll(".menu-filter-image");if(!r||!i||!c.length)return;function d(){e.querySelector(".archive-tab.w--tab-active")?(r.style.display="flex",gsap.to(r,{opacity:1,duration:.2})):gsap.to(r,{opacity:0,duration:.2,onComplete:()=>r.style.display="none"})}d();const p=registerObserver(new MutationObserver(d));if(e.querySelectorAll(".archive-tab, .archive-tab-link").forEach((e=>p.observe(e,{attributes:!0,attributeFilter:["class"]}))),e.querySelectorAll("#archiveOpen, .archive-tab-link").forEach((e=>e.addEventListener("click",(()=>setTimeout(d,50))))),s&&u.length){gsap.set(s,{xPercent:-50,yPercent:-50,scale:0});const e=gsap.quickTo(s,"x",{duration:2.6,ease:"expo"}),t=gsap.quickTo(s,"y",{duration:2.6,ease:"expo"});window.addEventListener("mousemove",(r=>{e(r.pageX),t(r.pageY)}));const r=gsap.timeline({paused:!0}).to(s,{scale:1,opacity:1,rotation:0,duration:.5,ease:"power1.inOut"});c.forEach(((e,t)=>{e.addEventListener("mouseover",(()=>{u[t]?.classList.add("active"),r.play()})),e.addEventListener("mouseout",(()=>{r.reverse(),u[t]?.classList.remove("active")}))}))}const v=gsap.timeline({paused:!0}).to(i,{opacity:1,duration:.4,ease:"power2.out"},0).to(o,{opacity:0,duration:.15},"<").to(a,{rotation:45,transformOrigin:"center",duration:.35},"<").to(n,{rotation:-45,marginTop:"-4px",transformOrigin:"center",duration:.35},"<").from(l,{opacity:0,duration:.5},"<").from(c,{opacity:0,duration:.8,stagger:.2},"<");c.forEach((e=>{e.addEventListener("click",(t=>{t.preventDefault();const r=e.id.replace("nav-archive-filter-",""),i=document.getElementById(`archive-filter-${r}`);i&&i.click(),v.timeScale(3).reverse()}))})),t._filterTimeline=v,t._filterButton=r}))}
	function initNavigationTriggers(e=document){e.querySelectorAll(".nav-primary-wrap").forEach((e=>{const l=e._menuButton,t=e._filterButton,n=e._menuTimeline,o=e._filterTimeline,i=e.querySelector(".menu-wrapper"),r=e.querySelector(".menu-container"),a=e.querySelector(".filters-container");let s=null;function y(){r.style.display="none",i.style.display="none",document.body.style.overflow="",s=null}function d(){a.style.display="none",i.style.display="none",document.body.style.overflow="",s=null}n.eventCallback("onReverseComplete",y),o.eventCallback("onReverseComplete",d),l.addEventListener("click",(()=>{if("filter"===s)return o.timeScale(2).reverse(),void o.eventCallback("onReverseComplete",(()=>{d(),s="menu",document.body.style.overflow="hidden",i.style.display="flex",r.style.display="flex",n.timeScale(1).play(0),o.eventCallback("onReverseComplete",d)}));"menu"!==s?(s="menu",document.body.style.overflow="hidden",i.style.display="flex",r.style.display="flex",n.timeScale(1).play(0)):n.timeScale(2).reverse()})),t.addEventListener("click",(()=>{if("menu"===s)return n.timeScale(2).reverse(),void n.eventCallback("onReverseComplete",(()=>{y(),s="filter",document.body.style.overflow="hidden",i.style.display="flex",a.style.display="flex",o.timeScale(1).play(0),n.eventCallback("onReverseComplete",y)}));"filter"!==s?(s="filter",document.body.style.overflow="hidden",i.style.display="flex",a.style.display="flex",o.timeScale(1).play(0)):o.timeScale(2).reverse()}))}))}
	function initNavigation(root = document) {initMenuNavigation(root);initFilterNavigation(root);initNavigationTriggers(root);}
	function initMenuLinkHover(e=document){window.matchMedia("(hover: hover) and (min-width: 1024px)").matches&&e.querySelectorAll(".menu-link").forEach((e=>{let t=e.querySelector(".menu-link-bg");t||(t=document.createElement("div"),t.classList.add("menu-link-bg"),e.appendChild(t)),e.addEventListener("mouseenter",(n=>{const{top:o,height:i}=e.getBoundingClientRect(),r=n.clientY-o<i/2;t.style.transformOrigin=r?"top center":"bottom center",gsap.to(t,{scaleY:1,duration:.3,ease:"power2.out"})})),e.addEventListener("mouseleave",(n=>{const{top:o,height:i}=e.getBoundingClientRect(),r=n.clientY-o<i/2;t.style.transformOrigin=r?"top center":"bottom center",gsap.to(t,{scaleY:0,duration:.3,ease:"power2.in"})}))}))}
	function fillNavCounters(e=document){const r=Array.from(e.querySelectorAll(".list-item-archive-project")),t=Array.from(e.querySelectorAll('[id^="nav-archive-filter-"]'));r.forEach((e=>{e._catsNorm||(e._catsNorm=Array.from(e.querySelectorAll(".archive-categories .cms-categories")).map((e=>e.textContent.trim().toLowerCase().replace(/[\W_]+/g,""))))})),t.forEach((e=>{const t=e.querySelector(".nav-counter-filters");if(!t)return;const o=e.id.replace("nav-archive-filter-","").toLowerCase().replace(/[\W_]+/g,""),c="all"===o?r.length:r.filter((e=>e._catsNorm.includes(o))).length;t.textContent=`(${c})`}))}
	window.initPinnedSections = function initPinnedSections(root = document) {
  const tag = "[initPinnedSections]";
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  console.log(tag, "start", { rootIsDocument: root === document, hasGSAP });

  if (!hasGSAP) {
    console.warn(tag, "GSAP/ScrollTrigger missing — aborting.");
    return;
  }

  // --- SERVICES (Capabilities-style) ---
  const serviceSections = Array.from(root.querySelectorAll(".section-single-service"));
  console.log(tag, "services found:", serviceSections.length);
  serviceSections.forEach((section, i) => {
    const shortPanel = section.offsetHeight < window.innerHeight;
    const st = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: shortPanel ? "top top" : "bottom bottom",
        pin: true,
        pinSpacing: false,
        scrub: 1,
        onToggle: self => console.log(tag, "service toggle", i, self.isActive),
        onRefresh: self => console.log(tag, "service refreshed", i, { start: self.start, end: self.end })
      }
    }).to(section, { ease: "none", startAt: { filter: "contrast(100%) blur(0px)" }, filter: "contrast(10%) blur(10px)" }, 0);
  });

  // --- RESOURCES (inside tab) ---
  const resourcesPane =
    root.querySelector('.w-tab-pane[data-w-tab="Resources"]') ||
    root.querySelector(".wrapper-resources")?.closest(".w-tab-pane") ||
    root.querySelector(".wrapper-resources") || // fallback if not inside Webflow tabs
    null;

  console.log(tag, "resources pane candidate:", resourcesPane);

  if (!resourcesPane) {
    console.warn(tag, "No resources pane/container found. Expected .w-tab-pane[data-w-tab='Resources'] or .wrapper-resources");
    ScrollTrigger.refresh(true);
    return;
  }

  // If it's a Webflow tab pane and not active yet, wait, then build.
  const paneEl = resourcesPane.classList?.contains?.("w-tab-pane") ? resourcesPane : null;
  const paneIsActive = paneEl ? paneEl.classList.contains("w--tab-active") : true;
  console.log(tag, "resources pane active now?", paneIsActive);

  const buildResources = () => {
    if (resourcesPane.__resourcesInited) {
      console.log(tag, "resources already inited → skipping");
      return;
    }
    resourcesPane.__resourcesInited = true;

    const items = Array.from(resourcesPane.querySelectorAll(".section-resources .resource-item, .resource-item"));
    console.log(tag, "resource items found:", items.length, items);

    if (!items.length) {
      console.warn(tag, "No .resource-item found under resources pane");
      return;
    }

    items.forEach((item, idx) => {
      // Ensure overlay exists
      let overlay = item.querySelector(".resource-ovl");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "resource-ovl";
        overlay.style.cssText =
          "position:absolute;inset:0;pointer-events:none;opacity:0;background:rgba(0,0,0,.22);backdrop-filter:blur(0px);-webkit-backdrop-filter:blur(0px);z-index:2;";
        if (getComputedStyle(item).position === "static") item.style.position = "relative";
        item.appendChild(overlay);
        console.log(tag, "overlay injected for item", idx);
      }

      const block = item.querySelector(".resource-block");
      const visual = item.querySelector(".resource-visual");
      const heading = item.querySelector("h2");

      const tl = gsap.timeline({ defaults: { ease: "none" } });
      if (block) tl.fromTo(block, { y: 0 }, { y: -300, duration: 1 }, 0);
      if (visual) tl.fromTo(visual, { y: 0 }, { y: -480, duration: 1 }, 0);
      if (heading) tl.fromTo(heading, { y: 0 }, { y: 20, duration: 1 }, 0);

      tl.set(item, { filter: "contrast(100%) blur(0px)" }, 0)
        .to(item, { filter: "contrast(65%) blur(0px)", duration: 0.85 }, 0)
        .fromTo(
          overlay,
          { opacity: 0, backdropFilter: "blur(0px)", webkitBackdropFilter: "blur(0px)" },
          { opacity: 1, backdropFilter: "blur(12px)", webkitBackdropFilter: "blur(12px)", duration: 0.15 },
          0.85
        );

      const hasNext = !!items[idx + 1];
      const st = ScrollTrigger.create({
        trigger: item,
        start: "top top",
        endTrigger: items[idx + 1] || item,
        end: hasNext ? "top top" : "bottom top",
        scrub: 0.95,
        pin: hasNext,          // pin until next one reaches top
        pinSpacing: hasNext,   // leave spacing so stack effect shows
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: self => console.log(tag, "resource toggle", idx, self.isActive),
        onRefresh: self => console.log(tag, "resource refreshed", idx, { start: self.start, end: self.end })
      });

      console.log(tag, "ScrollTrigger created for resource", idx, st);
    });

    // Images often affect height → refresh after they decode
    const imgs = Array.from(resourcesPane.querySelectorAll("img"));
    const decodePromises = imgs.map(img => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
    Promise.allSettled(decodePromises).then(() => {
      console.log(tag, "images decoded (or ignored) → refreshing ST");
      ScrollTrigger.refresh(true);
      setTimeout(() => ScrollTrigger.refresh(true), 30);
    });

    // Initial refresh just in case
    ScrollTrigger.refresh(true);
    console.log(tag, "resources setup complete. Total ST:", ScrollTrigger.getAll().length);
  };

  if (paneIsActive) {
    console.log(tag, "pane is active → build now");
    // build after a couple rAFs so layout has settled
    requestAnimationFrame(() => requestAnimationFrame(buildResources));
  } else if (paneEl) {
    console.log(tag, "pane not active → attach MutationObserver and wait");
    const mo = new MutationObserver(muts => {
      const becameActive = paneEl.classList.contains("w--tab-active");
      if (becameActive) {
        console.log(tag, "pane became active → building resources");
        mo.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(buildResources));
      }
    });
    mo.observe(paneEl, { attributes: true, attributeFilter: ["class"] });

    // Also wire tab links to force a later refresh
    const tabLink = (root.querySelector('[data-w-tab="Resources"].w-tab-link') ||
                      root.querySelector('.w-tab-link[href="#Resources"]') ||
                      root.querySelector('#resourcesOpen') ||
                      null);
    if (tabLink) {
      tabLink.addEventListener("click", () => {
        console.log(tag, "resources tab link clicked → will refresh after activation");
        setTimeout(() => ScrollTrigger.refresh(true), 60);
      });
    }
  }

  // Final global refresh
  ScrollTrigger.refresh(true);
  console.log(tag, "end — total ScrollTriggers now:", ScrollTrigger.getAll().length);
};











	function initServicesGallery(e=document){const t=e.querySelectorAll(".infinite-gallery");t.length&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&t.forEach((e=>{const t=e.querySelector(".infinite-gallery-wrapper");if(!t||t.__inited)return;t.__inited=!0,e.setAttribute("data-armed","0");const r=Array.from(t.querySelectorAll(".service-visual-wrapper"));if(!r.length)return void e.setAttribute("data-armed","1");e.setAttribute("data-armed","measure");const i=new Set;r.forEach(((e,t)=>{e.style.height="";const r=e.getBoundingClientRect().width,i=parseFloat(getComputedStyle(e).height)||e.getBoundingClientRect().height||0;e.dataset.key=String(t),e.dataset.targetH=String(i),e.style.minWidth=r+"px",e.style.maxWidth=r+"px",e.style.height="0px",e.style.overflow="hidden",e.dataset.revealed="0"}));const a="right"===(e.dataset.direction||"left").toLowerCase(),n=parseFloat(e.dataset.speed)||.6,l=parseFloat(getComputedStyle(t).gap||0)||0,o=e=>e.getBoundingClientRect().width+l;function s(){r.forEach((e=>{const r=e.cloneNode(!0),a=e.dataset.key||"",n=+e.dataset.targetH||0;r.setAttribute("data-clone","1"),r.dataset.key=a,r.style.minWidth=e.style.minWidth,r.style.maxWidth=e.style.maxWidth,r.style.height=i.has(a)?n+"px":"0px",r.style.overflow="hidden",t.appendChild(r)}))}function d(){let e=0;return t.childNodes.forEach((t=>{1===t.nodeType&&(e+=o(t))})),e}function c(){Array.from(t.querySelectorAll(".service-visual-wrapper[data-clone]")).forEach((e=>e.remove())),s(),s();let e=0;for(;d()<3*t.clientWidth&&e++<8;)s()}c(),e.setAttribute("data-armed","1");let h=0,u=!1,g=0;function f(e){if(!u)return void cancelAnimationFrame(h);if(e-g<80)return void(h=requestAnimationFrame(f));g=e||performance.now();const r=window.innerWidth,a=-.05*r,n=1.05*r,l=Array.from(t.querySelectorAll(".service-visual-wrapper")).filter((e=>{const t=e.getBoundingClientRect();return t.right>a&&t.left<n})).filter((e=>"1"!==e.dataset.revealed&&"1"!==e.dataset.revealing)).sort(((e,t)=>e.getBoundingClientRect().left-t.getBoundingClientRect().left));if(l.length){const e=gsap.timeline();l.forEach(((r,a)=>{const n=+r.dataset.targetH||0,l=r.dataset.key||"";r.dataset.revealing="1",e.to(r,{height:n,duration:.9,ease:"power2.out",onComplete:()=>{r.style.height="",r.dataset.revealed="1",r.dataset.revealing="",i.add(l),t.querySelectorAll('.service-visual-wrapper[data-clone][data-key="'+l+'"]').forEach((e=>{e.style.height=n+"px"}))}},.12*a)}))}h=requestAnimationFrame(f)}new IntersectionObserver((t=>{t.forEach((t=>{t.target===e&&(t.isIntersecting?u||(u=!0,cancelAnimationFrame(h),h=requestAnimationFrame(f)):(u=!1,cancelAnimationFrame(h)))}))}),{root:null,threshold:0,rootMargin:"0px 0px -5% 0px"}).observe(e);let p=0,m=a?-1:1,y=60*n;gsap.ticker.add(((e,r)=>{p-=m*y*(r/1e3);let i=t.firstElementChild,a=0;for(;i&&p<-o(i)&&(p+=o(i),t.appendChild(i),i=t.firstElementChild,!(++a>50)););let n=t.lastElementChild;for(a=0;n&&p>0&&(p-=o(n),t.insertBefore(n,t.firstElementChild),n=t.lastElementChild,!(++a>50)););gsap.set(t,{x:p});const l=window.innerWidth/2;t.querySelectorAll(".service-visual").forEach((e=>{const t=e.closest(".service-visual-wrapper");if(!t)return;const r=t.getBoundingClientRect(),i=(l-(r.left+r.width/2))/window.innerWidth;e.style.setProperty("--drift",40*i+"px")}))})),new ResizeObserver((()=>{c()})).observe(t)}))}
	function initAccordions(e=document){const o=e.querySelectorAll(".accordion-list");if(!o.length)return;let t;const i=()=>{clearTimeout(t),t=setTimeout((()=>ScrollTrigger.refresh()),100)};o.forEach((e=>{const o=e.querySelectorAll(".accordion-subservice, .accordion-mindset, .accordion-quote");o.length&&o.forEach((e=>{const t=e.querySelector(".accordion-header"),c=e.querySelector(".cross-line-animating"),r=e.querySelector(".accordion-content"),a=e.querySelector(".accordion-icon-quote"),n=e.classList.contains("accordion-quote");if(!t||!c||!r)return;gsap.set(r,{maxHeight:0,opacity:0,paddingBottom:0,paddingTop:n?0:void 0});const s=gsap.timeline({paused:!0,defaults:{ease:"power2.out"}}).to(t,{paddingTop:"2rem",duration:.4},0).to(c,{rotation:0,duration:.4},0).to(r,{maxHeight:600,opacity:1,paddingBottom:n?"0rem":"2rem",paddingTop:n?"2rem":void 0,duration:.5,onUpdate:i,onComplete:()=>gsap.set(r,{maxHeight:"none"})},0);n&&a&&s.from(a,{opacity:0,duration:.4},0),e._accordionTimeline=s,e.addEventListener("click",(()=>{if(s.isActive())return;const c=t.classList.contains("accordion-active");o.forEach((o=>{if(o!==e){const e=o.querySelector(".accordion-header"),t=o._accordionTimeline;e.classList.contains("accordion-active")&&!t.isActive()&&(e.classList.remove("accordion-active"),t.reverse())}})),c?(gsap.set(r,{maxHeight:r.offsetHeight}),s.eventCallback("onReverseComplete",i),s.reverse()):(gsap.set(r,{maxHeight:0}),s.play()),t.classList.toggle("accordion-active",!c)}))}))}))}
	function initAppearInLine(e=document,t=".appear-in-line",r=":scope > *"){const o=.15,a=.8;e.querySelectorAll(t).forEach((e=>{const t=[],s=[],n=Array.from(e.querySelectorAll(r));e.getBoundingClientRect(),n.forEach((e=>{const r=getComputedStyle(e),o=parseInt(r.columnCount,10)||1,a=e.getBoundingClientRect();if(o>1){const r=new SplitText(e,{type:"lines",linesClass:"split-line"});t.push(r);const n=a.width/o,i=Array.from({length:o},(()=>[]));r.lines.forEach((e=>{const t=e.getBoundingClientRect().left-a.left,r=Math.min(Math.floor(t/n),o-1);i[r].push(e),gsap.set(e,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"})})),i.forEach((e=>s.push(e)))}else gsap.set(e,{y:100,opacity:0,filter:"blur(10px)",willChange:"transform,opacity"}),s.push([e])})),e._appearData={splits:t,groups:s};const i=registerObserver(new IntersectionObserver(((e,t)=>{e.forEach((e=>{if(!e.isIntersecting)return;t.unobserve(e.target);const{splits:r,groups:s}=e.target._appearData;s.forEach(((e,t)=>{gsap.to(e,{y:0,opacity:1,filter:"blur(0px)",duration:a,ease:"power2.out",delay:t*o})}));const n=(s.length-1)*o+a;gsap.delayedCall(n+.05,(()=>{r.forEach((e=>e.revert()))}))}))}),{root:null,rootMargin:"0px 0px -10% 0px",threshold:0}));e._appearObserver=i,i.observe(e);const l=e.getBoundingClientRect();if(l.top<window.innerHeight&&l.bottom>0){i.unobserve(e);const{splits:t,groups:r}=e._appearData;r.forEach(((e,t)=>{gsap.to(e,{y:0,opacity:1,filter:"blur(0px)",duration:a,ease:"power2.out",delay:t*o})}));const s=(r.length-1)*o+a;gsap.delayedCall(s+.05,(()=>t.forEach((e=>e.revert()))))}const p=e.closest(".w-tab-pane");if(p){registerObserver(new MutationObserver((()=>{p.classList.contains("w--tab-active")&&requestAnimationFrame((()=>requestAnimationFrame((()=>i.observe(e)))))}))).observe(p,{attributes:!0,attributeFilter:["class"]})}}))}
	function initCustomCursor(){if(window.__cursorInited)return;if(document.querySelector(".custom-cursor")||document.querySelector("canvas.cursor-webgl"))return;if(!window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(hover: hover)").matches){document.body.classList.remove("cursor--disable-all-cursors");return}window.__cursorInited=!0;const e=document.createElement("canvas");e.classList.add("cursor-webgl"),document.body.appendChild(e);const t=e.getContext("2d"),s={x:window.innerWidth/2,y:window.innerHeight/2,tX:window.innerWidth/2,tY:window.innerHeight/2},[o,n,i,r]=[40,.45,.4,.5],a=Array.from({length:o},(()=>({x:s.x,y:s.y,vx:0,vy:0}))),c={s:1};let d=window.innerWidth,l=window.innerHeight;function u(){d=window.innerWidth,l=window.innerHeight,e.width=d,e.height=l}u();const f=document.createElement("div");f.classList.add("custom-cursor");const L=document.createElement("div");L.classList.add("cursor-content"),f.appendChild(L),document.body.appendChild(f),gsap.set(f,{x:s.x,y:s.y,scale:1,opacity:0,transformOrigin:"center center"}),gsap.set(L,{scale:1,transformOrigin:"center center"});const b=gsap.quickSetter(f,"x","px"),C=gsap.quickSetter(f,"y","px");let m,y,h=!1,w={x:s.x,y:s.y},g=Date.now(),p=2e3,v=!1,_=0,S=0;function x(){t.clearRect(0,0,d,l),s.x+=(s.tX-s.x)*n,s.y+=(s.tY-s.y)*n,a.forEach(((e,t)=>{if(0===t)e.x=s.x,e.y=s.y;else{const s=a[t-1];e.vx+=(s.x-e.x)*i,e.vy+=(s.y-e.y)*i,e.vx*=r,e.vy*=r,e.x+=e.vx,e.y+=e.vy}}));const o=getComputedStyle(document.documentElement).getPropertyValue("--colors--highlight").trim()||"#000";t.strokeStyle=o;for(let e=0;e<a.length-1;e++){const s=a[e],n=a[e+1],i=e/(a.length-1);t.lineWidth=16*(1-i)+2*i,t.lineCap="round",t.beginPath(),t.moveTo(s.x,s.y),t.lineTo(n.x,n.y),t.stroke()}t.beginPath(),t.fillStyle=o,t.arc(s.x,s.y,10*c.s,0,2*Math.PI),t.fill(),S=requestAnimationFrame(x)}function E(){b(s.x),C(s.y),_=requestAnimationFrame(E)}function O(){if(h){v=!1,cancelAnimationFrame(y);return}if(v)return;v=!0;const e=Date.now();e-g>p&&(w.x=Math.random()*d,w.y=Math.random()*l,g=e,p=1e3+2e3*Math.random()),s.tX+=.01*(w.x-s.tX),s.tY+=.01*(w.y-s.tY),y=requestAnimationFrame(O)}const k=e=>{h=!0,v=!1,cancelAnimationFrame(y),s.tX=e.clientX,s.tY=e.clientY,clearTimeout(m),m=setTimeout((()=>{h=!1,O()}),1e4)},T=e=>{const t=e.target.closest("[data-cursor]");if(!t)return;L.innerHTML="",f.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),c.s=1;const s=(t.dataset.cursor||"").toLowerCase();let o=1;if("hide"===s){f.classList.add("cursor--hide"),document.body.classList.add("cursor--disable-all-cursors"),gsap.set(f,{scale:0,opacity:0,overwrite:!0}),gsap.set(c,{s:0,overwrite:!0});return}"scaleup"===s?(o=3,f.classList.add("cursor--scaleup")):"text"===s?(L.textContent=t.dataset.text||"",f.classList.add("cursor--active"),o=3):"icon"===s&&(()=>{const e=(t.dataset.icon||"").trim();if(e.toLowerCase().endsWith(".svg")){const t=new Image;t.src=e,t.style.width=t.style.height="1em",L.appendChild(t)}else if(e){const t=document.createElement("i");t.className=e,L.appendChild(t)}f.classList.add("cursor--active"),o=3})();gsap.killTweensOf(L),gsap.set(L,{scale:1/o}),gsap.to(f,{scale:o,opacity:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(c,{s:o,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0})},A=e=>{e.target.closest("[data-cursor]")&&(L.innerHTML="",f.className="custom-cursor",document.body.classList.remove("cursor--disable-all-cursors"),gsap.killTweensOf(L),gsap.set(L,{scale:1}),gsap.to(f,{scale:1,opacity:0,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}),gsap.to(c,{s:1,duration:.6,ease:"elastic.out(0.6, 0.3)",overwrite:!0}))};window.addEventListener("resize",u),document.addEventListener("mousemove",k),document.addEventListener("pointerover",T),document.addEventListener("pointerout",A),S=requestAnimationFrame(x),_=requestAnimationFrame(E),O(),window.__cursorState={onResize:u,onMove:k,onOver:T,onOut:A,rafDraw:S,rafFollow:_,rafIdle:y,idleTimeout:m,canvas:e,cursor:f,content:L}}
	function initThemeSwitch(t=document){const e=t.querySelector(".theme-switch");if(!e)return;const c=document.documentElement.getAttribute("data-theme");e.classList.toggle("dark","dark"===c),e.addEventListener("click",(()=>{const t="dark"===document.documentElement.getAttribute("data-theme")?"light":"dark";document.documentElement.setAttribute("data-theme",t),localStorage.setItem("theme",t),e.classList.toggle("dark","dark"===t)}))}
	function initCaseStudyBackgroundScroll(o){const r=o.closest(".barba-container"),e=o.querySelector(".cs-details"),t=o.querySelector(".cs-morework");if(!r||!e||!t)return;const a=getComputedStyle(r).backgroundColor,n="var(--colors--background)";ScrollTrigger.create({trigger:e,start:"top bottom-=15%",onEnter:()=>gsap.to(r,{backgroundColor:n,duration:.6,ease:"power1.inOut"}),onLeaveBack:()=>gsap.to(r,{backgroundColor:a,duration:.6,ease:"power1.inOut"})}),ScrollTrigger.create({trigger:t,start:"top bottom-=15%",onEnter:()=>gsap.to(r,{backgroundColor:"var(--colors--border)",duration:.6,ease:"power1.inOut"}),onLeaveBack:()=>gsap.to(r,{backgroundColor:n,duration:.6,ease:"power1.inOut"})})}
	function initDynamicPortraitColumns(e=document){const t=Array.from(e.querySelectorAll(".cs-gallery-inner"));if(!t.length)return;const r=e=>{if(e.naturalWidth>0&&e.naturalHeight>0)return e.naturalHeight/e.naturalWidth;const t=(e=>{const t=parseInt(e.getAttribute("width"),10),r=parseInt(e.getAttribute("height"),10);return t>0&&r>0?r/t:null})(e);if(t)return t;const r=e.clientWidth,n=e.clientHeight;return r>0&&n>0?n/r:null};let n=0;const i=e=>{cancelAnimationFrame(n),n=requestAnimationFrame((()=>{e()}))},o=()=>{if(t.forEach((e=>{e.style.removeProperty("width"),e.classList.remove("is-portrait","is-paired")})),!(window.innerWidth>=1024))return;const e=t.map((e=>e.querySelector("img"))).filter(Boolean).map((e=>{const t=r(e),n=!!t&&t>1;return n&&e.closest(".cs-gallery-inner")?.classList.add("is-portrait"),n}));for(let r=0;r<t.length-1;r++)e[r]&&e[r+1]&&([t[r],t[r+1]].forEach((e=>{e.style.width="calc(50% - 0.5rem)",e.classList.add("is-paired")})),r+=1)},s=t.map((e=>e.querySelector("img"))).filter(Boolean);if(!s.length)return;Promise.all(s.map((e=>{const t=()=>e.naturalWidth>0&&e.naturalHeight>0;if(t())return Promise.resolve();const r="function"==typeof e.decode?e.decode().catch((()=>{})):Promise.resolve(),n=new Promise((e=>{let r=0;const n=()=>t()?e():(r+=50,r>=3e3?e():void setTimeout(n,50));n()})),i=new Promise((t=>{const r=()=>{e.removeEventListener("load",r),t()};e.addEventListener("load",r,{once:!0})}));return Promise.race([r,n,i])}))).then((()=>{i(o)}));const a=new ResizeObserver((()=>i(o)));s.forEach((e=>a.observe(e)));const c=()=>i(o);window.addEventListener("resize",c,{passive:!0});const l=new MutationObserver((()=>{document.body.contains(e)||(a.disconnect(),window.removeEventListener("resize",c),l.disconnect())}));l.observe(document.body,{childList:!0,subtree:!0})}
	const preloader=document.querySelector(".preloader"),q=gsap.utils.selector(preloader),titleEl=q(".preloader-title")[0],subEl=q(".preloader-subtitle")[0],wrapEl=q(".preloader-image-wrap")[0],counter=q(".preloader-counter")[0],visual=q(".preloader-visual-counter")[0];let slides,maxW,maxVh;if(isSlowConnection()){slides=["#93A8AC","#BA5A31","#111D4A","#FFCF99","#C9FBC6"].map((e=>{const r=document.createElement("div");return r.className="preloader-slide placeholder",r.style.backgroundColor=e,wrapEl.appendChild(r),r}))}else slides=q(".preloader-image");function updateMetrics(){maxW=preloader.clientWidth,maxVh=window.innerHeight}updateMetrics(),window.addEventListener("resize",updateMetrics);
	function morphAndFade(t,e,o,{w:i,h:n},r=.8){const a=.2*r,u=.25*r;return gsap.timeline().to(o,{width:i,height:n,duration:r,ease:"power2.out"},0).to(o,{filter:"blur(2px)",duration:a,ease:"power2.inOut"},u).to(t,{opacity:0,duration:a,ease:"power2.inOut"},u).to(e,{opacity:1,duration:a,ease:"power2.inOut"},u).set(o,{filter:"none"},u+a)}
	function runIntroTimeline(){return new Promise((t=>{titleEl._originalHTML=titleEl.innerHTML,gsap.set([titleEl,subEl,wrapEl,counter],{autoAlpha:0,visibility:"hidden"}),gsap.set(titleEl,{autoAlpha:1,visibility:"visible"});const i=splitAndMask(titleEl);gsap.timeline({onComplete(){safelyRevertSplit(i,titleEl),t()}}).to(titleEl,{height:titleEl.scrollHeight,duration:.8,ease:"power2.out"},0).to(i.lines,{yPercent:0,rotation:0,duration:.8,ease:"power2.out",stagger:.08},0).to(subEl,{autoAlpha:1,visibility:"visible",height:subEl.scrollHeight,paddingTop:"0.5rem",y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"-=0.2").to(wrapEl,{autoAlpha:1,visibility:"visible",marginTop:"2rem",marginBottom:"2rem",duration:.8,ease:"power2.out"},"+=0.3").to(counter,{autoAlpha:1,visibility:"visible",height:counter.scrollHeight,filter:"blur(0)",duration:.6,ease:"power2.out"},"<")}))}
	async function runPreloader(){if(preloader.style.display="flex",runPreloader._started)return;runPreloader._started=!0,slides.forEach(((t,e)=>t.style.opacity=0===e?1:0));const t=[{ratio:2.5/3,heightVh:40,hold:.05},{ratio:16/9,heightVh:50,hold:.05},{ratio:1,heightVh:34,hold:.05},{ratio:4/3,heightVh:50,hold:.05},{ratio:1.5,heightVh:40,hold:.6}],e=t.length;let a=0;const o=t.map(((t,o)=>{const r=Math.round((o+1)/e*100),i=Math.round(10*Math.random()-5),n=Math.min(100,Math.max(a+1,r+i));return a=n,n}));for(let e=0;e<slides.length;e++){const{ratio:a,heightVh:r,hold:i}=t[e];let n=maxVh*(r/100),h=n*a;h>maxW&&(h=maxW,n=h/a);const s=o[e],l=gsap.to(visual,{height:s+"%",duration:.8+i,ease:"power1.inOut"}),d={v:0===e?0:o[e-1]},u=gsap.to(d,{v:s,duration:.8+i,ease:"power1.inOut",onUpdate(){counter.textContent=Math.round(d.v)+"%"}});0===e?await gsap.to(wrapEl,{width:h,height:n,duration:.8,ease:"power2.out"}):await morphAndFade(slides[e-1],slides[e],wrapEl,{w:h,h:n},.8),await new Promise((t=>setTimeout(t,1e3*i))),await Promise.all([l,u])}await gsap.to(visual,{height:"100%",duration:.2,ease:"none"}),counter.textContent="100%",await new Promise((t=>setTimeout(t,200))),await gsap.to(preloader,{yPercent:-100,duration:.8,ease:"power2.inOut",onStart(){initAllYourInits()},onComplete(){sessionStorage.setItem("preloaderSeen","1"),preloader.remove()}})}
	function coverIn(){const e=document.querySelector(".page-overlay"),t=e.querySelector(".page-overlay-tint");return e.style.display="block",e.style.pointerEvents="auto",gsap.set(e,{y:"100%",clipPath:"polygon(0% 0%, 100% 20%, 100% 100%, 0% 100%)",willChange:"transform,clip-path"}),gsap.set(t,{opacity:0,willChange:"opacity"}),gsap.timeline({defaults:{duration:1.35,ease:"power4.inOut"}}).to(e,{y:"0%"},0).to(e,{clipPath:"polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"},0).to(t,{opacity:1,ease:"none"},.6)}
	function coverOut(){const e=document.querySelector(".page-overlay");if(!e)return gsap.timeline();const t=e.querySelector(".page-overlay-tint");return document.querySelectorAll(".nav-primary-wrap").forEach((e=>{e.querySelector(".menu-wrapper")?.style&&(e.querySelector(".menu-wrapper").style.display="none"),e.querySelector(".menu-container")?.style&&(e.querySelector(".menu-container").style.display="none"),e.querySelector(".filters-container")?.style&&(e.querySelector(".filters-container").style.display="none")})),document.body.style.overflow="",gsap.timeline({onStart(){e.style.pointerEvents="auto"},onComplete(){e.style.display="none",e.style.pointerEvents="none"}}).to(e,{duration:.6,ease:"power4.in",y:"-100%"},0).to(t,{duration:.6,ease:"none",opacity:1},0)}
	function animateSelectedEntries(e=document){const t=e.querySelector(".selected-container"),r=t?.querySelector(".selected-content"),o=Array.from(e.querySelectorAll(".selected-item-outer")),l=gsap.timeline();if(!t||!r||!o.length)return l;o.forEach((e=>{if(e.__entryDone)return;const t=e.querySelector(".selected-visual"),r=e.querySelector(".selected-item-header .headline-m"),o=e.querySelector(".selected-item-details"),l=e.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:0,transformOrigin:"bottom center",opacity:0}),r&&gsap.set(r,{opacity:0}),o&&gsap.set(o,{opacity:0,height:0}),l.length&&gsap.set(l,{opacity:0,y:20,filter:"blur(10px)"})}));return(e=>{const o=()=>{requestAnimationFrame((()=>requestAnimationFrame(e)))};if(t.hasAttribute("data-loop-ready"))return o();const l=()=>{r.removeEventListener("selected:loop-ready",l,!0),o()};r.addEventListener("selected:loop-ready",l,!0),setTimeout((()=>{r.removeEventListener("selected:loop-ready",l,!0),o()}),600)})((()=>{const e=window.innerWidth||document.documentElement.clientWidth,t=window.innerHeight||document.documentElement.clientHeight,r=o.map((r=>{const o=r.getBoundingClientRect();return{o:r,r:o,area:Math.max(0,Math.min(o.right,e)-Math.max(o.left,0))*Math.max(0,Math.min(o.bottom,t)-Math.max(o.top,0)),center:.5*(o.left+o.right)}}));let a=r.filter((e=>e.area>1)).sort(((e,t)=>e.r.left-t.r.left));if(!a.length){const t=.5*e;a=r.slice().sort(((e,r)=>Math.abs(e.center-t)-Math.abs(r.center-t))).slice(0,2).sort(((e,t)=>e.r.left-t.r.left))}const n=new Set(a.map((e=>e.o)));r.forEach((e=>{if(e.o.__entryDone||n.has(e.o))return;const t=e.o.querySelector(".selected-visual"),r=e.o.querySelector(".selected-item-header .headline-m"),o=e.o.querySelector(".selected-item-details"),l=e.o.querySelectorAll(".selected-item-details .body-s");t&&gsap.set(t,{scaleY:1,opacity:1}),r&&gsap.set(r,{opacity:1}),o&&gsap.set(o,{opacity:1,height:"auto"}),l.length&&gsap.set(l,{opacity:1,y:0,filter:"blur(0px)"}),e.o.__entryDone=!0}));a.forEach(((e,t)=>{const r=e.o;if(r.__entryDone)return;const o=r.querySelector(".selected-visual"),a=r.querySelector(".selected-item-header .headline-m"),n=r.querySelector(".selected-item-details"),i=r.querySelectorAll(".selected-item-details .body-s"),s=.15*t;o&&l.set(o,{opacity:1},s).to(o,{scaleY:1,duration:.8,ease:"power2.out"},s),a&&l.set(a,{opacity:1},s+.2).call((()=>{if(a.__splitRun)return;a.__splitRun=!0;const e=splitAndMask(a);gsap.delayedCall(.15,(()=>{animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,a)))}))}),null,s+.2),n&&l.to(n,{opacity:1,height:"auto",duration:.4,ease:"power2.out"},s+.6),i.length&&l.to(i,{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"power2.out",stagger:.15},s+.6),r.__entryDone=!0}))})),l}
	function animateCapabilitiesEntry(t,{delayHero:e=!1}={}){const a=gsap.timeline(),o=t.querySelector(".section-table-of-contents");o&&gsap.set(o,{autoAlpha:0});const r=t.querySelector(".approach-mask");r&&(gsap.set(r,{scale:0,transformOrigin:"0% 100%",willChange:"transform"}),a.to(r,{scale:1,duration:1.2,ease:"power2.out"},0));const l=t.querySelector(".section-hero .headline-lg");if(l){gsap.set(l,{autoAlpha:0});const t=e?.2:0;a.addLabel("heroStart",t).set(l,{autoAlpha:1},"heroStart").call((()=>{const t=splitAndMask(l);animateLines(t.lines).eventCallback("onComplete",(()=>safelyRevertSplit(t,l)))}),null,"heroStart")}const n=t.querySelector(".section-hero .button-primary");n&&(gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),a.fromTo(n,{autoAlpha:0,y:20,filter:"blur(10px)"},{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},"heroStart+=0.4"));const s=gsap.utils.toArray(t.querySelectorAll(".table-of-contents-item"));return s.length&&a.from(s,{autoAlpha:0,paddingTop:"6rem",paddingBottom:"6rem",duration:1,ease:"power2.out",stagger:.15},0),o&&a.to(o,{autoAlpha:1,duration:.6,ease:"power2.out"},0),a}
	function animateInfoEntry(e){const t=gsap.timeline(),a=e.querySelectorAll(".section-scroll-track .w-layout-cell"),o=e.querySelector(".section-hero .subpage-intro h1"),l=e.querySelector(".section-hero .subpage-intro a");if(a.forEach((e=>gsap.set(e,{scaleY:0,transformOrigin:"bottom center"}))),t.to(a,{scaleY:1,duration:1,ease:"power2.out",stagger:{each:.15,from:"start"}},0),o){gsap.set(o,{autoAlpha:0});const e=splitAndMask(o);t.set(o,{autoAlpha:1},.35).call((()=>animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,o)))),null,.35)}return l&&(gsap.set(l,{autoAlpha:0,y:20,filter:"blur(10px)"}),t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},.6)),t}
	function animateCaseStudyEntry(e){const t=gsap.timeline(),l=e.querySelector(".cs-hero-image"),a=e.querySelector(".cs-headline"),n=e.querySelectorAll(".cs-titles-inner div");return l&&gsap.set(l,{autoAlpha:0,y:80,filter:"blur(10px)"}),a&&gsap.set(a,{autoAlpha:0}),n.length&&gsap.set(n,{autoAlpha:0,y:20,filter:"blur(10px)"}),l&&t.to(l,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out"},0),a&&t.addLabel("headline",.35).set(a,{autoAlpha:1,display:"block"},"headline").call((()=>{const e=splitAndMask(a);animateLines(e.lines).eventCallback("onComplete",(()=>safelyRevertSplit(e,a)))}),null,"headline"),n.length&&t.to(n,{autoAlpha:1,y:0,filter:"blur(0px)",duration:.6,ease:"power2.out",stagger:.05},.6),t}
	const entryConfigByNamespace={capabilities:{delayHero:!0,entryOffset:.1},index:{delayHero:!1,entryOffset:-.2},info:{delayHero:!1,entryOffset:-.2}};
	function getEntryConfig(e){return entryConfigByNamespace[e.dataset.barbaNamespace]??{delayHero:!1,entryOffset:0}}
	function runPageEntryAnimations(e){const{delayHero:t,entryOffset:a}=getEntryConfig(e),n=gsap.timeline();return"info"===e.dataset.barbaNamespace&&n.add(animateInfoEntry(e),0),e.querySelector(".section-table-of-contents")&&n.add(animateCapabilitiesEntry(e,{delayHero:t}),0),e.querySelector(".selected-item-outer")&&n.add(animateSelectedEntries(e),0),e.querySelector(".cs-hero-image")&&n.add(animateCaseStudyEntry(e),0),{tl:n,entryOffset:a}}
	const waitForLayoutStability=()=>new Promise((t=>{requestAnimationFrame((()=>{requestAnimationFrame((()=>{setTimeout(t,30)}))}))}));
	async function finalizeAfterEntry(i,r){await r.finished,await waitForLayoutStability(),initDynamicPortraitColumns(i),initPinnedSections(i),initServicesGallery(i),i.querySelector(".cs-hero-image")&&initCaseStudyBackgroundScroll(i),ScrollTrigger.refresh(!0),requestAnimationFrame((()=>ScrollTrigger.refresh(!0)))}
	async function runEntryFlow(i,{withCoverOut:n=!1}={}){i.style.visibility="",n&&await coverOut().finished,await runSafeInit(i,{preserveServicePins:!0});const{tl:t,entryOffset:e}=runPageEntryAnimations(i);t.call((()=>finalizeAfterEntry(i,t)),null,e+t.duration()),await t.finished}

// Barba Init
	function initBarba() {
		if (window.__barbaInited) return;
  		window.__barbaInited = true;
		barba.init({
			debug: true,
			transitions: [
			// 1) first-load / preloader
			// {
				// name: "initial-preloader",
				// once: async ({ next }) => {
				// 	if (shouldShowPreloader()) {
				// 		preloader.style.display = "flex";
				// 		await runIntroTimeline();
				// 		await runPreloader();
				// 	}
					
				// 	next();
				// 	initAllYourInits();
				// 	initNavigation(document);
				// }
			// },
				{
					name: "initial-load",
					once: async ({ next }) => {
						await runEntryFlow(next.container);
						markTabLinksForBarba(next.container);
  						reinitWebflowModules();
						initDynamicPortraitColumns(next.container);
					}
				},
				{
					name: "page-swipe",
					leave: async ({ current }) => {
						const tl = coverIn();
						if (tl?.finished && typeof tl.finished.then === "function") { await tl.finished; } else { await new Promise((resolve) => tl.eventCallback("onComplete", resolve)); }
						destroyAllYourInits();
						current.container.remove();
					},
					enter: async ({ next }) => {
						resetWebflow({ next });
						window.scrollTo(0, 0);
						await runEntryFlow(next.container, { withCoverOut: true });
					},
					afterEnter({ next }) {
						window.scrollTo(0, 0);
						markTabLinksForBarba(next.container);
						requestAnimationFrame(() => reinitWebflowModules());
						next.container.querySelectorAll("video[autoplay]").forEach(video => {video.muted = true; video.play().catch(() => {});});
						setTimeout(() => {
							initDynamicPortraitColumns(next.container);
							ScrollTrigger.refresh(true);
						}, 30);
					}
				}
			]
		});
	}

// Run All Initialisers
	let _firstLoadDone = false;
	function initAllYourInits(root = document) {
		initReparentChildren(root);
		markTabLinksForBarba(root);
		initTextAnimationOne(root);
		initLinkMappings(root);
		initSelectedWorkLoop(root);
		initArchiveFilters(root);
		initNavigation(root);
		initMenuLinkHover(root);
		initAccordions(root);
		initCounters(root);
		initAppearInLine(root);
		initCustomCursor();
		initThemeSwitch(root);
		initOverscrollBehavior(root);
		requestAnimationFrame(() => reinitWebflowModules());
	}

if(typeof initBarba==="function")window.initBarba=initBarba;
if(typeof initAllYourInits==="function")window.initAllYourInits=initAllYourInits;
(function(){function boot(){if(window.initBarba)window.initBarba()}if(document.readyState!=="loading")boot();else document.addEventListener("DOMContentLoaded",boot,{once:true})})();

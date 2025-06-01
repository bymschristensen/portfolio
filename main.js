<script>
	window.addEventListener("error", (e) => {
		console.log("Caught error:", e.message);
	});

	document.addEventListener("DOMContentLoaded", () => {
		gsap.registerPlugin(Flip, ScrollTrigger, SplitText, TextPlugin, Observer);

		// === Text Animations ===
				// Split & mask ONE element
				function splitAndMask(el) {
					// we stash the raw HTML so we can restore it later
					if (!el._originalHTML) el._originalHTML = el.innerHTML;
					if (el._split) return el._split.lines;

					const split = new SplitText(el, {
						type: "lines",
						linesClass: "line"
					});
					el._split = split;

					split.lines.forEach(line => {
						const mask = document.createElement("div");
						mask.classList.add("text-mask");
						mask.style.display = "block";
						mask.style.overflow = "hidden";
						mask.style.height = `${line.getBoundingClientRect().height}px`;
						line.parentNode.insertBefore(mask, line);
						mask.appendChild(line);
					});

					gsap.set(split.lines, { yPercent: 100, willChange: "transform" });
					return split.lines;
				}

				// — Animate an array of split lines —
				function animateLines(lines) {
					gsap.set(lines, { transformOrigin: "0 10%", rotation: 10, yPercent: 100 });
					return gsap.to(lines, {
						yPercent: 0,
						rotation: 0,
						duration: 1,
						ease: "power2.out",
						stagger: 0.1
					});
				}

				// helper to trigger TA-ONE on a given element
				function triggerTAOne(el) {
					const lines = splitAndMask(el);
					const tl = animateLines(lines);
					tl.eventCallback("onComplete", () => {
						el._split.revert();
						delete el._split;
						el.innerHTML = el._originalHTML;
						delete el._originalHTML;
					});
				}

						// Text Animation One — scroll-and-tab aware
						function initTextAnimationOne(selector = ".ta-one") {
							const observer = new IntersectionObserver((entries, obs) => {
								entries.forEach(entry => {
									if (!entry.isIntersecting) return;
									triggerTAOne(entry.target);
									obs.unobserve(entry.target);
								});
							}, {
								root: null,
								rootMargin: "0px 0px -5% 0px",
								threshold: 0
							});

							// observe each target
							gsap.utils.toArray(selector).forEach(el => observer.observe(el));

							// also re-trigger when Webflow tabs show
							document.querySelectorAll(".w-tab-pane").forEach(pane => {
								new MutationObserver((mutations) => {
									mutations.forEach(m => {
										if (m.attributeName === "class" && pane.classList.contains("w--tab-active")) {
											pane.querySelectorAll(selector).forEach(el => {
												// reset & re-observe
												el.innerHTML = el._originalHTML || el.innerHTML;
												delete el._split;
												delete el._originalHTML;
												observer.observe(el);
											});
										}
									});
								}).observe(pane, { attributes: true, attributeFilter: ["class"] });
							});
						}

						// Text Animation Two — scroll-and-tab aware, char-fill
						function initTextAnimationTwo(selector = ".ta-two", highlightColor) {
							const observer = new IntersectionObserver((entries, obs) => {
								entries.forEach(entry => {
									if (!entry.isIntersecting) return;

									const el = entry.target;
									el._originalHTML = el.innerHTML;

									const baseColor = getComputedStyle(document.documentElement).getPropertyValue("--colors--border").trim();
									const highColor = highlightColor || getComputedStyle(document.documentElement).getPropertyValue("--colors--primary").trim();

									const split = new SplitText(el, {
										type: "words,chars",
										wordsClass: "word",
										charsClass: "char"
									});

									// keep each word together
									gsap.set(split.words, { display: "inline-block", whiteSpace: "nowrap" });
									gsap.set(split.chars, { color: baseColor });

									const tl = gsap.timeline({
										scrollTrigger: {
											trigger: el,
											start:   "top 80%",
											end:     "bottom 20%",
											scrub:   0.5,
											onLeave: self => {
												// clean up after you scroll past
												split.revert();
												el.innerHTML = el._originalHTML;
												delete el._originalHTML;
												self.kill();
											}
										}
									});

									tl.to(split.chars, { color: highColor, stagger: 0.02, ease: "none" }, 0);

									obs.unobserve(el);
								});
							}, {
								root: null,
								rootMargin: "0px 0px -10% 0px",
								threshold: 0
							});

							// observe each target
							gsap.utils.toArray(selector).forEach(el => observer.observe(el));

							// re-trigger on tab switch
							document.querySelectorAll(".w-tab-pane").forEach(pane => {
								new MutationObserver((mutations) => {
									mutations.forEach(m => {
										if (m.attributeName === "class" && pane.classList.contains("w--tab-active")) {
											pane.querySelectorAll(selector).forEach(el => {
											observer.observe(el);
											});
										}
									});
								}).observe(pane, { attributes: true, attributeFilter: ["class"] });
							});
						}


		//
		// === Reparent data-child into matching data-parent ===
		//
		const initReparentChildren = () => {
			document.querySelectorAll('[data-child]').forEach((child) => {
				const id = child.getAttribute('data-child');
				const parent = document.querySelector(`[data-parent="${id}"]`);
				if (parent) parent.appendChild(child);
			});
		};
        
		//
		// === Click-redirect mappings ===
		//
		const initLinkMappings = () => {
			// your existing mappings…
			const mappings = [
				{ triggerId: 'selectedOpen',           targetId: 'selected'      },
				{ triggerId: 'archiveOpen',            targetId: 'archive'       },
				{ triggerId: 'resourcesOpen',          targetId: 'resources'     },
				{ triggerId: 'resourcesOpenShortcut',  targetId: 'resources'     },
			];
		
			// All four "recommendationsOpenX" → "recommendations"
			for (let i = 1; i <= 4; i++) {
				mappings.push({
					triggerId: `recommendationsOpen${i}`,
					targetId:  'recommendations'
				});
			}
		
			mappings.forEach(({ triggerId, targetId }) => {
				const triggerEl = document.getElementById(triggerId);
				const targetEl  = document.getElementById(targetId);
				if (!triggerEl || !targetEl) return;
				triggerEl.addEventListener('click', (e) => {
					e.preventDefault();
					targetEl.click();
				});
			});
		};


		//
		// === Infinite Loop & Scroll ===
		//
		function horizontalLoop(items, config = {}) {
			items = gsap.utils.toArray(items);
			const tl = gsap.timeline({
				repeat: config.repeat ?? 0,
				paused: config.paused ?? false,
				defaults: { ease: "none" },
				onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
			});
		
			const length = items.length;
			const startX = items[0].offsetLeft;
			const times = [];
			const widths = [];
			const xPercents = [];
			let curIndex = 0;
			const pixelsPerSecond = (config.speed || 0.75) * 100;
			const snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1);
		
			// set initial xPercent for each item
			gsap.set(items, {
				xPercent: (i, el) => {
					const w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
					xPercents[i] = snap(
						(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100) +
						gsap.getProperty(el, "xPercent")
					);
					return xPercents[i];
				}
			});
			gsap.set(items, { x: 0 });
		
			// total width of one full pass
			const totalWidth = items[length - 1].offsetLeft +
			xPercents[length - 1] / 100 * widths[length - 1] -
			startX +
			items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") +
			(parseFloat(config.paddingRight) || 0);
		
			// build the timeline
			for (let i = 0; i < length; i++) {
				const item = items[i];
				const curX = xPercents[i] / 100 * widths[i];
				const distanceToStart = item.offsetLeft + curX - startX;
				const distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
			
				tl.to(item, {
					xPercent: snap((curX - distanceToLoop) / widths[i] * 100),
					duration: distanceToLoop / pixelsPerSecond
				}, 0)
				.fromTo(item, {
					xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)
				}, {
					xPercent: xPercents[i],
					duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
					immediateRender: false
				}, distanceToLoop / pixelsPerSecond)
				.add("label" + i, distanceToStart / pixelsPerSecond);
			
				times[i] = distanceToStart / pixelsPerSecond;
			}
		
			// helper to jump to a given index
			function toIndex(index, vars = {}) {
				if (Math.abs(index - curIndex) > length / 2) {
					index += index > curIndex ? -length : length;
				}
				const newIndex = gsap.utils.wrap(0, length, index);
				let time = times[newIndex];
			
				if ((time > tl.time()) !== (index > curIndex)) {
					vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
					time += tl.duration() * (index > curIndex ? 1 : -1);
				}
			
				curIndex = newIndex;
				vars.overwrite = true;
				return tl.tweenTo(time, vars);
			}
		
			tl.next     = vars => toIndex(curIndex + 1, vars);
			tl.previous = vars => toIndex(curIndex - 1, vars);
			tl.current  = ()   => curIndex;
			tl.toIndex  = (i, v) => toIndex(i, v);
			tl.times    = times;
			tl.progress(1, true).progress(0, true);
		
			if (config.reversed) {
				tl.vars.onReverseComplete();
				tl.reverse();
			}
		
			return tl;
		}


		//
		// === Selected Work ===
		//
		const initSelectedWorkLoop = () => {
			const itemsSelector = ".list-item-selected-work";
			const observerTarget = ".selected-work-mask";
		
			// Check if the required elements exist before initializing the loop
			const itemsExist = document.querySelectorAll(itemsSelector).length > 0;
			const observerTargetExists = document.querySelector(observerTarget) !== null;
		
			// Only initialize the loop if both elements are found
			if (!itemsExist || !observerTargetExists) {
				return;
			}
		
			const loop = horizontalLoop(itemsSelector, { repeat: -1 });
			const slow = gsap.to(loop, { timeScale: 0, duration: 0.5 });
			loop.timeScale(0);
		
			Observer.create({
				target: observerTarget,
				type: "pointer,touch,wheel",
				wheelSpeed: -1,
				onChange: (self) => {
					const delta = Math.abs(self.deltaX) > Math.abs(self.deltaY) ? -self.deltaX : -self.deltaY;
					loop.timeScale(delta);
					slow.invalidate().restart();
				}
			});
		};


		//
		// === Archive First Case Study ===
		//
		function openFirstArchiveProject() {
			// 1) close any already–open items
			document.querySelectorAll('.list-item-archive-project.open').forEach(el => el.classList.remove('open'));
		
			// 2) find & open the first _visible_ project
			const first = Array.from(document.querySelectorAll('.list-item-archive-project')).find(el => el.offsetParent !== null);
			if (!first) return;
			first.classList.add('open');
		
			// 3) aggressively nudge scroll on everything Webflow might be observing:
			setTimeout(() => {
				// a) window scroll
				window.scrollBy(0, 1);
				window.scrollBy(0, -1);
				window.dispatchEvent(new Event('scroll', { bubbles: true }));
			
				// b) documentElement scrollTop bump
				const docEl = document.scrollingElement || document.documentElement;
				docEl.scrollTop += 2;
				docEl.scrollTop -= 2;
				docEl.dispatchEvent(new Event('scroll', { bubbles: true }));
			
				// c) body scrollTop bump (just in case)
				document.body.scrollTop += 2;
				document.body.scrollTop -= 2;
				document.body.dispatchEvent(new Event('scroll', { bubbles: true }));
			}, 0);
		}


		//
		// === Archive Filters ===
		//
		function initArchiveFilters() {
			const tabs     = Array.from(document.querySelectorAll(".filters-tab"));
			const projects = Array.from(document.querySelectorAll(".list-item-archive-project"));
			const navItems = Array.from(document.querySelectorAll("[id^='nav-archive-filter-']"));
		
			// 1) normalize CMS categories once
			projects.forEach(p => {
				p._catsNorm = Array.from(
					p.querySelectorAll(".archive-categories .cms-categories")
				).map(el =>
					el.textContent.trim().toLowerCase().replace(/[\W_]+/g, "")
				);
			});
		
			// 2) fill each filters-tab’s counter (unchanged)
			tabs.forEach(tab => {
				const key     = tab.id.replace("archive-filter-", "");
				const keyNorm = key.replace(/[\W_]+/g, "");
				const count   = key === "all" ? projects.length : projects.filter(p => p._catsNorm.includes(keyNorm)).length;
				tab.querySelector(".filters-counter").textContent = `(${count})`;
			});
		
			// 2a) fill each nav-filter’s counter (unchanged)
			navItems.forEach(item => {
				const badge = item.querySelector(".nav-counter-filters");
				if (!badge) {
					console.warn("nav badge not found for", item.id);
					return;
				}
				const key   = item.id.replace("nav-archive-filter-", "");
				const total = key === "all" ? projects.length : projects.filter(p => p._catsNorm.includes(key)).length;
				badge.textContent = `(${total})`;
			});
		
			// 3) “reveal+open” helper — NEW, tweens the counter properly
			function animateAndOpen(keyNorm) {
				// A) grab the counter element
				const counterEl = document.getElementById("archive-results-counter");
				if (!counterEl) return;

				// B) parse the “old” value (before hiding/showing anything)
				const rawText = counterEl.textContent || "";
				const oldValue = parseInt(rawText.replace(/\D/g, ""), 10) || 0;

				// C) hide/show the projects based on keyNorm
				projects.forEach(p => {
					p.style.display = (keyNorm === "all" || p._catsNorm.includes(keyNorm)) ? "" : "none";
				});

				// D) compute the new count (number of visible cards)
				const visibleCards = projects.filter(p => p.style.display !== "none");
				const newValue     = visibleCards.length;

				// E) tween the counter from oldValue → newValue
				gsap.to({ value: oldValue }, {
					value: newValue,
					duration: 0.5,
					ease: "power1.out",
					onUpdate: function() {
						// Write back the rounded value into the counter
						counterEl.textContent = Math.round(this.targets()[0].value);
					}
				});

				openFirstArchiveProject();

				// F) animate the visible cards in, then open the first visible project
				if (visibleCards.length === 0) {
					return;
				}

				const tl = gsap.timeline();
				tl.set(visibleCards, { y: 100, opacity: 0, filter: "blur(10px)", willChange: "transform, opacity" })
				.to(visibleCards, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out", stagger: 0.15 });
			}
		
			// 4) on each filters-tab click…
			tabs.forEach(tab => {
				tab.addEventListener("click", e => {
					e.preventDefault();
					tabs.forEach(t => t.classList.remove("active"));
					tab.classList.add("active");
					const key     = tab.id.replace("archive-filter-", "").toLowerCase();
					const keyNorm = key.replace(/[\W_]+/g, "");
					animateAndOpen(keyNorm);
				});
			});
		
			// 5) initial “All” on page load
			const defaultTab = document.getElementById("archive-filter-all");
			if (defaultTab) {
				defaultTab.classList.add("active");
				animateAndOpen("all");
			}
		
			// 6) re-trigger when the “Archive” tab‐pane becomes visible again
			const archivePane = document.querySelector('.w-tab-pane[data-w-tab="Archive"]');
			if (archivePane) {
				new MutationObserver(mutations => {
					mutations.forEach(m => {
						if (
							m.attributeName === 'class' &&
							archivePane.classList.contains('w--tab-active')
						) {
							// re-activate “All” and re-run animateAndOpen
							document.getElementById("archive-filter-all").classList.add("active");
							animateAndOpen("all");
						}
					});
				}).observe(archivePane, {
					attributes: true,
					attributeFilter: ['class']
				});
			}
		}


		//
		// Nav: Filters -> Counters
		//
		function fillNavCounters() {
			// re-grab the things in case Webflow injected them late
			const projects = Array.from(document.querySelectorAll(".list-item-archive-project"));
			const navItems  = Array.from(document.querySelectorAll("[id^='nav-archive-filter-']"));

			navItems.forEach(item => {
				const badge = item.querySelector(".nav-counter-filters");
				if (!badge) return;         // guard against null
				const key    = item.id.replace("nav-archive-filter-", "");
				const norm   = key.replace(/[\W_]+/g, "");
				const total  = key === "all" ? projects.length : projects.filter(p => p._catsNorm.includes(norm)).length;
				badge.textContent = `(${total})`;
			});
		}
		
		
		//
		// === Navigation + Filters ===
		//
		function initNavigation() {
			$(".nav-primary-wrap").each(function () {
				const wrap        = $(this);
				const navBtn      = wrap.find(".nav-button-menu");
				const filterBtn   = wrap.find(".nav-button-filter");
				const navText     = wrap.find(".nav-button-text");
				const menuWrapper = wrap.find(".menu-wrapper");
				const menu        = wrap.find(".menu-container");
				const phone       = wrap.find(".phone-number");
				const buttons     = wrap.find(".button-minimal-darkmode");
				const links       = wrap.find(".menu-link");
				const tuner       = wrap.find(".filter-tuner");
				const line1       = wrap.find(".filter-line-1");
				const line2       = wrap.find(".filter-line-2");
				const container   = wrap.find(".filters-container");
				const caption     = wrap.find(".modal-filters-caption");
				const items       = wrap.find(".modal-filters-item");
				const headlineEl  = wrap.find(".ta-one-menu")[0];
			
				let currentOpen = null;
				const disableScroll = () => document.body.style.overflow = 'hidden';
				const enableScroll  = () => document.body.style.overflow = '';
		
				// — initial hide —
				gsap.set(menuWrapper, { display: "none" });
				gsap.set(menu,        { display: "none" });
				gsap.set(container,   { display: "none" });
				gsap.set(filterBtn,   { display: "none", opacity: 0 });
			
				navText.data("orig", navText.text());
		
				const toggleButtonAnimation = (btn, _, open) => gsap.to(btn, { duration: open ? 0.3 : 0.2 });
		
				function checkTabActive() {
					const isActive = $(".archive-tab.w--tab-active").length > 0;
					console.log("Archive tab active?", isActive, { filterBtn });
					if (isActive) {
						filterBtn.css("display","flex");
						gsap.to(filterBtn, { opacity: 1, duration: 0.2 });
					} else {
						gsap.to(filterBtn, {
							opacity: 0,
							duration: 0.2,
							onComplete: () => filterBtn.css("display","none")
						});
					}
				}
				checkTabActive();
				[".archive-tab", ".archive-tab-link"].forEach(sel =>
					document.querySelectorAll(sel).forEach(el =>
						new MutationObserver(checkTabActive).observe(el, { attributes: true, attributeFilter: ["class"] })
					)
				);
				wrap.find("#archiveOpen, .archive-tab-link").on("click", () => setTimeout(checkTabActive, 50));
		
				// — MENU timeline (with H2 SplitText) —
				const navTl = gsap.timeline({
					paused: true,
					onStart: () => {
						disableScroll();
						menuWrapper.css("display","flex");
						menu.css("display","flex");
						toggleButtonAnimation(navBtn, "menu", true);
					},
					onReverseStart: () => {
						toggleButtonAnimation(navBtn, "menu", false);
						if (headlineEl._split) {
							gsap.to(headlineEl._split.lines, {
							opacity: 0, duration: 0.3, stagger: 0.1, ease: "power2.inOut"
							});
						}
					},
					onReverseComplete: () => {
						menu.hide();
						menuWrapper.css("display","none");
						enableScroll();
						navText.text(navText.data("orig"));
						if (headlineEl._split) {
							headlineEl._split.revert();
							delete headlineEl._split;
						}
						currentOpen = null;
						checkTabActive();
					}
				})
				.add(() => {
					const lines = splitAndMask(headlineEl);
					animateLines(lines);
				})
				.from(phone,   { opacity: 0, duration: 0.5 })
				.from(buttons, { opacity: 0, duration: 0.5, stagger: 0.2 }, "<")
				.from(links,   { opacity: 0, yPercent: 240, duration: 0.5, stagger: 0.2 }, "<")
				.to(navText,   { text: "Close", duration: 0.3 }, "<");
		
				// — FILTER timeline —
				const filterTl = gsap.timeline({
					paused: true,
					onStart: () => {
						disableScroll();
						menuWrapper.css("display","flex");
						container.css("display","flex");
						toggleButtonAnimation(filterBtn, "filter", true);
					},
					onReverseStart: () => {
						toggleButtonAnimation(filterBtn, "filter", false);
					},
					onReverseComplete: () => {
						container.hide();
						menuWrapper.css("display","none");
						enableScroll();
						currentOpen = null;
						checkTabActive();
					}
				})
				.set(container, { display: "flex" })
				.to(tuner, { opacity: 0, duration: 0.15 })
				.to(line1, { rotation: 45, transformOrigin: "center", duration: 0.35 }, "<")
				.to(line2, { rotation: -45, marginTop: "-4px", transformOrigin: "center", duration: 0.35 }, "<")
				.from(caption,{ opacity: 0, duration: 0.5 }, "<")
				.from(items,  { opacity: 0, duration: 0.8, stagger: 0.2 }, "<");
		
				// — OPEN / CLOSE HANDLERS —  
				const openMenu = () => {
					if (currentOpen === "filter") {
						filterTl.pause(0);
						toggleButtonAnimation(filterBtn, "filter", false);
					}
					currentOpen = "menu";
					navTl.timeScale(1);
					navTl.restart();
				};
			
				const openFilter = () => {
					if (currentOpen === "menu") {
						navTl.pause(0);
						toggleButtonAnimation(navBtn, "menu", false);
						navText.text(navText.data("orig"));
					}
					currentOpen = "filter";
					filterTl.timeScale(1);
					filterTl.restart();
				};
		
				const closeAll = () => {
					if (currentOpen === "menu") {
						toggleButtonAnimation(navBtn, "menu", false);
						navTl.tweenTo(0, { duration: navTl.duration() * 0.5 });
					}
					else if (currentOpen === "filter") {
						toggleButtonAnimation(filterBtn, "filter", false);
						filterTl.tweenTo(0, { duration: filterTl.duration() * 0.5 });
					}
				};
		
				// — wire up clicks —
				navBtn.on("click",    () => currentOpen === "menu"   ? closeAll() : openMenu());
				filterBtn.on("click", () => {
					if (currentOpen === "filter") closeAll();
					else {
						openFilter();
						fillNavCounters();
					}
				});
		
				// — filter-item click: close then navigate —
				items.on("click", function(e) {
					e.preventDefault();
				
					// 1) Find & click the matching filters-tab
					const navId = this.id;
					const key   = navId.replace("nav-archive-filter-", "");
					const tab   = document.getElementById(`archive-filter-${key}`);
					if (tab) {
						tab.click();
					}
				
					// 2) Speed up the “reverse” just for this click:
					filterTl.timeScale(3);            // 3× speed (tweak “3” as desired)
					const revTween = filterTl.reverse(); 
				
					// 3) Once _that_ reverse Tween finishes, restore normal speed:
					revTween.eventCallback("onComplete", () => {
						filterTl.timeScale(1);
					});
				
					currentOpen = null;
				});
			});
		}

		
		//
		// === Menu Link Hover Effect ===
		//
		
				
		//
		// === Menu Filters Hover Effect ===
		//
		const initMenuFilter = () => {
			const cursor = document.querySelector(".menu-filter-hover");
			const cursorMedias = document.querySelectorAll(".menu-filter-image");
			const navLinks = document.querySelectorAll(".modal-filters-item");

			if (!cursor || !cursorMedias || !navLinks) return;

			gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });
			const setX = gsap.quickTo(cursor, "x", { duration: 2.6, ease: "expo" });
			const setY = gsap.quickTo(cursor, "y", { duration: 2.6, ease: "expo" });

			window.addEventListener("mousemove", (e) => {
				setX(e.pageX);
				setY(e.pageY);
			});

			const tl = gsap.timeline({ paused: true }).to(cursor, {
				scale: 1,
				opacity: 1,
				rotation: 0,
				duration: 0.5,
				ease: "power1.inOut"
			});

			navLinks.forEach((link, i) => {
				link.addEventListener("mouseover", () => {
					cursorMedias[i]?.classList.add("active");
					tl.play();
				});
				link.addEventListener("mouseout", () => {
					tl.reverse();
					cursorMedias[i]?.classList.remove("active");
				});
			});
		};

		
		//
		// === Services Pinned ===
		//
		const initServicesPin = () => {
			const panels = Array.from(document.querySelectorAll(".section-single-service"));

			panels.forEach((panel, index) => {
				const isLast = index === panels.length - 1;
				const panelIsShort = panel.offsetHeight < window.innerHeight;

				gsap.timeline({
					scrollTrigger: {
						trigger: panel,
						start: panelIsShort ? "top top" : "bottom bottom",
						pin: true,
						pinType: "transform",
						pinSpacing: false,
						scrub: 1
					},
				}).to(
					panel,
					{
						ease: "none",
						startAt: { filter: "contrast(100%) blur(0px)" },
						filter: isLast ? "none" : "contrast(10%) blur(10px)",
					},
					0
				);
			});
		};


		//
		// === Services Gallery Infinite Loop ===
		//
		const initServicesGallery = () => {
			const scrollers = document.querySelectorAll(".infinite-gallery");
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		
			scrollers.forEach(scroller => {
				const wrapper   = scroller.querySelector(".infinite-gallery-wrapper");
				const originals = Array.from(wrapper.children);
				const scrollerW = scroller.offsetWidth;
		
				// read the flex-gap so we can pad the loop end to match
				const style = getComputedStyle(wrapper);
				const gap   = parseFloat(style.gap || style.columnGap || 0);
			
				// clone *three* full passes for a big invisible buffer
				for (let pass = 0; pass < 2; pass++) {
					originals.forEach(el => {
						const clone = el.cloneNode(true);
						clone.setAttribute("aria-hidden", "true");
						wrapper.appendChild(clone);
					});
				}
			
				// grab *all* items now (original + clones)
				const items = wrapper.querySelectorAll(".service-visual-wrapper");
				const dirRight = scroller.dataset.direction === "right";
				const speed    = parseFloat(scroller.dataset.speed) || 1;
		
				// create the infinite horizontal loop
				horizontalLoop(items, {
					repeat:       -1,
					speed:         speed,
					snap:         false,
					paddingRight: gap,
					reversed:     dirRight
				});
		
				// parallax on the visuals
				wrapper.querySelectorAll(".service-visual").forEach(vis => {
					gsap.to(vis, {
						xPercent: dirRight ? -20 : 20,
						ease:     "none",
						duration: 40,
						repeat:   -1,
						modifiers:{
							xPercent: gsap.utils.wrap(-10, 10)
						}
					});
				});
		
				// entry grow-from-bottom
				const cards = wrapper.querySelectorAll(".service-visual-wrapper");
				gsap.set(cards, { scaleY: 0, transformOrigin: "bottom center" });
				ScrollTrigger.batch(cards, {
					start:   "top 125%",
					onEnter: batch => {
						gsap.to(batch, {
							scaleY:   1,
							duration: 1,
							ease:     "power2.out",
						});
					},
					once: true
				});
			});
		};

		
		//
		// === Accordions with Group Behavior ===
		//
		const initAccordions = () => {
			let refreshTimeout;
			const safeRefresh = () => {
				clearTimeout(refreshTimeout);
				refreshTimeout = setTimeout(() => {
					ScrollTrigger.refresh();
				}, 150);
			};

			$(".accordion-list").each(function () {
				const group = $(this);
				const accordions = group.find(".accordion-subservice, .accordion-mindset, .accordion-quote");

				accordions.each(function () {
					const el = $(this);
					const header = el.find(".accordion-header");
					const icon = el.find(".cross-line-animating");
					const content = el.find(".accordion-content");
					const quoteIcon = el.find(".accordion-icon-quote");
					const isQuote = el.hasClass("accordion-quote");

					// Ensure content is hidden initially
					gsap.set(content, {
						maxHeight: 0,
						opacity: 0,
						paddingBottom: 0,
						paddingTop: isQuote ? 0 : undefined
					});

					// Timeline
					const tl = gsap.timeline({ paused: true });

					tl.to(header, { paddingTop: "2rem", duration: 0.4, ease: "power2.out" });
					tl.to(icon, { rotation: 0, duration: 0.4, ease: "power2.out" }, "<");

					tl.to(content, {
						maxHeight: 600,
						opacity: 1,
						paddingBottom: "2rem",
						paddingTop: isQuote ? "2rem" : undefined,
						duration: 0.5,
						ease: "power2.out",
						onUpdate: () => {
							safeRefresh();
						},
						onComplete: () => {
							gsap.set(content, { maxHeight: "none" });
						}
					}, "<");

					if (isQuote && quoteIcon.length) {
						tl.from(quoteIcon, {
							opacity: 0,
							duration: 0.4,
							ease: "power2.out"
						}, "<");
					}

					el.data("accordion-timeline", tl);

					const toggleAccordion = (open) => {
						if (!tl.isActive()) {
							if (!open) {
								const currentHeight = content.outerHeight();
								gsap.set(content, { maxHeight: currentHeight });
								tl.eventCallback("onReverseComplete", () => {
									safeRefresh();
								});
							} else {
								gsap.set(content, { maxHeight: 0 });
							}
							open ? tl.play() : tl.reverse();
							header.toggleClass("accordion-active", open);
						}
					};

					header.on("click", function () {
						const isActive = header.hasClass("accordion-active");

						// Find currently active accordion
						const openAccordion = accordions.filter(function () {
							return $(this).find(".accordion-header").hasClass("accordion-active");
						}).not(el);

						const openIsQuote = openAccordion.hasClass("accordion-quote");
						const needsDelay = openIsQuote || isQuote;

						// Close the currently open one
						openAccordion.each(function () {
							const other = $(this);
							const otherHeader = other.find(".accordion-header");
							const otherTl = other.data("accordion-timeline");

							if (!otherTl.isActive()) {
								otherHeader.removeClass("accordion-active");
								otherTl.reverse();
							}
						});

						// Toggle clicked accordion with optional delay
						if (!isActive) {
							const delayTime = needsDelay ? 0.4 : 0;
							gsap.delayedCall(delayTime, () => toggleAccordion(true));
						} else {
							toggleAccordion(false);
						}
					});
				});
			});
		};

		
		//
		// === Counters ===
		//
		function initCounters() {
			const counters = [
				{ id: "work-counter-selected",   selector: ".list-item-selected-work"    },
				{ id: "work-counter-archive",    selector: ".list-item-archive-project"  },
				{ id: "work-counter-resources",  selector: ".list-item-resource"         },
				{ id: "archive-results-counter", selector: ".list-item-archive-project"  }
			];
		
			counters.forEach(({ id, selector }) => {
				const newCount = document.querySelectorAll(selector).length;
				const el       = document.getElementById(id);
				if (!el) return;

				if (id === "archive-results-counter") {
					const rawText = el.textContent || "";
					const prev = parseInt(rawText.replace(/\D/g, ""), 10) || 0;

					const obj = { value: prev };
					gsap.to(obj, {
						value: newCount,
						duration: 0.5,
						ease: "power1.out",
						onUpdate: () => {
							el.textContent = Math.round(obj.value);
						}
					});
				} else {
					el.textContent = `(${newCount})`;
				}
			});
		}


		//
		// === Appear-in-Line Staggered Fade+Blur From Bottom ===
		//
		function initAppearInLine(selector = ".appear-in-line", childSelector = ":scope > *") {
			// helper to hide & reset a container
			function hideItems(el) {
				const items = el.querySelectorAll(childSelector);
				gsap.set(items, {
					y: 100,
					opacity: 0,
					filter: "blur(10px)",
					willChange: "transform, opacity"
				});
				el._appeared = false;
			}
		
			const containers = gsap.utils.toArray(selector);
			containers.forEach(hideItems); // hide everything up-front
		
			// observer to animate on enter
			const observer = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					const el = entry.target;
					if (entry.isIntersecting && !el._appeared) {
						el._appeared = true;
						const items = Array.from(el.querySelectorAll(childSelector));
						gsap.to(items, {
							y: 0,
							opacity: 1,
							filter: "blur(0px)",
							duration: 0.8,
							ease: "power2.out",
							stagger: 0.2
						});
					}
				});
			}, {
				root: null,
				rootMargin: "0px 0px -10% 0px",
				threshold: 0
			});
		
			// start observing each container
			containers.forEach(el => observer.observe(el));
		
			// watch for Webflow tab‐pane activations
			document.querySelectorAll(".w-tab-pane").forEach(pane => {
				new MutationObserver((mutations, obs) => {
					mutations.forEach(m => {
						if (m.attributeName === "class") {
							const becameActive = pane.classList.contains("w--tab-active");
							if (becameActive) {
								// for each appear-in-line inside this pane, reset + re-observe
								containers
								.filter(c => pane.contains(c))
								.forEach(c => {
									hideItems(c);
									observer.observe(c);
								});
							}
						}
					});
				}).observe(pane, { attributes: true, attributeFilter: ["class"] });
			});
		}

		// Run All Initializers
		initTextAnimationOne(".ta-one");
		initTextAnimationTwo(".ta-two");
		initReparentChildren();
		initLinkMappings();
		initSelectedWorkLoop();
		initArchiveFilters();
		initNavigation();
		initMenuFilter();
		initServicesPin();
		initServicesGallery();
		initAccordions();
		initCounters();
		initAppearInLine(".appear-in-line");
	});


	//
	// === Approach Scroll Animation ===
	//
	window.addEventListener("load", () => {
		// ─── Grab all the elements ───────────────────────────────────────────────────────
		const approachSection = document.querySelector(".section-approach");
		if (!approachSection) return;

		const overlay = approachSection.querySelector(".scroll-overlay");
		const content = approachSection.querySelector(".approach-content");
		const visual  = approachSection.querySelector(".approach-visual");
		const caption = document.querySelector(".table-caption");
		if (!caption || !overlay || !content || !visual) return;

		// We'll pin the approachSection itself (its parent is still in flow)
		const pinSpacer = approachSection.parentNode;

		// ─── Measure the caption + 16×9 ─────────────────────────────────────────────────
		function measureInitial() {
			const cRect  = caption.getBoundingClientRect();
			const w16by9 = cRect.width * (9 / 16);

			approachSection.dataset.capWidth   = cRect.width;
			approachSection.dataset.capLeft    = cRect.left;
			approachSection.dataset.capTop     = cRect.top;
			approachSection.dataset.capHeight  = w16by9;
			approachSection.dataset.capBottom  = cRect.bottom;
		}

		// Run it once now, and again on every ScrollTrigger.refreshInit:
		measureInitial();
		ScrollTrigger.addEventListener("refreshInit", measureInitial);

		// ─── Only hide the overlay + content on load (DO NOT move the section itself) ───
		gsap.set(overlay, { autoAlpha: 0 });
		gsap.set(content, { autoAlpha: 0, y: 50 });
		// (leave `visual` alone—its sizing/position will be handled by the timeline)

		// ─── Build the scroll timeline ─────────────────────────────────────────────────
		const tl = gsap.timeline({
			scrollTrigger: {
			trigger:      approachSection,
			start:        "top 85%",                         // when section top hits 85% of viewport
			end:          () => "+=" + (window.innerHeight * 2),
			scrub:        true,
			pin:          approachSection,                   // pin the actual section
			pinSpacing:   true,                              // preserve its space in the flow
			markers:      true,  // remove when you’re happy with positions
			anticipatePin: 1,
			onRefresh: self => {
				// recalc end in case the viewport height changed
				tl.scrollTrigger.end = "+=" + (window.innerHeight * 2);
			}
			}
		});

		// ─── Step 3: As soon as the pin “activates,” size + position the section into its 16×9 box ───
		tl.call(() => {
			const cW = Number(approachSection.dataset.capWidth);
			const cH = Number(approachSection.dataset.capHeight);
			const cL = Number(approachSection.dataset.capLeft);
			const cB = Number(approachSection.dataset.capBottom);

			gsap.set(approachSection, {
			position: "relative",    // keep it in normal flow so siblings stay below
			width:    cW + "px",
			height:   cH + "px",
			x:        cL + "px",     // x-position = caption.left
			y:        (cB - cH) + "px", // y so bottom = caption.bottom
			overflow: "hidden"
			});
		}, null, 0);

		// ─── Slide that 16×9 box from “bottom-of-caption” → y:0 ──────────────────────────────
		tl.to(approachSection, {
			y:    0,
			ease: "none"
		}, 0);

		// ─── Expand from 16×9 → full viewport ───────────────────────────────────────────────
		tl.to(approachSection, {
			width:  () => window.innerWidth + "px",
			height: () => window.innerHeight + "px",
			x:      0,
			ease:   "none"
		}, 0.001);

		// ─── Fade in overlay → fade+move in content → move visual ───────────────────────────
		tl.to(overlay,  { autoAlpha: 1,           ease: "none"       }, 0.1);
		tl.to(content,  { autoAlpha: 1, y: 0,     ease: "power2.out" }, 0.25);
		tl.to(visual,   { y:       -100,          ease: "none"       }, 0);

		// ─── Clean up if ScrollTrigger ever gets destroyed ────────────────────────────────
		ScrollTrigger.addEventListener("destroy", () => tl.kill());
		});

</script>
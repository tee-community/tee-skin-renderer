//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = /* @__PURE__ */ t({
	computeOrgWeight: () => a,
	convertHslToRgba: () => s,
	convertTeeColorToHsl: () => r,
	convertTeeColorToRgba: () => i,
	remapGreyscale: () => o
});
function r(e) {
	return [
		(e >> 16 & 255) * 360 / 255,
		(e >> 8 & 255) * 100 / 255,
		((e & 255) / 2 + 128) * 100 / 255
	];
}
function i(e) {
	return s(r(e));
}
function a(e, t, n) {
	let r = new Uint32Array(256);
	for (let i = n.y; i < n.y + n.h; i++) for (let a = n.x; a < n.x + n.w; a++) {
		let n = (i * t + a) * 4;
		if (e[n + 3] > 128) {
			let t = Math.round((e[n] + e[n + 1] + e[n + 2]) / 3);
			r[t]++;
		}
	}
	let i = 1;
	for (let e = 1; e < 256; e++) r[e] > r[i] && (i = e);
	return i;
}
function o(e, t, n = 192) {
	return e <= t ? e / t * n : (e - t) / (255 - t) * (255 - n) + n;
}
function s(e, t = 255) {
	let n = e[0] / 360, r = e[1] / 100, i = e[2] / 100, a, o, s;
	if (r === 0) return s = i * 255, [
		s,
		s,
		s,
		t
	];
	a = i < .5 ? i * (1 + r) : i + r - i * r;
	let c = 2 * i - a, l = [
		0,
		0,
		0,
		t
	];
	for (let e = 0; e < 3; e++) o = n + 1 / 3 * -(e - 1), o < 0 && o++, o > 1 && o--, s = 6 * o < 1 ? c + (a - c) * 6 * o : 2 * o < 1 ? a : 3 * o < 2 ? c + (a - c) * (2 / 3 - o) * 6 : c, l[e] = s * 255;
	return l;
}
//#endregion
//#region src/atlas.ts
var c = /* @__PURE__ */ t({
	ATLAS_HEIGHT: () => 128,
	ATLAS_WIDTH: () => 256,
	BODY_COLOR_REGION: () => C,
	BODY_OFFSET_Y: () => -6,
	EYE_SCALE: () => w,
	EYE_SEPARATION: () => T,
	FAT_BODY_SCALE: () => k,
	FOOT_COLOR_REGION: () => S,
	FOOT_OFFSET_X: () => O,
	FOOT_OFFSET_Y: () => 15,
	FOOT_SCALE_X: () => E,
	FOOT_SCALE_Y: () => D,
	GRID_CELL: () => 32,
	HAND_SCALE: () => p,
	SPRITE_BODY: () => l,
	SPRITE_BODY_OUTLINE: () => u,
	SPRITE_EYE_ANGRY: () => h,
	SPRITE_EYE_DEAD: () => v,
	SPRITE_EYE_HAPPY: () => _,
	SPRITE_EYE_NORMAL: () => m,
	SPRITE_EYE_PAIN: () => g,
	SPRITE_EYE_SURPRISE: () => y,
	SPRITE_FOOT: () => b,
	SPRITE_FOOT_OUTLINE: () => x,
	SPRITE_HAND: () => d,
	SPRITE_HAND_OUTLINE: () => f,
	TEE_BASE_SIZE: () => 96
}), l = {
	x: 0,
	y: 0,
	w: 96,
	h: 96
}, u = {
	x: 96,
	y: 0,
	w: 96,
	h: 96
}, d = {
	x: 192,
	y: 0,
	w: 32,
	h: 32
}, f = {
	x: 224,
	y: 0,
	w: 32,
	h: 32
}, p = .9375, m = {
	x: 64,
	y: 96,
	w: 32,
	h: 32
}, h = {
	x: 96,
	y: 96,
	w: 32,
	h: 32
}, g = {
	x: 128,
	y: 96,
	w: 32,
	h: 32
}, _ = {
	x: 160,
	y: 96,
	w: 32,
	h: 32
}, v = {
	x: 192,
	y: 96,
	w: 32,
	h: 32
}, y = {
	x: 224,
	y: 96,
	w: 32,
	h: 32
}, b = {
	x: 192,
	y: 32,
	w: 64,
	h: 32
}, x = {
	x: 192,
	y: 64,
	w: 64,
	h: 32
}, S = {
	xStart: 6 / 8,
	xEnd: 1,
	yStart: 1 / 4,
	yEnd: 3 / 4
}, C = {
	xStart: 0,
	xEnd: 3 / 8,
	yStart: 0,
	yEnd: 1 / 4
}, w = 1.2, T = 7.2, E = 1.5, D = 1.5, O = 10.5, k = 1.3, A = /* @__PURE__ */ t({
	debounce: () => j,
	domReady: () => P,
	loadImage: () => N,
	throttle: () => M
});
function j(e, t, n = !1) {
	let r;
	return function() {
		let i = this, a = arguments;
		clearTimeout(r), n && !r && e.apply(i, a), r = setTimeout(function() {
			r = void 0, n || e.apply(i, a);
		}, t);
	};
}
function M(e, t = 300) {
	let n, r, i;
	return function() {
		let a = this, o = arguments;
		n ? (clearTimeout(r), r = setTimeout(() => {
			Date.now() - i >= t && (e.apply(a, o), i = Date.now());
		}, Math.max(t - (Date.now() - i), 0))) : (e.apply(a, o), i = Date.now(), n = !0);
	};
}
function N(e) {
	return new Promise((t, n) => {
		let r = new Image();
		r.crossOrigin = "anonymous", r.addEventListener("error", n), r.addEventListener("load", (e) => {
			Promise.resolve(t(e.target)).then(() => {
				r.remove();
			});
		}), r.src = e;
	});
}
function P(e, ...t) {
	t = t === void 0 ? [] : t, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => {
		e(...t);
	}) : e(...t);
}
var F = 96 / 64, I = {
	x: 0,
	y: 0,
	angle: 0
}, L = {
	body: [{
		time: 0,
		x: 0,
		y: -4,
		angle: 0
	}],
	backFoot: [{
		time: 0,
		x: 0,
		y: 10,
		angle: 0
	}],
	frontFoot: [{
		time: 0,
		x: 0,
		y: 10,
		angle: 0
	}]
}, R = {
	body: [],
	backFoot: [{
		time: 0,
		x: -7,
		y: 0,
		angle: 0
	}],
	frontFoot: [{
		time: 0,
		x: 7,
		y: 0,
		angle: 0
	}]
}, z = {
	body: [],
	backFoot: [{
		time: 0,
		x: -3,
		y: 0,
		angle: -.1
	}],
	frontFoot: [{
		time: 0,
		x: 3,
		y: 0,
		angle: -.1
	}]
}, B = {
	body: [{
		time: 0,
		x: 0,
		y: 3,
		angle: 0
	}],
	backFoot: [{
		time: 0,
		x: 12,
		y: 0,
		angle: -.1
	}],
	frontFoot: [{
		time: 0,
		x: 8,
		y: 0,
		angle: -.1
	}]
}, V = {
	body: [
		{
			time: 0,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: .2,
			x: 0,
			y: -1,
			angle: 0
		},
		{
			time: .4,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: .6,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: .8,
			x: 0,
			y: -1,
			angle: 0
		},
		{
			time: 1,
			x: 0,
			y: 0,
			angle: 0
		}
	],
	backFoot: [
		{
			time: 0,
			x: 8,
			y: 0,
			angle: 0
		},
		{
			time: .2,
			x: -8,
			y: 0,
			angle: 0
		},
		{
			time: .4,
			x: -10,
			y: -4,
			angle: .2
		},
		{
			time: .6,
			x: -8,
			y: -8,
			angle: .3
		},
		{
			time: .8,
			x: 4,
			y: -4,
			angle: -.2
		},
		{
			time: 1,
			x: 8,
			y: 0,
			angle: 0
		}
	],
	frontFoot: [
		{
			time: 0,
			x: -10,
			y: -4,
			angle: .2
		},
		{
			time: .2,
			x: -8,
			y: -8,
			angle: .3
		},
		{
			time: .4,
			x: 4,
			y: -4,
			angle: -.2
		},
		{
			time: .6,
			x: 8,
			y: 0,
			angle: 0
		},
		{
			time: .8,
			x: 8,
			y: 0,
			angle: 0
		},
		{
			time: 1,
			x: -10,
			y: -4,
			angle: .2
		}
	]
}, H = {
	body: [
		{
			time: 0,
			x: 0,
			y: -1,
			angle: 0
		},
		{
			time: .2,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: .4,
			x: 0,
			y: -1,
			angle: 0
		},
		{
			time: .6,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: .8,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: 1,
			x: 0,
			y: -1,
			angle: 0
		}
	],
	backFoot: [
		{
			time: 0,
			x: 18,
			y: -8,
			angle: -.27
		},
		{
			time: .2,
			x: 6,
			y: 0,
			angle: 0
		},
		{
			time: .4,
			x: -7,
			y: 0,
			angle: 0
		},
		{
			time: .6,
			x: -13,
			y: -4.5,
			angle: .05
		},
		{
			time: .8,
			x: 0,
			y: -8,
			angle: -.2
		},
		{
			time: 1,
			x: 18,
			y: -8,
			angle: -.27
		}
	],
	frontFoot: [
		{
			time: 0,
			x: -11,
			y: -2.5,
			angle: .05
		},
		{
			time: .2,
			x: -14,
			y: -5,
			angle: .1
		},
		{
			time: .4,
			x: 11,
			y: -8,
			angle: -.3
		},
		{
			time: .6,
			x: 18,
			y: -8,
			angle: -.27
		},
		{
			time: .8,
			x: 3,
			y: 0,
			angle: 0
		},
		{
			time: 1,
			x: -11,
			y: -2.5,
			angle: .05
		}
	]
}, U = {
	body: [
		{
			time: 0,
			x: 0,
			y: -1,
			angle: 0
		},
		{
			time: .2,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: .4,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: .6,
			x: 0,
			y: -1,
			angle: 0
		},
		{
			time: .8,
			x: 0,
			y: 0,
			angle: 0
		},
		{
			time: 1,
			x: 0,
			y: -1,
			angle: 0
		}
	],
	backFoot: [
		{
			time: 0,
			x: -18,
			y: -8,
			angle: .27
		},
		{
			time: .2,
			x: 0,
			y: -8,
			angle: .2
		},
		{
			time: .4,
			x: 13,
			y: -4.5,
			angle: -.05
		},
		{
			time: .6,
			x: 7,
			y: 0,
			angle: 0
		},
		{
			time: .8,
			x: -6,
			y: 0,
			angle: 0
		},
		{
			time: 1,
			x: -18,
			y: -8,
			angle: .27
		}
	],
	frontFoot: [
		{
			time: 0,
			x: 11,
			y: -2.5,
			angle: -.05
		},
		{
			time: .2,
			x: -3,
			y: 0,
			angle: 0
		},
		{
			time: .4,
			x: -18,
			y: -8,
			angle: .27
		},
		{
			time: .6,
			x: -11,
			y: -8,
			angle: .3
		},
		{
			time: .8,
			x: 14,
			y: -5,
			angle: -.1
		},
		{
			time: 1,
			x: 11,
			y: -2.5,
			angle: -.05
		}
	]
};
function W(e) {
	return { ...e };
}
function G(e, t) {
	return {
		x: e.x + t.x,
		y: e.y + t.y,
		angle: e.angle + t.angle
	};
}
function K(e, t) {
	if (e.length === 0) return W(I);
	if (e.length === 1 || t <= e[0].time) return {
		x: e[0].x,
		y: e[0].y,
		angle: e[0].angle
	};
	let n = e[e.length - 1];
	if (t >= n.time) return {
		x: n.x,
		y: n.y,
		angle: n.angle
	};
	for (let n = 1; n < e.length; n++) {
		let r = e[n - 1], i = e[n];
		if (r.time <= t && t <= i.time) {
			let e = (t - r.time) / (i.time - r.time);
			return {
				x: r.x + (i.x - r.x) * e,
				y: r.y + (i.y - r.y) * e,
				angle: r.angle + (i.angle - r.angle) * e
			};
		}
	}
	return W(I);
}
function q(e, t) {
	return {
		body: K(e.body, t),
		backFoot: K(e.backFoot, t),
		frontFoot: K(e.frontFoot, t)
	};
}
function J(e, t) {
	return (e % t + t) % t;
}
function ee(e, t, n) {
	let r = Number.isFinite(e) ? e : 0;
	return t ? "inAir" : Math.abs(r) <= .00390625 ? n ? "sit" : "idle" : Math.abs(r) >= 19.53125 ? "run" : "walk";
}
function te(e) {
	let t = Number.isFinite(e.speed) ? e.speed : 0, n = ee(t, e.inAir, e.afk), r = 0, i = R;
	n === "inAir" ? i = z : n === "sit" ? i = B : n === "walk" ? (i = V, r = J(e.distance, 100) / 100) : n === "run" && (i = t < 0 ? H : U, r = J(e.distance, 200) / 200);
	let a = q(L, 0), o = q(i, r);
	return {
		mode: n,
		phase: r,
		body: G(a.body, o.body),
		backFoot: G(a.backFoot, o.backFoot),
		frontFoot: G(a.frontFoot, o.frontFoot)
	};
}
//#endregion
//#region src/tee.ts
var ne = /* @__PURE__ */ t({
	TeeRenderer: () => Y,
	createAsync: () => $,
	createContainerElements: () => X,
	createRendererAsync: () => Z,
	initializeAsync: () => Q
}), Y = class {
	_container;
	_eyes;
	_speed;
	_inAir;
	_fat;
	_afk;
	_colorBody;
	_colorFeet;
	_useCustomColor;
	_followMouseFn = null;
	_skinUrl;
	_skinBitmap = null;
	_skinLoading = !1;
	_skinLoadingPromise = null;
	_skinLoadedCallback = null;
	_offscreen = null;
	_offscreenContext = null;
	_currentObjectUrl = null;
	_cachedColorKey = null;
	_animationDistance = 0;
	_animationFrameId = null;
	_animationLastTimestamp = null;
	_debounceUpdateTeeImage;
	_animationFrameCallback = (e) => {
		if (this._animationFrameId = null, Math.abs(this._speed) <= .00390625) {
			this._animationLastTimestamp = null;
			return;
		}
		if (this._animationLastTimestamp !== null) {
			let t = Math.min(Math.max((e - this._animationLastTimestamp) / 1e3, 0), .1);
			this._animationDistance += this._speed * 50 * t, this._animationDistance %= 200;
		}
		this._animationLastTimestamp = e, this.applyAnimationFrame(), this._animationFrameId = requestAnimationFrame(this._animationFrameCallback);
	};
	constructor(e, t) {
		if (e.tee !== void 0) throw Error("TeeRenderer already initialized on this container");
		Object.defineProperty(e, "tee", {
			value: this,
			writable: !1
		}), this._container = e, this._colorBody = t.colorBody, this._colorFeet = t.colorFeet, this._useCustomColor = t.useCustomColor === void 0 ? t.colorBody !== void 0 || t.colorFeet !== void 0 : t.useCustomColor, this._eyes = t.eyes ?? "normal", this._speed = Number.isFinite(t.speed) ? t.speed : 0, this._inAir = t.inAir ?? !1, this._fat = t.fat ?? !1, this._afk = t.afk ?? !1, this._skinUrl = t.skinUrl, this._fat && this._container.classList.add("tee_fat"), this._afk && this._container.classList.add("tee_afk"), this._container.classList.add("tee_initialized"), this._container.classList.remove("tee_initializing"), this._debounceUpdateTeeImage = j(this.updateTeeImage, 10), this._container.dataset.speed = String(this._speed), this._container.dataset.inAir = this._inAir ? "true" : "false", this.applyAnimationFrame(), this.updateAnimationLoop(), this.addEventListener("tee:rendered", () => {
			this._container.classList.add("tee_rendered");
		}, { once: !0 }), this.followMouse = t.followMouse === !0, this.loadSkin(this._skinUrl, !1);
	}
	get container() {
		return this._container;
	}
	get colorBody() {
		return this._colorBody;
	}
	set colorBody(e) {
		if (e === void 0) {
			delete this._container.dataset.colorBody, this._colorBody = void 0, this.update();
			return;
		}
		this._colorBody = Number(e), this.update();
	}
	get colorBodyHsl() {
		return this._colorBody === void 0 ? void 0 : r(this._colorBody);
	}
	get colorBodyRgba() {
		return this._colorBody === void 0 ? void 0 : i(this._colorBody);
	}
	get colorFeet() {
		return this._colorFeet;
	}
	set colorFeet(e) {
		if (e === void 0) {
			delete this._container.dataset.colorFeet, this._colorFeet = void 0, this.update();
			return;
		}
		this._colorFeet = Number(e), this.update();
	}
	get colorFeetHsl() {
		return this._colorFeet === void 0 ? void 0 : r(this._colorFeet);
	}
	get colorFeetRgba() {
		return this._colorFeet === void 0 ? void 0 : i(this._colorFeet);
	}
	get useCustomColor() {
		return this._useCustomColor;
	}
	set useCustomColor(e) {
		this._container.dataset.useCustomColor = e ? "true" : "false", this._useCustomColor = e, this.update();
	}
	get eyes() {
		return this._eyes;
	}
	set eyes(e) {
		this._eyes !== e && (this._eyes = e, this._container.dataset.eyes = e);
	}
	get speed() {
		return this._speed;
	}
	set speed(e) {
		let t = Number.isFinite(e) ? e : 0;
		this._speed !== t && (this._speed = t, this._container.dataset.speed = String(t), this.applyAnimationFrame(), this.updateAnimationLoop());
	}
	get inAir() {
		return this._inAir;
	}
	set inAir(e) {
		this._inAir !== e && (this._inAir = e, this._container.dataset.inAir = e ? "true" : "false", this.applyAnimationFrame(), this.updateAnimationLoop());
	}
	get fat() {
		return this._fat;
	}
	set fat(e) {
		this._fat !== e && (this._fat = e, this._container.classList.toggle("tee_fat", e));
	}
	get afk() {
		return this._afk;
	}
	set afk(e) {
		this._afk !== e && (this._afk = e, this._container.classList.toggle("tee_afk", e), this.applyAnimationFrame());
	}
	get followMouse() {
		return this._followMouseFn !== null;
	}
	set followMouse(e) {
		this.followMouse !== e && (e ? (this._followMouseFn = this.mouseFollowThrottleCallbackFactory(), document.addEventListener("mousemove", this._followMouseFn), this._container.dataset.followMouse = "true") : (document.removeEventListener("mousemove", this._followMouseFn), this._followMouseFn = null, this._container.dataset.followMouse = "false", this._container.style.setProperty("--tee-eye-follow-x", "0px"), this._container.style.setProperty("--tee-eye-follow-y", "0px")));
	}
	mouseFollowThrottleCallbackFactory() {
		return M((e) => {
			let t = this._container.getBoundingClientRect(), n = e.clientX - (t.x + t.width / 2), r = e.clientY - (t.y + t.height / 2 - t.height * .125), i = Math.atan2(r, n), a = Math.cos(i) * .125 * t.width, o = Math.sin(i) * .1 * t.height;
			this._container.style.setProperty("--tee-eye-follow-x", `${a.toFixed(4)}px`), this._container.style.setProperty("--tee-eye-follow-y", `${o.toFixed(4)}px`);
		}, 20);
	}
	getAnimationFrame() {
		return te({
			speed: this._speed,
			inAir: this._inAir,
			afk: this._afk,
			distance: this._animationDistance
		});
	}
	setAnimationStyle(e, t, n = "em") {
		this._container.style.setProperty(e, `${t}${n}`);
	}
	applyAnimationFrame(e = this.getAnimationFrame()) {
		this.setAnimationStyle("--tee-body-x", e.body.x * F), this.setAnimationStyle("--tee-body-y", e.body.y * F), this.setAnimationStyle("--tee-body-angle", e.body.angle * Math.PI * 2, "rad"), this.setAnimationStyle("--tee-back-foot-x", e.backFoot.x * F), this.setAnimationStyle("--tee-back-foot-y", e.backFoot.y * F), this.setAnimationStyle("--tee-back-foot-angle", e.backFoot.angle * Math.PI * 2, "rad"), this.setAnimationStyle("--tee-front-foot-x", e.frontFoot.x * F), this.setAnimationStyle("--tee-front-foot-y", e.frontFoot.y * F), this.setAnimationStyle("--tee-front-foot-angle", e.frontFoot.angle * Math.PI * 2, "rad");
	}
	updateAnimationLoop() {
		if (!(Math.abs(this._speed) > .00390625)) {
			this._animationFrameId !== null && (cancelAnimationFrame(this._animationFrameId), this._animationFrameId = null), this._animationLastTimestamp = null;
			return;
		}
		this._animationFrameId === null && (this._animationLastTimestamp = null, this._animationFrameId = requestAnimationFrame(this._animationFrameCallback));
	}
	get skinUrl() {
		return this._skinUrl;
	}
	set skinUrl(e) {
		this.loadSkin(e, !0);
	}
	get skinBitmap() {
		return this._skinBitmap;
	}
	setSkinVariableValue(e) {
		this._container.style.setProperty("--skin", e);
	}
	getColorCacheKey() {
		return this._useCustomColor ? `${this._colorBody ?? 0}:${this._colorFeet ?? 0}` : "no-color";
	}
	updateTeeImage() {
		if (this._skinBitmap === null) return;
		let e = this.getColorCacheKey();
		if (this._cachedColorKey !== e) {
			if (this._offscreen === null ? (this._offscreen = new OffscreenCanvas(this._skinBitmap.width, this._skinBitmap.height), this._offscreenContext = this._offscreen.getContext("2d", { willReadFrequently: !0 })) : ((this._offscreen.width !== this._skinBitmap.width || this._offscreen.height !== this._skinBitmap.height) && (this._offscreen.width = this._skinBitmap.width, this._offscreen.height = this._skinBitmap.height), this._offscreenContext.clearRect(0, 0, this._offscreen.width, this._offscreen.height)), this._offscreenContext.drawImage(this._skinBitmap, 0, 0), this.useCustomColor) {
				let e = this.colorBodyRgba || i(0), t = this.colorFeetRgba || i(0), n = this._offscreenContext.getImageData(0, 0, this._offscreen.width, this._offscreen.height), r = n.data, s = this._offscreen.width, c = this._offscreen.height, l = 6 / 8 * s, u = s, d = 1 / 4 * c, f = 3 / 4 * c, p = a(r, s, {
					x: 0,
					y: 0,
					w: Math.floor(3 / 8 * s),
					h: Math.floor(1 / 4 * c)
				});
				for (let n = 0; n < r.length; n += 4) {
					let i = n / 4 % s, a = Math.floor(n / 4 / s), c = o((r[n] + r[n + 1] + r[n + 2]) / 3, p), m = i >= l && i < u && a >= d && a < f ? t : e;
					r[n] = c * m[0] / 255, r[n + 1] = c * m[1] / 255, r[n + 2] = c * m[2] / 255, r[n + 3] = r[n + 3] * m[3] / 255;
				}
				this._offscreenContext.putImageData(n, 0, 0);
			}
			this._offscreen.convertToBlob().then((t) => {
				this._currentObjectUrl && URL.revokeObjectURL(this._currentObjectUrl);
				let n = URL.createObjectURL(t);
				this._currentObjectUrl = n, this._cachedColorKey = e, this.setSkinVariableValue(`url('${n}')`), this.dispatchEvent("tee:rendered");
			});
		}
	}
	dispatchEvent(...e) {
		this._container.dispatchEvent(new CustomEvent(e[0], { detail: {
			tee: this,
			payload: e[1] || void 0
		} }));
	}
	addEventListener(e, t, n) {
		this._container.addEventListener(e, t, n);
	}
	removeEventListener(e, t, n) {
		this._container.removeEventListener(e, t, n);
	}
	update() {
		this._debounceUpdateTeeImage();
	}
	renderToCanvas(e, t) {
		if (!this._skinBitmap) return;
		let n = t?.size ?? 96, r = t?.eyes ?? this._eyes, s = n / 96, c = n / 64, d = this.getAnimationFrame(), f = e.getContext("2d");
		if (!f) return;
		e.width = n, e.height = n, f.clearRect(0, 0, n, n);
		let p = new OffscreenCanvas(this._skinBitmap.width, this._skinBitmap.height), O = p.getContext("2d", { willReadFrequently: !0 });
		if (O.drawImage(this._skinBitmap, 0, 0), this.useCustomColor) {
			let e = this.colorBodyRgba || i(0), t = this.colorFeetRgba || i(0), n = O.getImageData(0, 0, p.width, p.height), r = n.data, s = p.width, c = p.height, l = s * S.xStart, u = s * S.xEnd, d = c * S.yStart, f = c * S.yEnd, m = a(r, s, {
				x: 0,
				y: 0,
				w: Math.floor(s * C.xEnd),
				h: Math.floor(c * C.yEnd)
			});
			for (let n = 0; n < r.length; n += 4) {
				let i = n / 4 % s, a = Math.floor(n / 4 / s), c = o((r[n] + r[n + 1] + r[n + 2]) / 3, m), p = i >= l && i < u && a >= d && a < f ? t : e;
				r[n] = c * p[0] / 255, r[n + 1] = c * p[1] / 255, r[n + 2] = c * p[2] / 255, r[n + 3] = r[n + 3] * p[3] / 255;
			}
			O.putImageData(n, 0, 0);
		}
		let A = this._skinBitmap.width / 256, j = this._skinBitmap.height / 128, M = n / 2, N = n / 2, P = {
			x: M + d.body.x * c,
			y: N + d.body.y * c
		}, F = (e, t, n, r, i, a = 0, o = !1) => {
			f.save(), f.translate(t, n), f.rotate(a), o && f.scale(-1, 1), f.drawImage(p, e.x * A, e.y * j, e.w * A, e.h * j, -r / 2, -i / 2, r, i), f.restore();
		}, I = l.w * s * (this._fat ? k : 1), L = b.w * E * s, R = b.h * D * s, z = {
			x: M + d.backFoot.x * c,
			y: N + d.backFoot.y * c
		}, B = {
			x: M + d.frontFoot.x * c,
			y: N + d.frontFoot.y * c
		}, V = {
			normal: m,
			angry: h,
			pain: g,
			happy: _,
			dead: v,
			surprise: y,
			blink: m
		}[r] ?? m, H = m.w * w * s, U = r === "blink" ? H * .375 : H, W = T * s, G = P.y - n * .125, K = d.body.angle * Math.PI * 2;
		F(x, z.x, z.y, L, R, d.backFoot.angle * Math.PI * 2), F(u, P.x, P.y, I, I, K), F(x, B.x, B.y, L, R, d.frontFoot.angle * Math.PI * 2), F(b, z.x, z.y, L, R, d.backFoot.angle * Math.PI * 2), F(l, P.x, P.y, I, I, K), F(V, P.x - W, G, H, U, K), F(V, P.x + W, G, H, U, K, !0), F(b, B.x, B.y, L, R, d.frontFoot.angle * Math.PI * 2);
	}
	destroy() {
		this.followMouse = !1, this._animationFrameId !== null && (cancelAnimationFrame(this._animationFrameId), this._animationFrameId = null), this._animationLastTimestamp = null, this._currentObjectUrl &&= (URL.revokeObjectURL(this._currentObjectUrl), null), this._skinBitmap &&= (this._skinBitmap.close(), null), this._offscreen = null, this._offscreenContext = null, this._cachedColorKey = null, this._skinLoadedCallback = null;
		for (let e of [
			"--tee-body-x",
			"--tee-body-y",
			"--tee-body-angle",
			"--tee-back-foot-x",
			"--tee-back-foot-y",
			"--tee-back-foot-angle",
			"--tee-front-foot-x",
			"--tee-front-foot-y",
			"--tee-front-foot-angle"
		]) this._container.style.removeProperty(e);
		this.setSkinVariableValue(null), this._container.classList.remove("tee_initialized", "tee_rendered");
	}
	loadSkin(e, t) {
		if (this._skinLoading) this._skinLoadedCallback = () => this.loadSkin(e, t);
		else {
			let n = (n) => {
				this._skinLoadingPromise = null, this._skinLoading = !1, this.dispatchEvent("tee:skin-loaded", {
					skin: e,
					success: n
				}), t && this.update(), this._skinLoadedCallback && this._skinLoadedCallback(), this._skinLoadedCallback = null;
			};
			this._skinLoading = !0, this._skinLoadedCallback = null, this._skinLoadingPromise = N(e).then(async (e) => {
				this._skinBitmap = await createImageBitmap(e), this._cachedColorKey = null, this._skinUrl = e.src, this._container.dataset.skin = this._skinUrl, n(!0);
			}).catch(() => {
				console.warn(`TeeRenderer: cannot load skin '${e}'`), n(!1);
			});
		}
		return this._skinLoadingPromise;
	}
};
function X(e) {
	let t = document.createElement("div"), n = document.createElement("div"), r = document.createElement("div"), i = document.createElement("div"), a = document.createElement("div");
	t.classList.add("tee__eyes"), n.classList.add("tee__foot"), n.classList.add("tee__foot_back"), n.classList.add("tee__foot_outline"), r.classList.add("tee__foot"), r.classList.add("tee__foot_back"), i.classList.add("tee__foot"), i.classList.add("tee__foot_front"), i.classList.add("tee__foot_outline"), a.classList.add("tee__foot"), a.classList.add("tee__foot_front"), e.replaceChildren(), e.appendChild(t), e.appendChild(n), e.appendChild(r), e.appendChild(i), e.appendChild(a), e.eyes = t;
}
function Z(e, t) {
	return new Promise((n, r) => {
		setTimeout(() => {
			r();
		}, 2e4);
		try {
			e.classList.add("tee_initializing"), X(e), new Y(e, t).addEventListener("tee:skin-loaded", (e) => {
				n(e.detail.tee);
			}, { once: !0 });
		} catch {
			e.classList.remove("tee_initializing"), r();
		}
	});
}
async function Q(e = !0) {
	let t = [...document.querySelectorAll(".tee:not(.tee_initialized):not(.tee_initializing)")].map((e) => Z(e, {
		colorBody: parseInt(e.dataset.colorBody) || void 0,
		colorFeet: parseInt(e.dataset.colorFeet) || void 0,
		useCustomColor: e.dataset.useCustomColor === void 0 ? void 0 : e.dataset.useCustomColor === "true",
		eyes: e.dataset.eyes,
		followMouse: e.dataset.followMouse === void 0 ? void 0 : e.dataset.followMouse === "true",
		speed: e.dataset.speed === void 0 ? void 0 : Number(e.dataset.speed),
		inAir: e.dataset.inAir === void 0 ? void 0 : e.dataset.inAir === "true",
		fat: e.dataset.fat === void 0 ? void 0 : e.dataset.fat === "true",
		afk: e.dataset.afk === void 0 ? void 0 : e.dataset.afk === "true",
		skinUrl: e.dataset.skin
	}));
	e ? await Promise.allSettled(t).then((e) => {
		e.forEach((e) => {
			if (e.status === "fulfilled") try {
				e.value.update();
			} catch {}
		});
	}) : t.forEach((e) => {
		e.then((e) => e.update());
	});
}
async function $(e) {
	let t = document.createElement("div");
	e.colorBody !== void 0 && (t.dataset.colorBody = e.colorBody + ""), e.colorFeet !== void 0 && (t.dataset.colorFeet = e.colorFeet + ""), e.useCustomColor !== void 0 && (t.dataset.useCustomColor = e.useCustomColor ? "true" : "false"), e.eyes !== void 0 && (t.dataset.eyes = e.eyes), e.followMouse !== void 0 && (t.dataset.followMouse = e.followMouse ? "true" : "false"), e.speed !== void 0 && (t.dataset.speed = String(e.speed)), e.inAir !== void 0 && (t.dataset.inAir = e.inAir ? "true" : "false"), e.fat !== void 0 && (t.dataset.fat = e.fat ? "true" : "false"), e.afk !== void 0 && (t.dataset.afk = e.afk ? "true" : "false"), t.dataset.skin = e.skinUrl, t.classList.add("tee");
	let n = await Z(t, e);
	return n.update(), n.container;
}
//#endregion
//#region src/index.ts
P(() => {
	Q();
});
//#endregion
export { c as atlas, n as color, $ as createAsync, A as helpers, Q as init, ne as renderer };

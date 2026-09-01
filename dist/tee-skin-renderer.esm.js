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
	BODY_COLOR_REGION: () => b,
	BODY_OFFSET_Y: () => -6,
	EYE_SCALE: () => x,
	EYE_SEPARATION: () => re,
	FAT_BODY_SCALE: () => T,
	FOOT_COLOR_REGION: () => y,
	FOOT_OFFSET_X: () => w,
	FOOT_OFFSET_Y: () => 15,
	FOOT_SCALE_X: () => S,
	FOOT_SCALE_Y: () => C,
	GRID_CELL: () => 32,
	HAND_SCALE: () => p,
	SPRITE_BODY: () => l,
	SPRITE_BODY_OUTLINE: () => u,
	SPRITE_EYE_ANGRY: () => h,
	SPRITE_EYE_DEAD: () => g,
	SPRITE_EYE_HAPPY: () => te,
	SPRITE_EYE_NORMAL: () => m,
	SPRITE_EYE_PAIN: () => ee,
	SPRITE_EYE_SURPRISE: () => ne,
	SPRITE_FOOT: () => _,
	SPRITE_FOOT_OUTLINE: () => v,
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
}, ee = {
	x: 128,
	y: 96,
	w: 32,
	h: 32
}, te = {
	x: 160,
	y: 96,
	w: 32,
	h: 32
}, g = {
	x: 192,
	y: 96,
	w: 32,
	h: 32
}, ne = {
	x: 224,
	y: 96,
	w: 32,
	h: 32
}, _ = {
	x: 192,
	y: 32,
	w: 64,
	h: 32
}, v = {
	x: 192,
	y: 64,
	w: 64,
	h: 32
}, y = {
	xStart: 6 / 8,
	xEnd: 1,
	yStart: 1 / 4,
	yEnd: 3 / 4
}, b = {
	xStart: 0,
	xEnd: 3 / 8,
	yStart: 0,
	yEnd: 1 / 4
}, x = 1.2, re = 7.2, S = 1.5, C = 1.5, w = 10.5, T = 1.3, E = /* @__PURE__ */ t({
	debounce: () => D,
	domReady: () => A,
	loadImage: () => k,
	throttle: () => O
});
function D(e, t, n = !1) {
	let r;
	return function() {
		let i = this, a = arguments;
		clearTimeout(r), n && !r && e.apply(i, a), r = setTimeout(function() {
			r = void 0, n || e.apply(i, a);
		}, t);
	};
}
function O(e, t = 300) {
	let n, r, i;
	return function() {
		let a = this, o = arguments;
		n ? (clearTimeout(r), r = setTimeout(() => {
			Date.now() - i >= t && (e.apply(a, o), i = Date.now());
		}, Math.max(t - (Date.now() - i), 0))) : (e.apply(a, o), i = Date.now(), n = !0);
	};
}
function k(e) {
	return new Promise((t, n) => {
		let r = new Image();
		r.crossOrigin = "anonymous", r.addEventListener("error", n), r.addEventListener("load", (e) => {
			Promise.resolve(t(e.target)).then(() => {
				r.remove();
			});
		}), r.src = e;
	});
}
function A(e, ...t) {
	t = t === void 0 ? [] : t, document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => {
		e(...t);
	}) : e(...t);
}
var j = 96 / 64, M = {
	x: 0,
	y: 0,
	angle: 0
}, N = Symbol("normalized-tee-animation"), P = new Set([
	"normal",
	"angry",
	"pain",
	"happy",
	"dead",
	"surprise",
	"blink"
]);
function F(e, t) {
	if (typeof e != "number" || !Number.isFinite(e)) throw TypeError(`${t} must be a finite number`);
}
function I(e, t) {
	if (e === void 0) return;
	if (typeof e == "string") {
		if ([
			"linear",
			"ease",
			"ease-in",
			"ease-out",
			"ease-in-out"
		].includes(e)) return e;
		throw TypeError(`${t} is not a supported easing preset`);
	}
	if (!Array.isArray(e) || e.length !== 4) throw TypeError(`${t} must be an easing preset or four cubic-bezier values`);
	let n = e.map((e, n) => (F(e, `${t}[${n}]`), e));
	if (n[0] < 0 || n[0] > 1 || n[2] < 0 || n[2] > 1) throw TypeError(`${t} cubic-bezier x values must be between 0 and 1`);
	return Object.freeze(n);
}
function L(e, t) {
	if (e === void 0) return;
	if (!Array.isArray(e) || e.length === 0) throw TypeError(`${t} must contain at least one keyframe`);
	let n = e.map((e, n) => {
		if (typeof e != "object" || !e) throw TypeError(`${t}[${n}] must be an object`);
		if (F(e.time, `${t}[${n}].time`), e.time < 0 || e.time > 1) throw TypeError(`${t}[${n}].time must be between 0 and 1`);
		let r = {
			time: e.time,
			x: e.x ?? 0,
			y: e.y ?? 0,
			angle: e.angle ?? 0,
			scale: e.scale ?? 1
		};
		F(r.x, `${t}[${n}].x`), F(r.y, `${t}[${n}].y`), F(r.angle, `${t}[${n}].angle`), F(r.scale, `${t}[${n}].scale`);
		let i = I(e.easing, `${t}[${n}].easing`);
		return i !== void 0 && (r.easing = i), Object.freeze(r);
	}).sort((e, t) => e.time - t.time);
	for (let e = 1; e < n.length; e++) if (n[e - 1].time === n[e].time) throw TypeError(`${t} contains duplicate time ${n[e].time}`);
	return Object.freeze(n);
}
function R(e, t) {
	if (e === void 0) return;
	if (!Array.isArray(e) || e.length === 0) throw TypeError(`${t} must contain at least one keyframe`);
	let n = e.map((e, n) => {
		if (typeof e != "object" || !e) throw TypeError(`${t}[${n}] must be an object`);
		if (F(e.time, `${t}[${n}].time`), e.time < 0 || e.time > 1) throw TypeError(`${t}[${n}].time must be between 0 and 1`);
		if (!P.has(e.eyes)) throw TypeError(`${t}[${n}].eyes is not a supported tee eye type`);
		return Object.freeze({
			time: e.time,
			eyes: e.eyes
		});
	}).sort((e, t) => e.time - t.time);
	for (let e = 1; e < n.length; e++) if (n[e - 1].time === n[e].time) throw TypeError(`${t} contains duplicate time ${n[e].time}`);
	return Object.freeze(n);
}
function z(e) {
	if (typeof e != "object" || !e) throw TypeError("animation definition must be an object");
	if (e[N] === !0) return e;
	if (F(e.duration, "animation.duration"), e.duration <= 0) throw TypeError("animation.duration must be greater than zero");
	if (e.name !== void 0 && typeof e.name != "string") throw TypeError("animation.name must be a string");
	if (e.loop !== void 0 && typeof e.loop != "boolean") throw TypeError("animation.loop must be a boolean");
	if (e.fill !== void 0 && e.fill !== "none" && e.fill !== "forwards") throw TypeError("animation.fill must be 'none' or 'forwards'");
	let t;
	if (e.kind === "keyframes") {
		if (e.tracks === null || typeof e.tracks != "object") throw TypeError("animation.tracks must be an object");
		let n = {
			body: L(e.tracks.body, "animation.tracks.body"),
			backFoot: L(e.tracks.backFoot, "animation.tracks.backFoot"),
			frontFoot: L(e.tracks.frontFoot, "animation.tracks.frontFoot"),
			eyes: R(e.tracks.eyes, "animation.tracks.eyes")
		};
		if (!n.body && !n.backFoot && !n.frontFoot && !n.eyes) throw TypeError("animation.tracks must define at least one track");
		t = {
			kind: "keyframes",
			name: e.name,
			duration: e.duration,
			loop: e.loop ?? !1,
			fill: e.fill ?? "none",
			easing: I(e.easing, "animation.easing") ?? "linear",
			tracks: Object.freeze(n)
		};
	} else if (e.kind === "callback") {
		if (typeof e.frame != "function") throw TypeError("animation.frame must be a function");
		t = {
			kind: "callback",
			name: e.name,
			duration: e.duration,
			loop: e.loop ?? !1,
			fill: e.fill ?? "none",
			frame: e.frame
		};
	} else throw TypeError("animation.kind must be 'keyframes' or 'callback'");
	return Object.defineProperty(t, N, {
		value: !0,
		enumerable: !1
	}), Object.freeze(t);
}
var B = class {
	definition;
	finished;
	_playState = "running";
	_currentTime;
	_progress = 0;
	_iteration = 0;
	_deltaMs = 0;
	_lastTimestamp = null;
	_settled = !1;
	_released = !1;
	_loop;
	_fill;
	_playbackRate;
	_onUpdate;
	_onRelease;
	_resolveFinished;
	constructor(e, t = {}, n = () => void 0, r = () => void 0) {
		if (this.definition = z(e), t.loop !== void 0 && typeof t.loop != "boolean") throw TypeError("animation playback loop must be a boolean");
		if (t.fill !== void 0 && t.fill !== "none" && t.fill !== "forwards") throw TypeError("animation playback fill must be 'none' or 'forwards'");
		if (this._loop = t.loop ?? this.definition.loop ?? !1, this._fill = t.fill ?? this.definition.fill ?? "none", this._playbackRate = t.playbackRate ?? 1, this._currentTime = t.startAt ?? 0, this._onUpdate = n, this._onRelease = r, F(this._playbackRate, "animation playbackRate"), this._playbackRate <= 0) throw TypeError("animation playbackRate must be greater than zero");
		if (F(this._currentTime, "animation startAt"), this._currentTime < 0) throw TypeError("animation startAt must be zero or greater");
		this._loop || (this._currentTime = Math.min(this._currentTime, this.definition.duration)), this.updateProgress(), this.finished = new Promise((e) => {
			this._resolveFinished = e;
		});
	}
	get playState() {
		return this._playState;
	}
	get currentTime() {
		return this._currentTime;
	}
	get progress() {
		return this._progress;
	}
	get iteration() {
		return this._iteration;
	}
	get deltaMs() {
		return this._deltaMs;
	}
	get fillMode() {
		return this._fill;
	}
	pause() {
		this._playState === "running" && (this._playState = "paused", this._lastTimestamp = null, this._deltaMs = 0, this._onUpdate());
	}
	resume() {
		this._playState === "paused" && (this._playState = "running", this._lastTimestamp = null, this._deltaMs = 0, this._onUpdate());
	}
	seek(e) {
		if (!(this._playState === "stopped" || this._playState === "finished")) {
			if (F(e, "animation seek time"), e < 0) throw TypeError("animation seek time must be zero or greater");
			this._currentTime = this._loop ? e : Math.min(e, this.definition.duration), this._lastTimestamp = null, this._deltaMs = 0, this.updateProgress(), !this._loop && this._currentTime >= this.definition.duration ? this.complete() : this._onUpdate();
		}
	}
	stop() {
		this._playState !== "stopped" && (this._playState = "stopped", this.settle({ reason: "stopped" }), this.release());
	}
	advance(e) {
		if (this._playState === "running") {
			if (this._lastTimestamp !== null) {
				let t = Math.max(e - this._lastTimestamp, 0) * this._playbackRate;
				this._deltaMs = Math.min(t, 100), this._currentTime += t;
			} else this._deltaMs = 0;
			this._lastTimestamp = e, this.updateProgress(), !this._loop && this._currentTime >= this.definition.duration && (this._currentTime = this.definition.duration, this._progress = 1, this.complete());
		}
	}
	replace() {
		this.terminate("replaced");
	}
	destroy() {
		this.terminate("destroyed");
	}
	fail(e) {
		this.terminate("error", e);
	}
	updateProgress() {
		let e = this.definition.duration;
		this._loop ? (this._iteration = Math.floor(this._currentTime / e), this._progress = this._currentTime % e / e) : (this._iteration = 0, this._progress = Math.min(this._currentTime / e, 1));
	}
	complete() {
		this._playState === "finished" || this._playState === "stopped" || (this._playState = "finished", this._lastTimestamp = null, this.settle({ reason: "completed" }), this._fill === "none" ? this.release() : this._onUpdate());
	}
	terminate(e, t) {
		this._playState !== "stopped" && (this._playState = "stopped", this._lastTimestamp = null, this.settle(t === void 0 ? { reason: e } : {
			reason: e,
			error: t
		}), this.release());
	}
	settle(e) {
		this._settled || (this._settled = !0, this._resolveFinished(e));
	}
	release() {
		this._released || (this._released = !0, this._onRelease(this));
	}
}, V = {
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
}, H = {
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
}, U = {
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
}, W = {
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
}, ie = {
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
}, ae = {
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
}, oe = {
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
function G(e) {
	return e.scale === void 0 ? {
		x: e.x,
		y: e.y,
		angle: e.angle
	} : {
		x: e.x,
		y: e.y,
		angle: e.angle,
		scale: e.scale
	};
}
function K(e, t) {
	let n = {
		x: e.x + t.x,
		y: e.y + t.y,
		angle: e.angle + t.angle
	};
	return (e.scale !== void 0 || t.scale !== void 0) && (n.scale = (e.scale ?? 1) * (t.scale ?? 1)), n;
}
function q(e, t) {
	if (e.length === 0) return G(M);
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
	return G(M);
}
function J(e, t) {
	return {
		body: q(e.body, t),
		backFoot: q(e.backFoot, t),
		frontFoot: q(e.frontFoot, t)
	};
}
function se(e, t) {
	return (e % t + t) % t;
}
function Y(e, t, n) {
	let r = 1 - e;
	return 3 * r * r * e * t + 3 * r * e * e * n + e * e * e;
}
function ce(e, t, n) {
	let r = 1 - e;
	return 3 * r * r * t + 6 * r * e * (n - t) + 3 * e * e * (1 - n);
}
function le(e, t) {
	let [n, r, i, a] = t, o = e;
	for (let t = 0; t < 8; t++) {
		let t = Y(o, n, i) - e;
		if (Math.abs(t) < 1e-7) return Y(o, r, a);
		let s = ce(o, n, i);
		if (Math.abs(s) < 1e-7) break;
		o -= t / s;
	}
	let s = 0, c = 1;
	o = e;
	for (let t = 0; t < 20; t++) {
		let t = Y(o, n, i);
		if (Math.abs(t - e) < 1e-7) break;
		t < e ? s = o : c = o, o = (s + c) / 2;
	}
	return Y(o, r, a);
}
function ue(e, t) {
	let n = Math.min(Math.max(e, 0), 1);
	return t === "linear" ? n : le(n, typeof t == "string" ? {
		ease: [
			.25,
			.1,
			.25,
			1
		],
		"ease-in": [
			.42,
			0,
			1,
			1
		],
		"ease-out": [
			0,
			0,
			.58,
			1
		],
		"ease-in-out": [
			.42,
			0,
			.58,
			1
		]
	}[t] : t);
}
function X(e, t, n) {
	if (!e || e.length === 0) return G(M);
	let r = (e) => ({
		x: e.x,
		y: e.y,
		angle: e.angle,
		scale: e.scale
	});
	if (e.length === 1 || t <= e[0].time) return r(e[0]);
	let i = e[e.length - 1];
	if (t >= i.time) return r(i);
	for (let r = 1; r < e.length; r++) {
		let i = e[r - 1], a = e[r];
		if (i.time <= t && t <= a.time) {
			let e = ue((t - i.time) / (a.time - i.time), i.easing ?? n);
			return {
				x: i.x + (a.x - i.x) * e,
				y: i.y + (a.y - i.y) * e,
				angle: i.angle + (a.angle - i.angle) * e,
				scale: i.scale + (a.scale - i.scale) * e
			};
		}
	}
	return G(M);
}
function de(e, t) {
	if (!e || e.length === 0) return;
	let n = e[0].eyes;
	for (let r of e) {
		if (r.time > t) break;
		n = r.eyes;
	}
	return n;
}
function Z(e, t) {
	if (e === void 0) return G(M);
	if (typeof e != "object" || !e) throw TypeError(`${t} must be an object`);
	let n = {
		x: e.x ?? 0,
		y: e.y ?? 0,
		angle: e.angle ?? 0,
		scale: e.scale ?? 1
	};
	return F(n.x, `${t}.x`), F(n.y, `${t}.y`), F(n.angle, `${t}.angle`), F(n.scale, `${t}.scale`), n;
}
function fe(e) {
	if (typeof e != "object" || !e) throw TypeError("animation callback must return a pose object");
	if (e.eyes !== void 0 && !P.has(e.eyes)) throw TypeError("animation callback returned an unsupported eye type");
	return {
		body: Z(e.body, "animation callback body"),
		backFoot: Z(e.backFoot, "animation callback backFoot"),
		frontFoot: Z(e.frontFoot, "animation callback frontFoot"),
		eyes: e.eyes
	};
}
function pe(e, t) {
	let n = z(e), r = Math.min(Math.max(t.progress, 0), 1), i;
	if (n.kind === "keyframes") {
		let e = n.tracks, t = n.easing ?? "linear";
		i = {
			body: X(e.body, r, t),
			backFoot: X(e.backFoot, r, t),
			frontFoot: X(e.frontFoot, r, t),
			eyes: de(e.eyes, r)
		};
	} else i = fe(n.frame(Object.freeze({
		...t,
		progress: r
	})));
	let a = J(V, 0);
	return {
		mode: "custom",
		phase: r,
		body: K(a.body, i.body),
		backFoot: K(a.backFoot, i.backFoot),
		frontFoot: K(a.frontFoot, i.frontFoot),
		eyes: i.eyes
	};
}
function me(e, t, n) {
	let r = Number.isFinite(e) ? e : 0;
	return t ? "inAir" : Math.abs(r) <= .00390625 ? n ? "sit" : "idle" : Math.abs(r) >= 19.53125 ? "run" : "walk";
}
function he(e) {
	let t = Number.isFinite(e.speed) ? e.speed : 0, n = me(t, e.inAir, e.afk), r = 0, i = H;
	n === "inAir" ? i = U : n === "sit" ? i = W : n === "walk" ? (i = ie, r = se(e.distance, 100) / 100) : n === "run" && (i = t < 0 ? ae : oe, r = se(e.distance, 200) / 200);
	let a = J(V, 0), o = J(i, r);
	return {
		mode: n,
		phase: r,
		body: K(a.body, o.body),
		backFoot: K(a.backFoot, o.backFoot),
		frontFoot: K(a.frontFoot, o.frontFoot)
	};
}
//#endregion
//#region src/tee.ts
var ge = /* @__PURE__ */ t({
	TeeRenderer: () => _e,
	createAsync: () => ye,
	createContainerElements: () => ve,
	createRendererAsync: () => Q,
	initializeAsync: () => $
}), _e = class {
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
	_customAnimation = null;
	_debounceUpdateTeeImage;
	_animationFrameCallback = (e) => {
		if (this._animationFrameId = null, this._animationLastTimestamp !== null) {
			let t = Math.min(Math.max((e - this._animationLastTimestamp) / 1e3, 0), .1);
			Math.abs(this._speed) > .00390625 && (this._animationDistance += this._speed * 50 * t, this._animationDistance %= 200);
		}
		this._customAnimation?.advance(e), this._animationLastTimestamp = e, this.applyAnimationFrame(), this.updateAnimationLoop();
	};
	constructor(e, t) {
		if (e.tee !== void 0) throw Error("TeeRenderer already initialized on this container");
		Object.defineProperty(e, "tee", {
			value: this,
			writable: !1
		}), this._container = e, this._colorBody = t.colorBody, this._colorFeet = t.colorFeet, this._useCustomColor = t.useCustomColor === void 0 ? t.colorBody !== void 0 || t.colorFeet !== void 0 : t.useCustomColor, this._eyes = t.eyes ?? "normal", this._speed = Number.isFinite(t.speed) ? t.speed : 0, this._inAir = t.inAir ?? !1, this._fat = t.fat ?? !1, this._afk = t.afk ?? !1, this._skinUrl = t.skinUrl, this._fat && this._container.classList.add("tee_fat"), this._afk && this._container.classList.add("tee_afk"), this._container.classList.add("tee_initialized"), this._container.classList.remove("tee_initializing"), this._debounceUpdateTeeImage = D(this.updateTeeImage, 10), this._container.dataset.speed = String(this._speed), this._container.dataset.inAir = this._inAir ? "true" : "false", this.applyAnimationFrame(), this.updateAnimationLoop(), this.addEventListener("tee:rendered", () => {
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
		this._eyes !== e && (this._eyes = e, this.applyAnimationFrame());
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
		this._fat !== e && (this._fat = e, this._container.classList.toggle("tee_fat", e), this.applyAnimationFrame());
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
	get currentAnimation() {
		return this._customAnimation;
	}
	playAnimation(e, t = {}) {
		this._customAnimation?.replace();
		let n;
		return n = new B(e, t, () => {
			this._customAnimation === n && (this.applyAnimationFrame(), this.updateAnimationLoop());
		}, (e) => this.releaseCustomAnimation(e)), this._customAnimation = n, this._container.classList.add("tee_custom_animation"), this.applyAnimationFrame(), this.updateAnimationLoop(), n;
	}
	stopAnimation() {
		this._customAnimation?.stop();
	}
	releaseCustomAnimation(e) {
		this._customAnimation === e && (this._customAnimation = null, this._container.classList.remove("tee_custom_animation"), this.applyAnimationFrame(), this.updateAnimationLoop());
	}
	mouseFollowThrottleCallbackFactory() {
		return O((e) => {
			let t = this._container.getBoundingClientRect(), n = e.clientX - (t.x + t.width / 2), r = e.clientY - (t.y + t.height / 2 - t.height * .125), i = Math.atan2(r, n), a = Math.cos(i) * .125 * t.width, o = Math.sin(i) * .1 * t.height;
			this._container.style.setProperty("--tee-eye-follow-x", `${a.toFixed(4)}px`), this._container.style.setProperty("--tee-eye-follow-y", `${o.toFixed(4)}px`);
		}, 20);
	}
	getAnimationFrame() {
		if (this._customAnimation !== null) {
			let e = this._customAnimation;
			try {
				return pe(e.definition, {
					progress: e.progress,
					elapsedMs: e.currentTime,
					deltaMs: e.deltaMs,
					iteration: e.iteration,
					speed: this._speed,
					inAir: this._inAir,
					afk: this._afk
				});
			} catch (t) {
				console.error("TeeRenderer: custom animation callback failed", t), e.fail(t);
			}
		}
		return he({
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
		this.setAnimationStyle("--tee-body-x", e.body.x * j), this.setAnimationStyle("--tee-body-y", e.body.y * j), this.setAnimationStyle("--tee-body-angle", e.body.angle * Math.PI * 2, "rad"), this.setAnimationStyle("--tee-body-scale", (e.body.scale ?? 1) * (this._fat ? T : 1), ""), this.setAnimationStyle("--tee-back-foot-x", e.backFoot.x * j), this.setAnimationStyle("--tee-back-foot-y", e.backFoot.y * j), this.setAnimationStyle("--tee-back-foot-angle", e.backFoot.angle * Math.PI * 2, "rad"), this.setAnimationStyle("--tee-back-foot-scale", (e.backFoot.scale ?? 1) * S, ""), this.setAnimationStyle("--tee-front-foot-x", e.frontFoot.x * j), this.setAnimationStyle("--tee-front-foot-y", e.frontFoot.y * j), this.setAnimationStyle("--tee-front-foot-angle", e.frontFoot.angle * Math.PI * 2, "rad"), this.setAnimationStyle("--tee-front-foot-scale", (e.frontFoot.scale ?? 1) * S, ""), this._container.dataset.eyes = e.eyes ?? this._eyes;
	}
	updateAnimationLoop() {
		if (!(Math.abs(this._speed) > .00390625 || this._customAnimation?.playState === "running")) {
			this._animationFrameId !== null && (cancelAnimationFrame(this._animationFrameId), this._animationFrameId = null), this._animationLastTimestamp = null;
			return;
		}
		this._animationFrameId === null && (this._animationFrameId = requestAnimationFrame(this._animationFrameCallback));
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
		let n = t?.size ?? 96, r = n / 96, s = n / 64, c = this.getAnimationFrame(), d = t?.eyes ?? c.eyes ?? this._eyes, f = e.getContext("2d");
		if (!f) return;
		e.width = n, e.height = n, f.clearRect(0, 0, n, n);
		let p = new OffscreenCanvas(this._skinBitmap.width, this._skinBitmap.height), w = p.getContext("2d", { willReadFrequently: !0 });
		if (w.drawImage(this._skinBitmap, 0, 0), this.useCustomColor) {
			let e = this.colorBodyRgba || i(0), t = this.colorFeetRgba || i(0), n = w.getImageData(0, 0, p.width, p.height), r = n.data, s = p.width, c = p.height, l = s * y.xStart, u = s * y.xEnd, d = c * y.yStart, f = c * y.yEnd, m = a(r, s, {
				x: 0,
				y: 0,
				w: Math.floor(s * b.xEnd),
				h: Math.floor(c * b.yEnd)
			});
			for (let n = 0; n < r.length; n += 4) {
				let i = n / 4 % s, a = Math.floor(n / 4 / s), c = o((r[n] + r[n + 1] + r[n + 2]) / 3, m), p = i >= l && i < u && a >= d && a < f ? t : e;
				r[n] = c * p[0] / 255, r[n + 1] = c * p[1] / 255, r[n + 2] = c * p[2] / 255, r[n + 3] = r[n + 3] * p[3] / 255;
			}
			w.putImageData(n, 0, 0);
		}
		let E = this._skinBitmap.width / 256, D = this._skinBitmap.height / 128, O = n / 2, k = n / 2, A = {
			x: O + c.body.x * s,
			y: k + c.body.y * s
		}, j = (e, t, n, r, i, a = 0, o = !1) => {
			f.save(), f.translate(t, n), f.rotate(a), o && f.scale(-1, 1), f.drawImage(p, e.x * E, e.y * D, e.w * E, e.h * D, -r / 2, -i / 2, r, i), f.restore();
		}, M = l.w * r * (this._fat ? T : 1) * (c.body.scale ?? 1), N = _.w * S * r * (c.backFoot.scale ?? 1), P = _.h * C * r * (c.backFoot.scale ?? 1), F = _.w * S * r * (c.frontFoot.scale ?? 1), I = _.h * C * r * (c.frontFoot.scale ?? 1), L = {
			x: O + c.backFoot.x * s,
			y: k + c.backFoot.y * s
		}, R = {
			x: O + c.frontFoot.x * s,
			y: k + c.frontFoot.y * s
		}, z = {
			normal: m,
			angry: h,
			pain: ee,
			happy: te,
			dead: g,
			surprise: ne,
			blink: m
		}[d] ?? m, B = m.w * x * r, V = d === "blink" ? B * .375 : B, H = re * r, U = A.y - n * .125, W = c.body.angle * Math.PI * 2;
		j(v, L.x, L.y, N, P, c.backFoot.angle * Math.PI * 2), j(u, A.x, A.y, M, M, W), j(v, R.x, R.y, F, I, c.frontFoot.angle * Math.PI * 2), j(_, L.x, L.y, N, P, c.backFoot.angle * Math.PI * 2), j(l, A.x, A.y, M, M, W), j(z, A.x - H, U, B, V, W), j(z, A.x + H, U, B, V, W, !0), j(_, R.x, R.y, F, I, c.frontFoot.angle * Math.PI * 2);
	}
	destroy() {
		this.followMouse = !1, this._customAnimation?.destroy(), this._animationFrameId !== null && (cancelAnimationFrame(this._animationFrameId), this._animationFrameId = null), this._animationLastTimestamp = null, this._currentObjectUrl &&= (URL.revokeObjectURL(this._currentObjectUrl), null), this._skinBitmap &&= (this._skinBitmap.close(), null), this._offscreen = null, this._offscreenContext = null, this._cachedColorKey = null, this._skinLoadedCallback = null;
		for (let e of [
			"--tee-body-x",
			"--tee-body-y",
			"--tee-body-angle",
			"--tee-body-scale",
			"--tee-back-foot-x",
			"--tee-back-foot-y",
			"--tee-back-foot-angle",
			"--tee-back-foot-scale",
			"--tee-front-foot-x",
			"--tee-front-foot-y",
			"--tee-front-foot-angle",
			"--tee-front-foot-scale"
		]) this._container.style.removeProperty(e);
		this.setSkinVariableValue(null), this._container.classList.remove("tee_initialized", "tee_rendered", "tee_custom_animation");
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
			this._skinLoading = !0, this._skinLoadedCallback = null, this._skinLoadingPromise = k(e).then(async (e) => {
				this._skinBitmap = await createImageBitmap(e), this._cachedColorKey = null, this._skinUrl = e.src, this._container.dataset.skin = this._skinUrl, n(!0);
			}).catch(() => {
				console.warn(`TeeRenderer: cannot load skin '${e}'`), n(!1);
			});
		}
		return this._skinLoadingPromise;
	}
};
function ve(e) {
	let t = document.createElement("div"), n = document.createElement("div"), r = document.createElement("div"), i = document.createElement("div"), a = document.createElement("div");
	t.classList.add("tee__eyes"), n.classList.add("tee__foot"), n.classList.add("tee__foot_back"), n.classList.add("tee__foot_outline"), r.classList.add("tee__foot"), r.classList.add("tee__foot_back"), i.classList.add("tee__foot"), i.classList.add("tee__foot_front"), i.classList.add("tee__foot_outline"), a.classList.add("tee__foot"), a.classList.add("tee__foot_front"), e.replaceChildren(), e.appendChild(t), e.appendChild(n), e.appendChild(r), e.appendChild(i), e.appendChild(a), e.eyes = t;
}
function Q(e, t) {
	return new Promise((n, r) => {
		setTimeout(() => {
			r();
		}, 2e4);
		try {
			e.classList.add("tee_initializing"), ve(e), new _e(e, t).addEventListener("tee:skin-loaded", (e) => {
				n(e.detail.tee);
			}, { once: !0 });
		} catch {
			e.classList.remove("tee_initializing"), r();
		}
	});
}
async function $(e = !0) {
	let t = [...document.querySelectorAll(".tee:not(.tee_initialized):not(.tee_initializing)")].map((e) => Q(e, {
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
async function ye(e) {
	let t = document.createElement("div");
	e.colorBody !== void 0 && (t.dataset.colorBody = e.colorBody + ""), e.colorFeet !== void 0 && (t.dataset.colorFeet = e.colorFeet + ""), e.useCustomColor !== void 0 && (t.dataset.useCustomColor = e.useCustomColor ? "true" : "false"), e.eyes !== void 0 && (t.dataset.eyes = e.eyes), e.followMouse !== void 0 && (t.dataset.followMouse = e.followMouse ? "true" : "false"), e.speed !== void 0 && (t.dataset.speed = String(e.speed)), e.inAir !== void 0 && (t.dataset.inAir = e.inAir ? "true" : "false"), e.fat !== void 0 && (t.dataset.fat = e.fat ? "true" : "false"), e.afk !== void 0 && (t.dataset.afk = e.afk ? "true" : "false"), t.dataset.skin = e.skinUrl, t.classList.add("tee");
	let n = await Q(t, e);
	return n.update(), n.container;
}
//#endregion
//#region src/index.ts
var be = Object.freeze({ define: z });
A(() => {
	$();
});
//#endregion
export { be as animation, c as atlas, n as color, ye as createAsync, z as defineAnimation, E as helpers, $ as init, ge as renderer };

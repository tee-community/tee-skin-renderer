var F = Object.defineProperty;
var E = (o, e, s) => e in o ? F(o, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : o[e] = s;
var l = (o, e, s) => (E(o, typeof e != "symbol" ? e + "" : e, s), s);
function f(o) {
  return [
    (o >> 16 & 255) * 360 / 255,
    (o >> 8 & 255) * 100 / 255,
    ((o & 255) / 2 + 128) * 100 / 255
  ];
}
function u(o) {
  return p(f(o));
}
function p(o, e = 255) {
  const s = o[0] / 360, t = o[1] / 100, i = o[2] / 100;
  let n, r, d;
  if (t === 0)
    return d = i * 255, [d, d, d, e];
  i < 0.5 ? n = i * (1 + t) : n = i + t - i * t;
  const c = 2 * i - n, a = [0, 0, 0, e];
  for (let h = 0; h < 3; h++)
    r = s + 1 / 3 * -(h - 1), r < 0 && r++, r > 1 && r--, 6 * r < 1 ? d = c + (n - c) * 6 * r : 2 * r < 1 ? d = n : 3 * r < 2 ? d = c + (n - c) * (2 / 3 - r) * 6 : d = c, a[h] = d * 255;
  return a;
}
const R = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  convertHslToRgba: p,
  convertTeeColorToHsl: f,
  convertTeeColorToRgba: u
}, Symbol.toStringTag, { value: "Module" }));
function C(o, e, s = !1) {
  let t;
  return function() {
    let i = this, n = arguments;
    clearTimeout(t), s && !t && o.apply(i, n), t = setTimeout(function() {
      t = void 0, s || o.apply(i, n);
    }, e);
  };
}
function g(o, e = 300) {
  let s, t, i;
  return function() {
    const n = this, r = arguments;
    s ? (clearTimeout(t), t = setTimeout(() => {
      Date.now() - i >= e && (o.apply(n, r), i = Date.now());
    }, Math.max(e - (Date.now() - i), 0))) : (o.apply(n, r), i = Date.now(), s = !0);
  };
}
function k(o) {
  return new Promise((e, s) => {
    const t = new Image();
    t.crossOrigin = "anonymous", t.addEventListener("error", s), t.addEventListener("load", (i) => {
      Promise.resolve(e(i.target)).then(() => {
        t.remove();
      });
    }), t.src = o;
  });
}
function w(o, ...e) {
  e = e !== void 0 ? e : [], document.readyState !== "loading" ? o(...e) : document.addEventListener("DOMContentLoaded", () => {
    o(...e);
  });
}
const x = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  debounce: C,
  domReady: w,
  loadImage: k,
  throttle: g
}, Symbol.toStringTag, { value: "Module" }));
class L {
  constructor(e, s) {
    l(this, "_container");
    l(this, "_eyes");
    l(this, "_colorBody");
    l(this, "_colorFeet");
    l(this, "_useCustomColor");
    l(this, "_followMouseFn", null);
    l(this, "_skinUrl");
    l(this, "_skinBitmap", null);
    l(this, "_skinLoading", !1);
    l(this, "_skinLoadingPromise", null);
    l(this, "_skinLoadedCallback", null);
    l(this, "_offscreen", null);
    l(this, "_offscreenContext", null);
    l(this, "_image", null);
    l(this, "_debounceUpdateTeeImage");
    if (e.tee !== void 0)
      throw new Error("TeeRenderer already initialized on this container");
    Object.defineProperty(e, "tee", {
      value: this,
      writable: !1
    }), this._container = e, this._colorBody = s.colorBody, this._colorFeet = s.colorFeet, this._useCustomColor = s.useCustomColor !== void 0 ? s.useCustomColor : s.colorBody !== void 0 || s.colorFeet !== void 0, this._eyes = s.eyes ?? "normal", this._skinUrl = s.skinUrl, this._container.classList.add("tee_initialized"), this._container.classList.remove("tee_initializing"), this._debounceUpdateTeeImage = C(this.updateTeeImage, 10), this.addEventListener("tee:rendered", () => {
      this._container.classList.add("tee_rendered");
    }, {
      once: !0
    }), this.followMouse = s.followMouse === !0, this.loadSkin(this._skinUrl, !1);
  }
  get container() {
    return this._container;
  }
  get colorBody() {
    return this._colorBody;
  }
  set colorBody(e) {
    e === void 0 && delete this._container.dataset.colorBody, this._colorBody = Number(e), this.update();
  }
  get colorBodyHsl() {
    return this._colorBody === void 0 ? void 0 : f(this._colorBody);
  }
  get colorBodyRgba() {
    return this._colorBody === void 0 ? void 0 : u(this._colorBody);
  }
  get colorFeet() {
    return this._colorFeet;
  }
  set colorFeet(e) {
    e === void 0 && delete this._container.dataset.colorFeet, this._colorFeet = Number(e), this.update();
  }
  get colorFeetHsl() {
    return this._colorFeet === void 0 ? void 0 : f(this._colorFeet);
  }
  get colorFeetRgba() {
    return this._colorFeet === void 0 ? void 0 : u(this._colorFeet);
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
  get followMouse() {
    return this._followMouseFn !== null;
  }
  set followMouse(e) {
    this.followMouse !== e && (e ? (this._followMouseFn = this.mouseFollowThrottleCallbackFactory(), document.addEventListener("mousemove", this._followMouseFn), this._container.dataset.followMouse = "true") : (document.removeEventListener("mousemove", this._followMouseFn), this._followMouseFn = null, this._container.dataset.followMouse = "false"));
  }
  mouseFollowThrottleCallbackFactory() {
    return g((s) => {
      const t = this._container.getBoundingClientRect(), i = s.clientX - (t.x + t.width / 2), n = s.clientY - (t.y + t.height / 2 - t.height * 0.125), r = Math.atan2(n, i), d = Math.cos(r) * 0.125 * t.width, c = Math.sin(r) * 0.1 * t.height;
      this._container.eyes.style.transform = `translate(${d.toFixed(4)}px, ${c.toFixed(4)}px)`;
    }, 20);
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
  updateTeeImage() {
    if (this._skinBitmap !== null) {
      if (this._offscreen === null ? (this._offscreen = new OffscreenCanvas(this._skinBitmap.width, this._skinBitmap.height), this._offscreenContext = this._offscreen.getContext("2d", {
        willReadFrequently: !0
      })) : ((this._offscreen.width !== this._skinBitmap.width || this._offscreen.height !== this._skinBitmap.height) && (this._offscreen.width = this._skinBitmap.width, this._offscreen.height = this._skinBitmap.height), this._offscreenContext.clearRect(0, 0, this._offscreen.width, this._offscreen.height)), this._offscreenContext.drawImage(this._skinBitmap, 0, 0), this.useCustomColor) {
        const e = this.colorBodyRgba || u(0), s = this.colorFeetRgba || u(0), t = this._offscreenContext.getImageData(0, 0, this._offscreen.width, this._offscreen.height), i = t.data, n = this._offscreen.width * (6 / 8), r = this._offscreen.width * (8 / 8), d = this._offscreen.height * (1 / 4), c = this._offscreen.height * (3 / 4);
        for (let a = 0; a < i.length; a += 4) {
          const h = a / 4 % this._offscreen.width, v = Math.floor(a / 4 / this._offscreen.width), m = (i[a] + i[a + 1] + i[a + 2]) / 3, _ = h >= n && h <= r && v >= d && v <= c ? s : e;
          i[a] = m * _[0] / 255, i[a + 1] = m * _[1] / 255, i[a + 2] = m * _[2] / 255, i[a + 3] = i[a + 3] * _[3] / 255;
        }
        this._offscreenContext.putImageData(t, 0, 0);
      }
      this._offscreen.convertToBlob().then((e) => {
        const s = URL.createObjectURL(e), t = this._image || (this._image = new Image());
        t.onload = () => {
          this.setSkinVariableValue(`url('${s}')`), this.dispatchEvent("tee:rendered");
        }, t.src = s;
      });
    }
  }
  dispatchEvent(...e) {
    this._container.dispatchEvent(new CustomEvent(e[0], {
      detail: {
        tee: this,
        payload: e[1] || void 0
      }
    }));
  }
  addEventListener(e, s, t) {
    this._container.addEventListener(
      e,
      s,
      t
    );
  }
  removeEventListener(e, s, t) {
    this._container.removeEventListener(
      e,
      s,
      t
    );
  }
  update() {
    this._debounceUpdateTeeImage();
  }
  loadSkin(e, s) {
    if (this._skinLoading)
      this._skinLoadedCallback = () => this.loadSkin(e, s);
    else {
      const t = (i) => {
        this._skinLoadingPromise = null, this._skinLoading = !1, this.dispatchEvent("tee:skin-loaded", {
          skin: e,
          success: i
        }), s && this.update(), this._skinLoadedCallback && this._skinLoadedCallback(), this._skinLoadedCallback = null;
      };
      this._skinLoading = !0, this._skinLoadedCallback = null, this._skinLoadingPromise = k(e).then(async (i) => {
        this._skinBitmap = await createImageBitmap(i), this._skinUrl = i.src, this._container.dataset.skin = this._skinUrl, t(!0);
      }).catch(() => {
        console.warn(`TeeRenderer: cannot load skin '${e}'`), t(!1);
      });
    }
    return this._skinLoadingPromise;
  }
}
function b(o) {
  const e = document.createElement("div"), s = document.createElement("div"), t = document.createElement("div"), i = document.createElement("div"), n = document.createElement("div");
  e.classList.add("tee__eyes"), s.classList.add("tee__foot"), s.classList.add("tee__foot_left"), s.classList.add("tee__foot_outline"), t.classList.add("tee__foot"), t.classList.add("tee__foot_left"), i.classList.add("tee__foot"), i.classList.add("tee__foot_right"), i.classList.add("tee__foot_outline"), n.classList.add("tee__foot"), n.classList.add("tee__foot_right"), o.replaceChildren(), o.appendChild(e), o.appendChild(s), o.appendChild(t), o.appendChild(i), o.appendChild(n), o.eyes = e;
}
function y(o, e) {
  return new Promise((s, t) => {
    setTimeout(() => {
      t();
    }, 2e4);
    try {
      o.classList.add("tee_initializing"), b(o), new L(o, e).addEventListener("tee:skin-loaded", (n) => {
        s(n.detail.tee);
      }, {
        once: !0
      });
    } catch {
      o.classList.remove("tee_initializing"), t();
    }
  });
}
async function B(o = !0) {
  const s = [...document.querySelectorAll(".tee:not(.tee_initialized):not(.tee_initializing")].map((t) => y(t, {
    colorBody: parseInt(t.dataset.colorBody) || void 0,
    colorFeet: parseInt(t.dataset.colorFeet) || void 0,
    useCustomColor: t.dataset.useCustomColor !== void 0 ? t.dataset.useCustomColor === "true" : void 0,
    eyes: t.dataset.eyes,
    followMouse: t.dataset.followMouse !== void 0 ? t.dataset.followMouse === "true" : void 0,
    skinUrl: t.dataset.skin
  }));
  o ? await Promise.allSettled(s).then((t) => {
    t.forEach((i) => {
      if (i.status === "fulfilled")
        try {
          i.value.update();
        } catch {
        }
    });
  }) : s.forEach((t) => {
    t.then((i) => i.update());
  });
}
async function M(o) {
  const e = document.createElement("div");
  o.colorBody !== void 0 && (e.dataset.colorBody = o.colorBody + ""), o.colorFeet !== void 0 && (e.dataset.colorFeet = o.colorFeet + ""), o.useCustomColor !== void 0 && (e.dataset.useCustomColor = o.useCustomColor ? "true" : "false"), o.eyes !== void 0 && (e.dataset.eyes = o.eyes), o.followMouse !== void 0 && (e.dataset.followMouse = o.followMouse ? "true" : "false"), e.dataset.skin = o.skinUrl, e.classList.add("tee");
  const s = await y(e, o);
  return s.update(), s.container;
}
const S = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TeeRenderer: L,
  createAsync: M,
  createContainerElements: b,
  createRendererAsync: y,
  initializeAsync: B
}, Symbol.toStringTag, { value: "Module" }));
w(() => {
  B();
});
export {
  R as color,
  M as createAsync,
  x as helpers,
  B as init,
  S as renderer
};

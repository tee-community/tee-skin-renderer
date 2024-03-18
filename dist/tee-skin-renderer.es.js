var w = Object.defineProperty;
var E = (o, e, s) => e in o ? w(o, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : o[e] = s;
var a = (o, e, s) => (E(o, typeof e != "symbol" ? e + "" : e, s), s);
function f(o) {
  return [
    (o >> 16 & 255) * 360 / 255,
    (o >> 8 & 255) * 100 / 255,
    ((o & 255) / 2 + 128) * 100 / 255
  ];
}
function _(o) {
  return C(f(o));
}
function C(o, e = 255) {
  const s = o[0] / 360, t = o[1] / 100, i = o[2] / 100;
  let r, l, d;
  if (t === 0)
    return d = i * 255, [d, d, d, e];
  i < 0.5 ? r = i * (1 + t) : r = i + t - i * t;
  const c = 2 * i - r, n = [0, 0, 0, e];
  for (let h = 0; h < 3; h++)
    l = s + 1 / 3 * -(h - 1), l < 0 && l++, l > 1 && l--, 6 * l < 1 ? d = c + (r - c) * 6 * l : 2 * l < 1 ? d = r : 3 * l < 2 ? d = c + (r - c) * (2 / 3 - l) * 6 : d = c, n[h] = d * 255;
  return n;
}
const R = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  convertHslToRgba: C,
  convertTeeColorToHsl: f,
  convertTeeColorToRgba: _
}, Symbol.toStringTag, { value: "Module" }));
function p(o, e, s = !1) {
  let t;
  return function() {
    let i = this, r = arguments;
    clearTimeout(t), s && !t && o.apply(i, r), t = setTimeout(function() {
      t = void 0, s || o.apply(i, r);
    }, e);
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
function y(o, ...e) {
  e = e !== void 0 ? e : [], document.readyState !== "loading" ? o(...e) : document.addEventListener("DOMContentLoaded", () => {
    o(...e);
  });
}
const S = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  debounce: p,
  domReady: y,
  loadImage: k
}, Symbol.toStringTag, { value: "Module" }));
class L {
  constructor(e, s) {
    a(this, "_container");
    a(this, "_colorBody");
    a(this, "_colorFeet");
    a(this, "_useCustomColor");
    a(this, "_skinUrl");
    a(this, "_skinBitmap", null);
    a(this, "_skinLoading", !1);
    a(this, "_skinLoadingPromise", null);
    a(this, "_skinLoadedCallback", null);
    a(this, "_offscreen", null);
    a(this, "_offscreenContext", null);
    a(this, "_image", null);
    a(this, "_debounceUpdateTeeImage");
    if (e.tee !== void 0)
      throw new Error("TeeRenderer already initialized on this container");
    Object.defineProperty(e, "tee", {
      value: this,
      writable: !1
    }), this._container = e, this._colorBody = s.colorBody, this._colorFeet = s.colorFeet, this._useCustomColor = s.useCustomColor !== void 0 ? s.useCustomColor : s.colorBody !== void 0 || s.colorFeet !== void 0, this._skinUrl = s.skinUrl, this._debounceUpdateTeeImage = p(this.updateTeeImage, 10), this._container.classList.add("tee_initialized"), this._container.classList.remove("tee_initializing"), this.addEventListener("tee:rendered", () => {
      this._container.classList.add("tee_rendered");
    }, {
      once: !0
    }), this.loadSkin(this._skinUrl, !1);
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
    return this._colorBody === void 0 ? void 0 : _(this._colorBody);
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
    return this._colorFeet === void 0 ? void 0 : _(this._colorFeet);
  }
  get useCustomColor() {
    return this._useCustomColor;
  }
  set useCustomColor(e) {
    this._container.dataset.useCustomColor = e ? "true" : "false", this._useCustomColor = e, this.update();
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
        const e = this.colorBodyRgba || _(0), s = this.colorFeetRgba || _(0), t = this._offscreenContext.getImageData(0, 0, this._offscreen.width, this._offscreen.height), i = t.data, r = this._offscreen.width * (6 / 8), l = this._offscreen.width * (8 / 8), d = this._offscreen.height * (1 / 4), c = this._offscreen.height * (3 / 4);
        for (let n = 0; n < i.length; n += 4) {
          const h = n / 4 % this._offscreen.width, g = Math.floor(n / 4 / this._offscreen.width), m = (i[n] + i[n + 1] + i[n + 2]) / 3, u = h >= r && h <= l && g >= d && g <= c ? s : e;
          i[n] = m * u[0] / 255, i[n + 1] = m * u[1] / 255, i[n + 2] = m * u[2] / 255, i[n + 3] = i[n + 3] * u[3] / 255;
        }
        this._offscreenContext.putImageData(t, 0, 0);
      }
      this._offscreen.convertToBlob().then((e) => {
        const s = URL.createObjectURL(e), t = this._image || (this._image = new Image());
        t.onload = () => {
          this.setSkinVariableValue(`url('${s}')`), this.dispatchEvent("tee:rendered"), t.remove();
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
function B(o) {
  const e = document.createElement("div"), s = document.createElement("div"), t = document.createElement("div"), i = document.createElement("div");
  e.classList.add("tee__foot"), e.classList.add("tee__foot_left"), e.classList.add("tee__foot_outline"), s.classList.add("tee__foot"), s.classList.add("tee__foot_left"), t.classList.add("tee__foot"), t.classList.add("tee__foot_right"), t.classList.add("tee__foot_outline"), i.classList.add("tee__foot"), i.classList.add("tee__foot_right"), o.replaceChildren(), o.appendChild(e), o.appendChild(s), o.appendChild(t), o.appendChild(i);
}
function v(o, e) {
  return new Promise((s, t) => {
    setTimeout(() => {
      t();
    }, 2e4);
    try {
      o.classList.add("tee_initializing"), B(o), new L(o, e).addEventListener("tee:skin-loaded", (r) => {
        s(r.detail.tee);
      }, {
        once: !0
      });
    } catch {
      o.classList.remove("tee_initializing"), t();
    }
  });
}
async function b(o = !0) {
  const s = [...document.querySelectorAll(".tee:not(.tee_initialized):not(.tee_initializing")].map((t) => v(t, {
    colorBody: parseInt(t.dataset.colorBody) || void 0,
    colorFeet: parseInt(t.dataset.colorFeet) || void 0,
    useCustomColor: t.dataset.useCustomColor !== void 0 ? t.dataset.useCustomColor === "true" : void 0,
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
async function F(o) {
  const e = document.createElement("div");
  o.colorBody !== void 0 && (e.dataset.colorBody = o.colorBody + ""), o.colorFeet !== void 0 && (e.dataset.colorFeet = o.colorFeet + ""), o.useCustomColor !== void 0 && (e.dataset.useCustomColor = o.useCustomColor ? "true" : "false"), e.dataset.skin = o.skinUrl, e.classList.add("tee");
  const s = await v(e, o);
  return s.update(), s.container;
}
const U = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TeeRenderer: L,
  createAsync: F,
  createContainerElements: B,
  createRendererAsync: v,
  initializeAsync: b
}, Symbol.toStringTag, { value: "Module" }));
y(() => {
  b();
});
export {
  R as color,
  F as createAsync,
  S as helpers,
  b as init,
  U as renderer
};

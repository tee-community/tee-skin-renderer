(function(n,r){typeof exports=="object"&&typeof module<"u"?r(exports):typeof define=="function"&&define.amd?define(["exports"],r):(n=typeof globalThis<"u"?globalThis:n||self,r(n.TeeSkinRenderer={}))})(this,function(n){"use strict";var S=Object.defineProperty;var U=(n,r,h)=>r in n?S(n,r,{enumerable:!0,configurable:!0,writable:!0,value:h}):n[r]=h;var d=(n,r,h)=>(U(n,typeof r!="symbol"?r+"":r,h),h);function r(o){return[(o>>16&255)*360/255,(o>>8&255)*100/255,((o&255)/2+128)*100/255]}function h(o){return C(r(o))}function C(o,e=255){const i=o[0]/360,t=o[1]/100,s=o[2]/100;let l,c,u;if(t===0)return u=s*255,[u,u,u,e];s<.5?l=s*(1+t):l=s+t-s*t;const _=2*s-l,a=[0,0,0,e];for(let f=0;f<3;f++)c=i+1/3*-(f-1),c<0&&c++,c>1&&c--,6*c<1?u=_+(l-_)*6*c:2*c<1?u=l:3*c<2?u=_+(l-_)*(2/3-c)*6:u=_,a[f]=u*255;return a}const F=Object.freeze(Object.defineProperty({__proto__:null,convertHslToRgba:C,convertTeeColorToHsl:r,convertTeeColorToRgba:h},Symbol.toStringTag,{value:"Module"}));function k(o,e,i=!1){let t;return function(){let s=this,l=arguments;clearTimeout(t),i&&!t&&o.apply(s,l),t=setTimeout(function(){t=void 0,i||o.apply(s,l)},e)}}function y(o){return new Promise((e,i)=>{const t=new Image;t.crossOrigin="anonymous",t.addEventListener("error",i),t.addEventListener("load",s=>{Promise.resolve(e(s.target)).then(()=>{t.remove()})}),t.src=o})}function L(o,...e){e=e!==void 0?e:[],document.readyState!=="loading"?o(...e):document.addEventListener("DOMContentLoaded",()=>{o(...e)})}const T=Object.freeze(Object.defineProperty({__proto__:null,debounce:k,domReady:L,loadImage:y},Symbol.toStringTag,{value:"Module"}));class b{constructor(e,i){d(this,"_container");d(this,"_colorBody");d(this,"_colorFeet");d(this,"_useCustomColor");d(this,"_skinUrl");d(this,"_skinBitmap",null);d(this,"_skinLoading",!1);d(this,"_skinLoadingPromise",null);d(this,"_skinLoadedCallback",null);d(this,"_offscreen",null);d(this,"_offscreenContext",null);d(this,"_image",null);d(this,"_debounceUpdateTeeImage");if(e.tee!==void 0)throw new Error("TeeRenderer already initialized on this container");Object.defineProperty(e,"tee",{value:this,writable:!1}),this._container=e,this._colorBody=i.colorBody,this._colorFeet=i.colorFeet,this._useCustomColor=i.useCustomColor!==void 0?i.useCustomColor:i.colorBody!==void 0||i.colorFeet!==void 0,this._skinUrl=i.skinUrl,this._debounceUpdateTeeImage=k(this.updateTeeImage,10),this._container.classList.add("tee_initialized"),this._container.classList.remove("tee_initializing"),this.addEventListener("tee:rendered",()=>{this._container.classList.add("tee_rendered")},{once:!0}),this.loadSkin(this._skinUrl,!1)}get container(){return this._container}get colorBody(){return this._colorBody}set colorBody(e){e===void 0&&delete this._container.dataset.colorBody,this._colorBody=Number(e),this.update()}get colorBodyHsl(){return this._colorBody===void 0?void 0:r(this._colorBody)}get colorBodyRgba(){return this._colorBody===void 0?void 0:h(this._colorBody)}get colorFeet(){return this._colorFeet}set colorFeet(e){e===void 0&&delete this._container.dataset.colorFeet,this._colorFeet=Number(e),this.update()}get colorFeetHsl(){return this._colorFeet===void 0?void 0:r(this._colorFeet)}get colorFeetRgba(){return this._colorFeet===void 0?void 0:h(this._colorFeet)}get useCustomColor(){return this._useCustomColor}set useCustomColor(e){this._container.dataset.useCustomColor=e?"true":"false",this._useCustomColor=e,this.update()}get skinUrl(){return this._skinUrl}set skinUrl(e){this.loadSkin(e,!0)}get skinBitmap(){return this._skinBitmap}setSkinVariableValue(e){this._container.style.setProperty("--skin",e)}updateTeeImage(){if(this._skinBitmap!==null){if(this._offscreen===null?(this._offscreen=new OffscreenCanvas(this._skinBitmap.width,this._skinBitmap.height),this._offscreenContext=this._offscreen.getContext("2d",{willReadFrequently:!0})):((this._offscreen.width!==this._skinBitmap.width||this._offscreen.height!==this._skinBitmap.height)&&(this._offscreen.width=this._skinBitmap.width,this._offscreen.height=this._skinBitmap.height),this._offscreenContext.clearRect(0,0,this._offscreen.width,this._offscreen.height)),this._offscreenContext.drawImage(this._skinBitmap,0,0),this.useCustomColor){const e=this.colorBodyRgba||h(0),i=this.colorFeetRgba||h(0),t=this._offscreenContext.getImageData(0,0,this._offscreen.width,this._offscreen.height),s=t.data,l=this._offscreen.width*(6/8),c=this._offscreen.width*(8/8),u=this._offscreen.height*(1/4),_=this._offscreen.height*(3/4);for(let a=0;a<s.length;a+=4){const f=a/4%this._offscreen.width,E=Math.floor(a/4/this._offscreen.width),v=(s[a]+s[a+1]+s[a+2])/3,m=f>=l&&f<=c&&E>=u&&E<=_?i:e;s[a]=v*m[0]/255,s[a+1]=v*m[1]/255,s[a+2]=v*m[2]/255,s[a+3]=s[a+3]*m[3]/255}this._offscreenContext.putImageData(t,0,0)}this._offscreen.convertToBlob().then(e=>{const i=URL.createObjectURL(e),t=this._image||(this._image=new Image);t.onload=()=>{this.setSkinVariableValue(`url('${i}')`),this.dispatchEvent("tee:rendered"),t.remove()},t.src=i})}}dispatchEvent(...e){this._container.dispatchEvent(new CustomEvent(e[0],{detail:{tee:this,payload:e[1]||void 0}}))}addEventListener(e,i,t){this._container.addEventListener(e,i,t)}removeEventListener(e,i,t){this._container.removeEventListener(e,i,t)}update(){this._debounceUpdateTeeImage()}loadSkin(e,i){if(this._skinLoading)this._skinLoadedCallback=()=>this.loadSkin(e,i);else{const t=s=>{this._skinLoadingPromise=null,this._skinLoading=!1,this.dispatchEvent("tee:skin-loaded",{skin:e,success:s}),i&&this.update(),this._skinLoadedCallback&&this._skinLoadedCallback(),this._skinLoadedCallback=null};this._skinLoading=!0,this._skinLoadedCallback=null,this._skinLoadingPromise=y(e).then(async s=>{this._skinBitmap=await createImageBitmap(s),this._skinUrl=s.src,this._container.dataset.skin=this._skinUrl,t(!0)}).catch(()=>{console.warn(`TeeRenderer: cannot load skin '${e}'`),t(!1)})}return this._skinLoadingPromise}}function B(o){const e=document.createElement("div"),i=document.createElement("div"),t=document.createElement("div"),s=document.createElement("div");e.classList.add("tee__foot"),e.classList.add("tee__foot_left"),e.classList.add("tee__foot_outline"),i.classList.add("tee__foot"),i.classList.add("tee__foot_left"),t.classList.add("tee__foot"),t.classList.add("tee__foot_right"),t.classList.add("tee__foot_outline"),s.classList.add("tee__foot"),s.classList.add("tee__foot_right"),o.replaceChildren(),o.appendChild(e),o.appendChild(i),o.appendChild(t),o.appendChild(s)}function g(o,e){return new Promise((i,t)=>{setTimeout(()=>{t()},2e4);try{o.classList.add("tee_initializing"),B(o),new b(o,e).addEventListener("tee:skin-loaded",l=>{i(l.detail.tee)},{once:!0})}catch{o.classList.remove("tee_initializing"),t()}})}async function p(o=!0){const i=[...document.querySelectorAll(".tee:not(.tee_initialized):not(.tee_initializing")].map(t=>g(t,{colorBody:parseInt(t.dataset.colorBody)||void 0,colorFeet:parseInt(t.dataset.colorFeet)||void 0,useCustomColor:t.dataset.useCustomColor!==void 0?t.dataset.useCustomColor==="true":void 0,skinUrl:t.dataset.skin}));o?await Promise.allSettled(i).then(t=>{t.forEach(s=>{if(s.status==="fulfilled")try{s.value.update()}catch{}})}):i.forEach(t=>{t.then(s=>s.update())})}async function w(o){const e=document.createElement("div");o.colorBody!==void 0&&(e.dataset.colorBody=o.colorBody+""),o.colorFeet!==void 0&&(e.dataset.colorFeet=o.colorFeet+""),o.useCustomColor!==void 0&&(e.dataset.useCustomColor=o.useCustomColor?"true":"false"),e.dataset.skin=o.skinUrl,e.classList.add("tee");const i=await g(e,o);return i.update(),i.container}const R=Object.freeze(Object.defineProperty({__proto__:null,TeeRenderer:b,createAsync:w,createContainerElements:B,createRendererAsync:g,initializeAsync:p},Symbol.toStringTag,{value:"Module"}));L(()=>{p()}),n.color=F,n.createAsync=w,n.helpers=T,n.init=p,n.renderer=R,Object.defineProperty(n,Symbol.toStringTag,{value:"Module"})});
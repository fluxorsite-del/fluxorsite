import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { gsap } from "gsap";
import "./MorphSlider.css";

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}
`;

const fragment = `
precision highp float;
uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform vec2 uResolution;
uniform vec2 uCurrentSize;
uniform vec2 uNextSize;
uniform float uProgress;
uniform float uTime;
uniform float uIntensity;
uniform float uScale;
uniform float uAberration;
uniform float uDrift;
uniform float uReduce;
varying vec2 vUv;
const float PI=3.14159265359;
float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
vec2 cover(vec2 uv,vec2 res,vec2 img){float ra=res.x/max(res.y,1.);float ia=img.x/max(img.y,1.);vec2 s=vec2(1.);float r=ra/max(ia,.0001);if(r>1.)s.y=1./r;else s.x=r;return(uv-.5)*s+.5;}
void main(){
  float p=clamp(uProgress,0.,1.);float env=sin(p*PI);vec2 uv=vUv;
  if(uReduce<.5){uv+=vec2(sin(uTime*.23+uv.y*4.),cos(uTime*.2+uv.x*4.))*uDrift*.007;}
  float n=fbm(uv*uScale+uTime*.025);float w=fbm(uv*uScale*1.7-uTime*.018);
  vec2 field=vec2(n,w)-.5;
  vec2 cUv=uv+field*uIntensity*.45*p;
  vec2 nUv=uv-field*uIntensity*.45*(1.-p);
  float mask=uReduce>.5?p:smoothstep(n-.16,n+.16,p);
  vec2 sc=cover(cUv,uResolution,uCurrentSize);vec2 sn=cover(nUv,uResolution,uNextSize);
  float ca=uReduce<.5?uAberration*env*.025:0.;
  vec3 a=vec3(texture2D(tCurrent,sc+vec2(ca,0.)).r,texture2D(tCurrent,sc).g,texture2D(tCurrent,sc-vec2(ca,0.)).b);
  vec3 b=vec3(texture2D(tNext,sn+vec2(ca,0.)).r,texture2D(tNext,sn).g,texture2D(tNext,sn-vec2(ca,0.)).b);
  vec3 col=mix(a,b,mask);float vig=smoothstep(1.2,.25,length(uv-.5));col*=mix(.72,1.,vig);
  gl_FragColor=vec4(col,1.);
}`;

const fallback = gl => {
  const data = new Uint8Array(4 * 4 * 4).fill(18);
  for (let index = 3; index < data.length; index += 4) data[index] = 255;
  return new Texture(gl, { image: data, width: 4, height: 4, generateMipmaps: false });
};

export default function MorphSlider({ items, autoplay = true, autoplayDelay = 3, className = "" }) {
  const stageRef = useRef(null);
  const engineRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !items?.length) return undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new Renderer({ alpha: false, antialias: true, dpr: Math.min(devicePixelRatio || 1, 1.5) });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.className = "morph-slider-canvas";
    stage.appendChild(canvas);
    const textures = items.map(() => fallback(gl));
    const sizes = items.map(() => [1, 1]);
    let current = 0;
    let tween = null;
    let raf = 0;
    let visible = false;
    let destroyed = false;
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tCurrent: { value: textures[0] }, tNext: { value: textures[0] },
        uResolution: { value: [1, 1] }, uCurrentSize: { value: sizes[0] }, uNextSize: { value: sizes[0] },
        uProgress: { value: 0 }, uTime: { value: 0 }, uIntensity: { value: .5 }, uScale: { value: 2.4 },
        uAberration: { value: .28 }, uDrift: { value: .32 }, uReduce: { value: reduced ? 1 : 0 }
      }
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
      program.uniforms.uResolution.value = [canvas.width, canvas.height];
    };
    const loop = time => {
      raf = 0;
      if (!visible || destroyed) return;
      program.uniforms.uTime.value = time * .001;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!raf && !destroyed) raf = requestAnimationFrame(loop); };
    const goTo = targetIndex => {
      if (!visible || tween || items.length < 2) return;
      const target = (targetIndex + items.length) % items.length;
      if (target === current) return;
      program.uniforms.tCurrent.value = textures[current];
      program.uniforms.uCurrentSize.value = sizes[current];
      program.uniforms.tNext.value = textures[target];
      program.uniforms.uNextSize.value = sizes[target];
      setIndex(target);
      tween = gsap.fromTo(program.uniforms.uProgress, { value: 0 }, { value: 1, duration: reduced ? .25 : .88, ease: "power3.inOut", onComplete: () => {
        current = target;
        program.uniforms.tCurrent.value = textures[current];
        program.uniforms.uCurrentSize.value = sizes[current];
        program.uniforms.uProgress.value = 0;
        tween = null;
      }});
    };
    const go = direction => goTo(current + direction);
    engineRef.current = { next: () => go(1), prev: () => go(-1), goTo };
    items.forEach((item, itemIndex) => {
      const image = new Image();
      image.onload = () => {
        if (destroyed) return;
        const texture = new Texture(gl, { image, generateMipmaps: false });
        textures[itemIndex] = texture;
        sizes[itemIndex] = [image.naturalWidth || 1, image.naturalHeight || 1];
        if (itemIndex === current) {
          program.uniforms.tCurrent.value = texture;
          program.uniforms.uCurrentSize.value = sizes[itemIndex];
        }
      };
      image.src = item.image;
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "180px 0px" });
    visibilityObserver.observe(stage);
    let startX = 0;
    const onDown = event => { startX = event.clientX; stage.setPointerCapture?.(event.pointerId); };
    const onUp = event => { const distance = event.clientX - startX; if (Math.abs(distance) > 45) go(distance < 0 ? 1 : -1); };
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerup", onUp);
    return () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      tween?.kill();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerup", onUp);
      canvas.remove();
      engineRef.current = null;
    };
  }, [items]);

  useEffect(() => {
    if (!autoplay || hovering) return undefined;
    const timer = setTimeout(() => engineRef.current?.next(), autoplayDelay * 1000);
    return () => clearTimeout(timer);
  }, [autoplay, autoplayDelay, hovering, index]);

  const previous = useCallback(() => engineRef.current?.prev(), []);
  const next = useCallback(() => engineRef.current?.next(), []);

  return <div className={`morph-slider ${className}`} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
    <div ref={stageRef} className="morph-slider-stage" role="group" aria-roledescription="carousel" aria-label="Projetos selecionados" tabIndex={0} onKeyDown={event => { if (event.key === "ArrowLeft") previous(); if (event.key === "ArrowRight") next(); }} />
    <div className="morph-slider-caption" aria-live="polite">{items.map((item, itemIndex) => <span key={item.caption} className={itemIndex === index ? "is-active" : ""}>{item.caption}</span>)}</div>
    <div className="morph-slider-controls"><button type="button" onClick={previous} aria-label="Projeto anterior">←</button><span>{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><button type="button" onClick={next} aria-label="Próximo projeto">→</button></div>
  </div>;
}

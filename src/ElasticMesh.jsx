import React, { useEffect, useRef } from "react";
import { Renderer, Geometry, Program, Mesh, Texture } from "ogl";
import "./ElasticMesh.css";

const DIST = 4.6;
const FIT = .9;
const VERTEX = `
precision highp float;
attribute vec2 aGrid; attribute vec2 uv; attribute vec3 aOffset; attribute vec3 aNormal;
uniform float uAspect; uniform float uTilt; uniform float uDist; uniform float uFit;
varying vec2 vUv; varying vec3 vNormal; varying float vDepth;
void main(){vUv=uv;vec2 base=vec2((aGrid.x*2.-1.)*uAspect,1.-aGrid.y*2.);vec3 p=vec3(base+aOffset.xy,aOffset.z);float ct=cos(uTilt),st=sin(uTilt);float ry=p.y*ct-p.z*st;float rz=p.y*st+p.z*ct;p.y=ry;p.z=rz;float persp=uDist/(uDist-p.z);vec2 clip=vec2(p.x/uAspect,p.y)*persp*uFit;vNormal=aNormal;vDepth=aOffset.z;gl_Position=vec4(clip,0.,1.);}`;
const FRAGMENT = `
precision highp float;
varying vec2 vUv; varying vec3 vNormal; varying float vDepth;
uniform sampler2D tMap; uniform float uHasImage; uniform vec3 uHighlight; uniform float uShading; uniform vec2 uRes; uniform vec2 uImgRes;
vec2 cover(vec2 uv,vec2 res,vec2 img){float ra=res.x/max(res.y,1.);float ia=img.x/max(img.y,1.);vec2 s=vec2(1.);float r=ra/max(ia,.0001);if(r>1.)s.y=1./r;else s.x=r;return(uv-.5)*s+.5;}
void main(){vec3 base=texture2D(tMap,cover(vUv,uRes,uImgRes)).rgb;vec3 N=normalize(vNormal);vec3 L=normalize(vec3(-.35,.55,.78));vec3 H=normalize(L+vec3(0.,0.,1.));float diff=clamp(dot(N,L),0.,1.);float spec=pow(clamp(dot(N,H),0.,1.),26.);float ao=clamp(1.+vDepth*.38,.72,1.2);vec3 lit=base*(1.-uShading*.18)+base*diff*uShading*.42;lit*=ao;lit+=uHighlight*spec*uShading*.14;gl_FragColor=vec4(lit,1.);}`;

const hex = value => {
  let color = (value || "ffffff").replace("#", "");
  if (color.length === 3) color = [...color].map(char => char + char).join("");
  const number = parseInt(color, 16);
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
};

export default function ElasticMesh({
  image = "",
  highlight = "#ffffff",
  stiffness = .055,
  damping = .22,
  grabRadius = .46,
  pull = .34,
  wobble = 4,
  tilt = 7,
  shading = .4,
  resolution = 18,
  interaction = "hover",
  enabled = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { stiffness, damping, grabRadius, pull, wobble, tilt, shading, interaction, enabled };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce) and (max-width: 1920px) and (max-aspect-ratio: 199 / 100)").matches) return undefined;
    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 1.5) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const count = Math.max(8, Math.min(30, Math.round(resolution)));
    const nodes = count * count;
    const grid = new Float32Array(nodes * 2);
    const uv = new Float32Array(nodes * 2);
    const offsets = new Float32Array(nodes * 3);
    const normals = new Float32Array(nodes * 3);
    for (let row = 0; row < count; row++) for (let column = 0; column < count; column++) {
      const index = row * count + column;
      const u = column / (count - 1);
      const v = row / (count - 1);
      grid[index * 2] = uv[index * 2] = u;
      grid[index * 2 + 1] = uv[index * 2 + 1] = v;
      normals[index * 3 + 2] = 1;
    }
    const indices = new Uint16Array((count - 1) * (count - 1) * 6);
    let cursor = 0;
    for (let row = 0; row < count - 1; row++) for (let column = 0; column < count - 1; column++) {
      const a = row * count + column, b = a + 1, c = a + count, d = c + 1;
      indices[cursor++] = a; indices[cursor++] = c; indices[cursor++] = b;
      indices[cursor++] = b; indices[cursor++] = c; indices[cursor++] = d;
    }
    const geometry = new Geometry(gl, { aGrid: { size: 2, data: grid }, uv: { size: 2, data: uv }, aOffset: { size: 3, data: offsets }, aNormal: { size: 3, data: normals }, index: { data: indices } });
    const texture = new Texture(gl, { generateMipmaps: false, flipY: false });
    const program = new Program(gl, { vertex: VERTEX, fragment: FRAGMENT, transparent: true, cullFace: null, uniforms: {
      tMap: { value: texture }, uHasImage: { value: 0 }, uHighlight: { value: hex(highlight) }, uShading: { value: shading },
      uRes: { value: [1, 1] }, uImgRes: { value: [1, 1] }, uAspect: { value: 1 }, uTilt: { value: tilt * Math.PI / 180 }, uDist: { value: DIST }, uFit: { value: FIT },
    }});
    const mesh = new Mesh(gl, { geometry, program });
    let raf = 0, running = false, visible = false, last = performance.now(), accumulator = 0;
    const imageElement = new Image();
    imageElement.crossOrigin = "anonymous";
    imageElement.onload = () => { texture.image = imageElement; program.uniforms.uHasImage.value = 1; program.uniforms.uImgRes.value = [imageElement.naturalWidth, imageElement.naturalHeight]; start(); };
    imageElement.src = image;
    const baseX = new Float32Array(nodes), baseY = new Float32Array(nodes), positions = new Float32Array(nodes * 3), velocities = new Float32Array(nodes * 3), accelerations = new Float32Array(nodes * 3);
    let aspect = 1;
    const refreshBase = () => { for (let index = 0; index < nodes; index++) { baseX[index] = (grid[index * 2] * 2 - 1) * aspect; baseY[index] = 1 - grid[index * 2 + 1] * 2; } };
    const resize = () => {
      const width = container.offsetWidth || 1, height = container.offsetHeight || 1;
      renderer.setSize(width, height); aspect = width / height; program.uniforms.uAspect.value = aspect; program.uniforms.uRes.value = [width, height]; refreshBase(); start();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
    const toPlane = event => {
      const rect = container.getBoundingClientRect();
      const clipX = (event.clientX - rect.left) / rect.width * 2 - 1;
      const clipY = 1 - (event.clientY - rect.top) / rect.height * 2;
      pointer.tx = clipX * aspect / FIT;
      pointer.ty = clipY / FIT;
    };
    const onMove = event => { toPlane(event); if (propsRef.current.interaction === "hover") pointer.active = true; start(); };
    const onEnter = () => { if (propsRef.current.interaction === "hover") pointer.active = true; start(); };
    const onLeave = () => { pointer.active = false; start(); };
    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerenter", onEnter, { passive: true });
    container.addEventListener("pointerleave", onLeave, { passive: true });
    const step = () => {
      const settings = propsRef.current;
      const retain = 1 - settings.damping;
      const coupling = .06 + settings.wobble * .032;
      const radius = Math.max(.08, settings.grabRadius) * 1.4;
      for (let row = 0; row < count; row++) for (let column = 0; column < count; column++) {
        const index = row * count + column, offset = index * 3;
        let ax = -settings.stiffness * positions[offset], ay = -settings.stiffness * positions[offset + 1], az = -settings.stiffness * positions[offset + 2];
        let sx = 0, sy = 0, sz = 0, neighbors = 0;
        for (const neighbor of [column > 0 ? index - 1 : -1, column < count - 1 ? index + 1 : -1, row > 0 ? index - count : -1, row < count - 1 ? index + count : -1]) if (neighbor >= 0) {
          sx += positions[neighbor * 3]; sy += positions[neighbor * 3 + 1]; sz += positions[neighbor * 3 + 2]; neighbors++;
        }
        ax += coupling * (sx - neighbors * positions[offset]); ay += coupling * (sy - neighbors * positions[offset + 1]); az += coupling * (sz - neighbors * positions[offset + 2]);
        if (pointer.active && settings.enabled) {
          const dx = pointer.x - (baseX[index] + positions[offset]), dy = pointer.y - (baseY[index] + positions[offset + 1]);
          const distance = Math.sqrt(dx * dx + dy * dy), normalized = distance / radius;
          if (normalized < 1) {
            const bump = 1 - normalized * normalized;
            az += settings.pull * .054 * bump * bump;
            if (distance > .0001) { const pinch = normalized * (1 - normalized) * (1 - normalized) * settings.pull * .097 / distance; ax += dx * pinch; ay += dy * pinch; }
          }
        }
        accelerations[offset] = ax; accelerations[offset + 1] = ay; accelerations[offset + 2] = az;
      }
      for (let index = 0; index < nodes; index++) for (let axis = 0; axis < 3; axis++) {
        const offset = index * 3 + axis;
        velocities[offset] = (velocities[offset] + accelerations[offset]) * retain;
        positions[offset] = Math.max(-.7, Math.min(.7, positions[offset] + velocities[offset]));
      }
    };
    const commit = () => {
      let movement = 0;
      for (let row = 0; row < count; row++) for (let column = 0; column < count; column++) {
        const index = row * count + column, offset = index * 3;
        const left = (column > 0 ? index - 1 : index) * 3, right = (column < count - 1 ? index + 1 : index) * 3, down = (row > 0 ? index - count : index) * 3, up = (row < count - 1 ? index + count : index) * 3;
        const tx = [baseX[right / 3] + positions[right] - baseX[left / 3] - positions[left], baseY[right / 3] + positions[right + 1] - baseY[left / 3] - positions[left + 1], positions[right + 2] - positions[left + 2]];
        const ty = [baseX[up / 3] + positions[up] - baseX[down / 3] - positions[down], baseY[up / 3] + positions[up + 1] - baseY[down / 3] - positions[down + 1], positions[up + 2] - positions[down + 2]];
        let nx = tx[1] * ty[2] - tx[2] * ty[1], ny = tx[2] * ty[0] - tx[0] * ty[2], nz = tx[0] * ty[1] - tx[1] * ty[0];
        if (nz < 0) { nx *= -1; ny *= -1; nz *= -1; }
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        normals[offset] = nx / length; normals[offset + 1] = ny / length; normals[offset + 2] = nz / length;
        offsets[offset] = positions[offset]; offsets[offset + 1] = positions[offset + 1]; offsets[offset + 2] = positions[offset + 2];
        movement = Math.max(movement, Math.abs(positions[offset]) + Math.abs(positions[offset + 1]) + Math.abs(positions[offset + 2]) + Math.abs(velocities[offset]) + Math.abs(velocities[offset + 1]) + Math.abs(velocities[offset + 2]));
      }
      geometry.attributes.aOffset.needsUpdate = true; geometry.attributes.aNormal.needsUpdate = true;
      return movement;
    };
    const frame = now => {
      raf = 0;
      if (!visible) { running = false; return; }
      const delta = Math.min(.15, (now - last) / 1000); last = now; accumulator += delta;
      pointer.x += (pointer.tx - pointer.x) * .16; pointer.y += (pointer.ty - pointer.y) * .16;
      let substeps = 0;
      while (accumulator >= 1 / 120 && substeps < 5) { step(); accumulator -= 1 / 120; substeps++; }
      const movement = commit();
      program.uniforms.uShading.value = propsRef.current.shading; program.uniforms.uTilt.value = propsRef.current.tilt * Math.PI / 180;
      renderer.render({ scene: mesh });
      if (pointer.active || movement > .0015) raf = requestAnimationFrame(frame); else running = false;
    };
    function start() { if (visible && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; running = false; } }, { rootMargin: "120px" });
    visibilityObserver.observe(container);
    gl.canvas.className = "elastic-mesh-canvas";
    container.appendChild(gl.canvas);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      visibilityObserver.disconnect(); resizeObserver.disconnect();
      container.removeEventListener("pointermove", onMove); container.removeEventListener("pointerenter", onEnter); container.removeEventListener("pointerleave", onLeave);
      gl.canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [image, resolution, highlight]);

  return <div ref={containerRef} className={`elastic-mesh${className ? ` ${className}` : ""}`} />;
}

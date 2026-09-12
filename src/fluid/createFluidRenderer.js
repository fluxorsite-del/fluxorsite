// A bounded GPU velocity/density field. Pressure projection makes the trail flow
// around itself instead of accumulating independent circles along the pointer.
export default function createFluidRenderer(canvas, video) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, depth: false, stencil: false });
  if (!gl) throw new Error("WebGL unavailable");
  const vertex = "attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}";
  const common = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D field, pressure, movie;
    uniform vec2 texel, point, previous, impulse, viewport, videoSize;
    uniform float dt, radius, inject, time;
    vec2 velocity(vec2 p){return (texture2D(field,p).rg-.5)*2.;}
    float curl(vec2 p) {
      return (velocity(p+vec2(texel.x,0.)).y-velocity(p-vec2(texel.x,0.)).y
        -velocity(p+vec2(0.,texel.y)).x+velocity(p-vec2(0.,texel.y)).x)*.5;
    }
  `;
  const fragments = {
    advect: `
      vec2 v=velocity(uv);
      vec2 back=clamp(uv-v*dt,texel,1.-texel);
      vec4 old=texture2D(field,back);
      v=(old.rg-.5)*2.*exp(-dt*2.5);
      vec2 gradient=vec2(abs(curl(uv+vec2(texel.x,0.)))-abs(curl(uv-vec2(texel.x,0.))),
        abs(curl(uv+vec2(0.,texel.y)))-abs(curl(uv-vec2(0.,texel.y))));
      gradient/=max(length(gradient),.0001);
      v+=vec2(gradient.y,-gradient.x)*curl(uv)*dt*12.;
      vec2 aspect=vec2(viewport.x/viewport.y,1.);
      vec2 a=(uv-previous)*aspect, b=(point-previous)*aspect;
      float along=clamp(dot(a,b)/max(dot(b,b),.000001),0.,1.);
      vec2 delta=a-b*along;
      float dist=length(delta);
      float edge=1.+.1*sin(atan(delta.y,delta.x)*5.+time*2.);
      float brush=exp(-pow(dist/max(radius*edge,.001),2.)*2.5)*inject;
      v+=impulse*brush*.7;
      v+=vec2(-delta.y,delta.x)/aspect*brush*sin(time*4.)*2.;
      float density=min(1.,old.b*exp(-dt*2.3)+brush*.8);
      gl_FragColor=vec4(clamp(v,-.95,.95)*.5+.5,density,1.);
    `,
    divergence: `
      float d=(velocity(uv+vec2(texel.x,0.)).x-velocity(uv-vec2(texel.x,0.)).x
        +velocity(uv+vec2(0.,texel.y)).y-velocity(uv-vec2(0.,texel.y)).y)*.5;
      gl_FragColor=vec4(d*.5+.5,0.,0.,1.);
    `,
    pressure: `
      float l=texture2D(pressure,uv-vec2(texel.x,0.)).r-.5;
      float r=texture2D(pressure,uv+vec2(texel.x,0.)).r-.5;
      float b=texture2D(pressure,uv-vec2(0.,texel.y)).r-.5;
      float t=texture2D(pressure,uv+vec2(0.,texel.y)).r-.5;
      float divergence=texture2D(field,uv).r-.5;
      gl_FragColor=vec4((l+r+b+t-divergence)*.25+.5,0.,0.,1.);
    `,
    project: `
      vec4 f=texture2D(field,uv);
      vec2 grad=vec2(texture2D(pressure,uv+vec2(texel.x,0.)).r-texture2D(pressure,uv-vec2(texel.x,0.)).r,
        texture2D(pressure,uv+vec2(0.,texel.y)).r-texture2D(pressure,uv-vec2(0.,texel.y)).r);
      gl_FragColor=vec4(f.rg-grad,f.b,1.);
    `,
    display: `
      vec4 f=texture2D(field,uv);
      float scale=min(viewport.x/videoSize.x,viewport.y/videoSize.y);
      float compositionScale=viewport.x/viewport.y>=2. ? .94 : 1.016;
      vec2 compositionCenter=vec2(.4875,.4955);
      vec2 movieUv=(uv-compositionCenter)*viewport/(videoSize*scale*compositionScale)+.5;
      float inside=step(0.,movieUv.x)*step(movieUv.x,1.)*step(0.,movieUv.y)*step(movieUv.y,1.);
      vec2 flow=(f.rg-.5)*.009;
      vec3 rgb=texture2D(movie,clamp(movieUv+flow,0.,1.)).rgb*inside;
      gl_FragColor=vec4(rgb,smoothstep(.14,.20,f.b));
    `
  };
  const shaders = [];
  const programs = Object.fromEntries(Object.entries(fragments).map(([name, fragment]) => {
    const compile = (type, source) => {
      const shader=gl.createShader(type); shaders.push(shader);
      gl.shaderSource(shader,source); gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,common+"void main(){"+fragment+"}"));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const locations=Object.fromEntries(["field","pressure","movie","texel","point","previous","impulse","viewport","videoSize","dt","radius","inject","time"].map(key=>[key,gl.getUniformLocation(program,key)]));
    return [name,{program,locations,attribute:gl.getAttribLocation(program,"position")}];
  }));
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const texture = (width,height) => {
    const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    return t;
  };
  const movie=texture(1,1);
  let targets=[], width=1,height=1, sw=1,sh=1, lastTime=0, lastVideoTime=-1;
  let point=[.5,.5], previous=[.5,.5], impulse=[0,0], injection=0;
  const target = () => {
    const tex=texture(sw,sh), framebuffer=gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) throw new Error("Fluid framebuffer incomplete");
    gl.clearColor(.5,.5,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
    return {tex,framebuffer};
  };
  const releaseTargets=()=>targets.forEach(t=>{gl.deleteTexture(t.tex);gl.deleteFramebuffer(t.framebuffer);});
  function resize(w,h) {
    width=w;height=h;
    const dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(4200000/(w*h)));
    canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
    sh=Math.max(64,Math.min(320,Math.round(h/3)));sw=Math.min(1024,Math.max(64,Math.round(sh*w/h)));
    releaseTargets();targets=Array.from({length:5},target);lastTime=0;
  }
  function pass(name,destination,field,pressure,dt,now) {
    const p=programs[name], u=p.locations;
    gl.useProgram(p.program);gl.bindFramebuffer(gl.FRAMEBUFFER,destination?.framebuffer||null);
    gl.viewport(0,0,destination?sw:canvas.width,destination?sh:canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(p.attribute);gl.vertexAttribPointer(p.attribute,2,gl.FLOAT,false,0,0);
    [field?.tex,pressure?.tex,movie].forEach((tex,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex||movie);});
    gl.uniform1i(u.field,0);gl.uniform1i(u.pressure,1);gl.uniform1i(u.movie,2);
    gl.uniform2f(u.texel,1/sw,1/sh);gl.uniform2fv(u.point,point);gl.uniform2fv(u.previous,previous);gl.uniform2fv(u.impulse,impulse);
    gl.uniform2f(u.viewport,width,height);gl.uniform2f(u.videoSize,video.videoWidth||1920,video.videoHeight||1080);
    gl.uniform1f(u.dt,dt);gl.uniform1f(u.radius,68/height);gl.uniform1f(u.inject,injection);gl.uniform1f(u.time,now*.001);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  return {
    resize,
    move(x,y,dx,dy) {
      previous=point;point=[x,1-y];
      if(dx===0&&dy===0) previous=point;
      if(Math.hypot(point[0]-previous[0],point[1]-previous[1])>.3) previous=point;
      impulse=[Math.max(-.7,Math.min(.7,dx*14)),Math.max(-.7,Math.min(.7,-dy*14))];injection=1;
    },
    render(now) {
      const dt=Math.min(.033,Math.max(.008,(now-lastTime)/1000||.016));lastTime=now;
      let [a,b,div,p,q]=targets;
      pass("advect",b,a,null,dt,now);[a,b]=[b,a];
      pass("divergence",div,a,null,dt,now);
      for(let i=0;i<12;i++){pass("pressure",q,div,p,dt,now);[p,q]=[q,p];}
      pass("project",b,a,p,dt,now);[a,b]=[b,a];
      targets=[a,b,div,p,q];
      if(video.readyState>=2&&lastVideoTime!==video.currentTime){
        gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,movie);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);lastVideoTime=video.currentTime;
      }
      pass("display",null,a,null,dt,now);
      injection=0;previous=point;
    },
    clear() {
      for(const t of targets){gl.bindFramebuffer(gl.FRAMEBUFFER,t.framebuffer);gl.clearColor(.5,.5,0,1);gl.clear(gl.COLOR_BUFFER_BIT);}
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    },
    destroy() {
      releaseTargets();gl.deleteTexture(movie);gl.deleteBuffer(buffer);
      Object.values(programs).forEach(p=>gl.deleteProgram(p.program));shaders.forEach(s=>gl.deleteShader(s));
    }
  };
}

(() => {
  const canvas = document.getElementById('glCanvas');
  const load = document.getElementById('load');
  const start = document.getElementById('start');
  const stop = document.getElementById('stop');
  if (!canvas || !load) return;

  const gl = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance' }) || canvas.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
  if (!gl) return;

  const is2 = !!gl.createVertexArray;
  const vs = `attribute vec2 p; varying vec2 uv; void main(){ uv=p*.5+.5; gl_Position=vec4(p,0.,1.); }`;
  const fs = `precision highp float; varying vec2 uv; uniform float uTime; uniform float uLoad; uniform vec2 uRes;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){ vec2 q=uv-.5; q.x*=uRes.x/uRes.y; float t=uTime*.35; float z=0.;
      float passes=2.0+uLoad*3.0;
      for(float k=0.;k<8.;k++){
        if(k>=passes) break;
        vec2 r=q; float a=t*(.25+k*.07)+k*.73; float c=cos(a),s=sin(a); r=mat2(c,-s,s,c)*r;
        float rings=sin(18.0*length(r)-t*(1.4+k*.25)+sin(r.x*7.0+t)*uLoad*.6);
        float field=sin(r.x*11.0+t)*cos(r.y*13.0-t)+sin((r.x+r.y)*23.0-t);
        z += abs(rings)*.07 + abs(field)*.018;
      }
      float micro=0.;
      for(float i=0.;i<32.;i++){ if(i>=uLoad*3.2) break; micro += hash(floor((uv+vec2(i*.013, i*.021))*900.0)+i)*.0015; }
      z += micro;
      vec3 col=vec3(.16,.55,.9)*z + vec3(.48,.24,.95)*pow(z,1.7);
      col += vec3(.08,.16,.2)*sin((uv.y+t)*10.0);
      gl_FragColor=vec4(clamp(col,0.,1.),.42);
    }`;

  function shader(type, src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s; }
  const prog=gl.createProgram(); gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs)); gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(prog);
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  gl.useProgram(prog); const loc=gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const timeLoc=gl.getUniformLocation(prog,'uTime'), loadLoc=gl.getUniformLocation(prog,'uLoad'), resLoc=gl.getUniformLocation(prog,'uRes');
  let running=false, raf=0, started=0;
  function resize(){ const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2); canvas.width=Math.max(1,Math.floor(r.width*d)); canvas.height=Math.max(1,Math.floor(r.height*d)); gl.viewport(0,0,canvas.width,canvas.height); }
  function frame(t){ if(!running)return; gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(prog); gl.uniform1f(timeLoc,(t-started)/1000); gl.uniform1f(loadLoc,+load.value); gl.uniform2f(resLoc,canvas.width,canvas.height); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); raf=requestAnimationFrame(frame); }
  function startGL(){ if(running)return; running=true; started=performance.now(); resize(); raf=requestAnimationFrame(frame); }
  function stopGL(){ running=false; cancelAnimationFrame(raf); gl.clear(gl.COLOR_BUFFER_BIT); }
  start.addEventListener('click',startGL); stop.addEventListener('click',stopGL); window.addEventListener('resize',resize); window.addEventListener('pagehide',stopGL); document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGL();}); resize();
})();

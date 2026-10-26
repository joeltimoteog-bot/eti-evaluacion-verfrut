/* Evaluaciones ETI · index.html · bloque 02-login-particulas (antes en la linea 5473) · extraido el 26-oct-2026 sin cambios (_EVAL_MODULAR_V1) */
// ── Partículas del login (estética viva, sin afectar el rendimiento) ──
(function(){
  try{
    var cv=document.getElementById('loginCanvas');
    if(!cv)return;
    var cx=cv.getContext('2d'),P=[];
    function rz(){var r=cv.parentElement.getBoundingClientRect();cv.width=r.width;cv.height=r.height;}
    rz();window.addEventListener('resize',rz);
    for(var i=0;i<45;i++)P.push({x:Math.random()*cv.width,y:Math.random()*cv.height,
      r:Math.random()*2.2+.5,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,o:Math.random()*.45+.1});
    (function tick(){
      var visible=document.getElementById('slogin').classList.contains('active');
      if(visible){
        cx.clearRect(0,0,cv.width,cv.height);
        P.forEach(function(p){
          p.x+=p.vx;p.y+=p.vy;
          if(p.x<0||p.x>cv.width)p.vx*=-1;
          if(p.y<0||p.y>cv.height)p.vy*=-1;
          cx.beginPath();cx.arc(p.x,p.y,p.r,0,Math.PI*2);
          cx.fillStyle='rgba(255,255,255,'+p.o+')';cx.fill();
        });
      }
      requestAnimationFrame(tick);
    })();
  }catch(e){}
})();

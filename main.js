const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const SCALE = 50;
const OX = canvas.width / 2, OY = canvas.height / 2;
const xSize = canvas.width /(SCALE*2)
const ySize = canvas.height /(SCALE*2)

let m = [1,0,0,1]; // [a,b,c,d] => i = [a,c] j = [b,d]
let v = [-2,4];

function toScreen(x,y){
    const sx = OX + x * SCALE;
    const sy = OY - y * SCALE;
    return [sx, sy];
    
}
function toWorld(sx,sy){
    const x= (sx-OX)/SCALE;
    const y= (OY-sy)/SCALE;
    return [x, y];
}
function applyMatrix(x,y,m){
    let nx = x*m[0] + y*m[1];
    let ny = x*m[2] + y*m[3];
    // let nx = x *(m[0]+m[1])
    // let ny = y *(m[2]+m[3])
    return [nx, ny];
}
function drawLine(p1,p2,color,width){
    const [x1,y1] = toScreen(p1[0],p1[1]);
    const [x2,y2] = toScreen(p2[0],p2[1]);
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();


}
        
const R = 20
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for(let i=-xSize;i<=xSize;i++){
        drawLine([i,-ySize],[i,ySize],"grey",1);
        drawLine([-xSize,i],[xSize,i],"grey",1); 
    }
for (let i = -R; i <= R; i++) {
    drawLine(applyMatrix(i, -R, m), applyMatrix(i, R, m), "cyan", 1);
    drawLine(applyMatrix(-R, i, m), applyMatrix(R, i, m), "yellow", 1);
}
drawLine([-xSize,0],[xSize,0],"white",2)
drawLine([0,-ySize],[0,ySize],"white",2)

drawDetArea();
    drawArrow([m[0], m[2]], "#5DCAA5");   
    drawArrow([m[1], m[3]], "#F0997B"); 
        updateInfo();  
    drawArrow(applyMatrix(v[0],v[1],m), "pink");
}
    
    function drawArrow(tipWorld,color){
        drawLine([0,0],tipWorld,color,3);
        
        const [ox,oy] = toScreen(0,0);
        const [tx,ty] = toScreen(tipWorld[0],tipWorld[1]);
        const a = Math.atan2(ty-oy,tx-ox);
        const c1 =[tx-12*(Math.cos(a-0.4)),ty-12*(Math.sin(a-0.4))];
        const c2 =[tx-12*(Math.cos(a+0.4)),ty-12*(Math.sin(a+0.4))];
        ctx.beginPath();
        ctx.moveTo(tx,ty)
        ctx.lineTo(c1[0],c1[1])
        ctx.lineTo(c2[0],c2[1])
        ctx.fillStyle = color;
        ctx.closePath();
        ctx.fill();

    }


    
    function updateInfo() {
        const f = v => v.toFixed(2);              
        document.getElementById("ix").textContent = f(m[0]);
        document.getElementById("iy").textContent = f(m[2]);   
        document.getElementById("jx").textContent = f(m[1]);
        document.getElementById("jy").textContent = f(m[3]);       
        
        
        document.getElementById("mat").textContent =
        "[ " + f(m[0]) + "  " + f(m[1]) + " ]\n" +
        "[ " + f(m[2]) + "  " + f(m[3]) + " ]";
        
        document.getElementById("det").textContent = f(m[0]*m[3]-m[2]*m[1]);   // a·d − b·c
    }
    
    let dragging = null;                       // "i", "j" or null, outside the listeners
    
    function mouseWorld(e) {
        const rect = canvas.getBoundingClientRect();
        return toWorld((e.clientX - rect.left) * canvas.width / rect.width, (e.clientY - rect.top) * canvas.height / rect.height);
    }
    
    canvas.addEventListener("pointerdown", e => {
        const [x, y] = mouseWorld(e);
        const di = Math.hypot(x - m[0], y - m[2]);
        const dj = Math.hypot(x - m[1], y - m[3]);
        // grab radius in screen pixels: bigger for fingers, then converted to world units
        const rect = canvas.getBoundingClientRect();
        const grabPx = e.pointerType === "touch" ? 32 : 15;
        const grab = grabPx * (canvas.width / rect.width) / SCALE;
        if (di < grab && di <= dj) dragging = "i";
        else if (dj < grab) dragging = "j";
        if (dragging) canvas.setPointerCapture(e.pointerId);
    });
    
    canvas.addEventListener("pointermove", e => {
        if (!dragging) return;                   // not holding anything: do nothing
        const [x, y] = mouseWorld(e);            // current mouse, from this event
        if (dragging === "i") { m[0] = x; m[2] = y; }
        else { m[1] =x,m[3]=y}
        draw();
        
    });
    
    canvas.addEventListener("pointerup", () => { dragging = null; });
    canvas.addEventListener("pointercancel", () => { dragging = null; });
    function rotation(deg) {
        const t = deg * Math.PI / 180;        // Math.cos and Math.sin use radians, not degrees
        return [Math.cos(t), -Math.sin(t),
            Math.sin(t),  Math.cos(t)];
        }
        
   let animating = false;
   const I2 = document.getElementById("identity");
   const rotate90 = document.getElementById("rotate-90");
   const shear = document.getElementById("shear");
   shear.addEventListener("click",e=>{
    if(animating) return;
    type = "linear";
    start = [...m];
    target = multiply([1,1,0,1], m);
    startTime = performance.now();
    requestAnimationFrame(frame);
    animating = true;
   });

   rotate90.addEventListener("click",e=>{
    if(animating) return;
    start = [...m];
    type = "rotate";
    startTime = performance.now();
    requestAnimationFrame(frame);
    animating = true;
    
   })
   I2.addEventListener("click",(e)=>{
    if(animating) return;
    type = "linear";
    start = [...m];
    target= [1,0,0,1];
    startTime = performance.now();
    requestAnimationFrame(frame);
    animating = true;

   })
   
    function multiply(P, Q){
        return [
            P[0]*Q[0]+P[1]*Q[2], P[0]*Q[1]+P[1]*Q[3],
            P[2]*Q[0]+P[3]*Q[2], P[2]*Q[1]+P[3]*Q[3]
        ]
    }
    

   
    let start,target,startTime,type;;
    function frame(now){
    const t= Math.min(1, (now - startTime) / 1500);
    if (type=="rotate") {
        m = multiply(rotation(90 * t), start);  
    } else{ 
    m[0] = (start[0]+t*(target[0]-start[0]));
    m[1] = (start[1]+t*(target[1]-start[1]));
    m[2] = (start[2]+t*(target[2]-start[2]));
    m[3] = (start[3]+t*(target[3]-start[3]));
    }
    draw();
    if (t<1) requestAnimationFrame(frame);
    else    animating = false;
    }
    draw();
    
    function drawDetArea() {
        let color;
        const det = m[0]*m[3]-m[1]*m[2];
        (det>0)? color = "rgba(93, 202, 165, 0.25)" : color = "rgba(240, 153, 123, 0.25)";
  const O  = toScreen(0, 0);
  const I  = toScreen(m[0], m[2]);
  const IJ = toScreen(m[0] + m[1], m[2] + m[3]);
  const J  = toScreen(m[1], m[3]);

  ctx.beginPath();
  ctx.moveTo(O[0], O[1]);
  ctx.lineTo(I[0], I[1]);
  ctx.lineTo(IJ[0], IJ[1]);
  ctx.lineTo(J[0], J[1]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  
}
        


    
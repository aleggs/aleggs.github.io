import"./hoisted.6f47f3b9.js";if(document.querySelector(".link-card")==null){const e=document.querySelector(".feed-error-message");e.style.display="block"}const s=document.querySelector("svg.trail"),m=s.querySelector("path");let o=[],y=15,r={x:0,y:0};const a=e=>{const n=e.clientX,t=e.clientY;if(r.x=n,r.y=t,o.length===0)for(let i=0;i<y;i++)o.push({x:n,y:t})},l=()=>{let e=r.x,n=r.y;o.forEach((t,i)=>{t.x=e,t.y=n;let c=o[i+1];c&&(e=e-(t.x-c.x)*.6,n=n-(t.y-c.y)*.6)}),m.setAttribute("d",`M ${o.map(t=>`${t.x} ${t.y}`).join(" L ")}`),requestAnimationFrame(l)},d=()=>{const e=window.innerWidth,n=window.innerHeight;s.style.width=e+"px",s.style.height=n+"px",s.setAttribute("viewBox",`0 0 ${e} ${n}`)};document.addEventListener("mousemove",a);window.addEventListener("resize",d);window.matchMedia("(pointer: fine)").matches&&(l(),d());

const particleArray = [];
let hue = 0;
/**
 * @type {{[index: string]: null|DOMRect}}
 */
const RECT = {
  rect: null
}

function isMobileDevice() {
  if (navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)) {
     return true ;
  } else {
     return false ;
  }
}


const mouse = {
  x: null,
  y: null
}




function main() {
  while (particleArray.length>=1) particleArray.pop();
  /**
   * @type {HTMLCanvasElement|null}
   */
  const canvas = document.getElementById('canvas1');
  const main = document.querySelector('main');
  if (canvas&&main) {
    if (isMobileDevice()) {
      RECT.rect = canvas.getBoundingClientRect();
      document.addEventListener('scroll',function() {
        RECT.rect = canvas.getBoundingClientRect();
      })
    }
    canvas.width = main.offsetWidth;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillRect(10,10,100,50);
      class Particle {
        constructor() {
          this.x = mouse.x;
          this.y = mouse.y;
          this.size = Math.random()*8 + 1;
          this.speedX = Math.random()*3 - 1.5;
          this.speedY = Math.random()*3 - 1.5;
          this.color = `hsl(${hue},100%,50%)`;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.size>=0.2) this.size-=0.1;
        }
        draw() {
          ctx.fillStyle = `hsl(${hue},100%,50%)`;
          ctx.beginPath();
          ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
          ctx.fill();
        }
      }
      function hanleParticles() {
        for (let i = 0; i < particleArray.length; i++) {
          particleArray[i].update()
          particleArray[i].draw();
          for (let j = i; j < particleArray.length; j++) {
            const dx = particleArray[i].x - particleArray[j].x;
            const dy = particleArray[i].y - particleArray[j].y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < 100) {
              ctx.beginPath();
              ctx.strokeStyle = particleArray[i].color;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particleArray[i].x,particleArray[i].y);
              ctx.lineTo(particleArray[j].x,particleArray[j].y);
              ctx.stroke();
            }
          }
          if (particleArray[i].size <=0.3) {
            particleArray.splice(i,1);
            i--;
          }
        }
      }
      mouse.x = 0;
      mouse.y = 0;
      if (!!!isMobileDevice()) {
        canvas.addEventListener('mousemove',(e) => {
          mouse.x = e.offsetX;
          mouse.y = e.offsetY;
          for (let i = 0; i < 10; i++) {
            particleArray.push(new Particle());
          }
        })
      } else {
        canvas.addEventListener('touchmove',(e) => {
          if (RECT) {
            mouse.x =  e.touches[0].pageX - RECT.rect.left;
            mouse.y =  e.touches[0].pageY - RECT.rect.top;
            for (let i = 0; i < 10; i++) {
              particleArray.push(new Particle());
            }
          }
        })
      }
      var STOP_ANIMATION_FRAME = undefined;
      function animate() {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        hanleParticles();
        hue+=2;
        STOP_ANIMATION_FRAME = requestAnimationFrame(animate);
      }
      animate();
      document.addEventListener('htmx:afterRequest',function (e) {
        if (e && e.detail && e.detail.target && (e.detail.target.id==='PAGE'||e.detail.target.id==='#PAGE') && STOP_ANIMATION_FRAME!==undefined){
          cancelAnimationFrame(STOP_ANIMATION_FRAME);
          STOP_ANIMATION_FRAME = undefined;
          while (particleArray.length>=1) particleArray.pop();
        }
      })
    }
  }


}

document.addEventListener('run-learn-canvas-script',main);
document.dispatchEvent(new CustomEvent('run-learn-canvas-script'));
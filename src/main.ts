import './style.css'
import Cpu from "./Cpu";
// import Screen from "./Screen";


// const screenElement = document.querySelector<HTMLCanvasElement>('#screen')!;
// let screen = screenElement.getContext('2d')!;
// screen.fillStyle = "black";
// screen.fillRect(0,0,screenElement.clientWidth,screenElement.clientHeight);
// let pixel = screen.getImageData(1,1,1,1);
// console.log(pixel.data);

let cpu = new Cpu();
cpu._loadRom("../roms/Space Invaders [David Winter].ch8").then(() => {
    cpu._loadFont();
    cpu._initKeyboard()
    step();
})


function step () {
    setInterval(() => {
        cpu._fetch();
        cpu._execute(...cpu._decode());    
        if (cpu.DT > 0) {
            --cpu.DT;
        }   
        if (cpu.ST > 0) {
            --cpu.ST;
        }    
        
    }, 13);
    
}


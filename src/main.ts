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
cpu._loadRom().then(() => {
    cpu._loadFont();
    step();
})

function    step () {
    setInterval(() => {
        cpu._fetch();
        cpu._execute(...cpu._decode());        
    }, 100);
    
}

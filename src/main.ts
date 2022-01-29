import './style.css'
import Cpu from "./Cpu";

const screenElement = document.querySelector<HTMLCanvasElement>('#screen')!;
let screen = screenElement.getContext('2d')!;
screen.fillStyle = "green";
screen.fillRect(0,0,screenElement.clientWidth,screenElement.clientHeight);
let cpu = new Cpu();

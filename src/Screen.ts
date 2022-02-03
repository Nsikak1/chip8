
class Screen {
  screenElement: HTMLCanvasElement;
    screen: CanvasRenderingContext2D;
  constructor() {
    this.screenElement = document.querySelector<HTMLCanvasElement>("#screen")!;
    this.screen = this.screenElement.getContext("2d")!;
    this.screen.fillStyle = "black";
    
    
  }

   getPixel(x: number,y: number) {
    return this.screen.getImageData(x,y,1,1).data[3];
      
  }
  _setPixel(display: Array<number>) {
    
    for (let height = 0; height < 32 ; height++) {
      for (let width = 0; width < 64; width++) {
        
        if(display[height * 64 + width]) {
          this.screen.fillStyle = "red";
          this.screen.fillRect(width * 10,height * 10,10,10);
        }
        else {
          this.screen.fillStyle = "black";
          this.screen.fillRect(width * 10,height * 10,10,10);
        }
      }
      
    }
  }

}
export default Screen;

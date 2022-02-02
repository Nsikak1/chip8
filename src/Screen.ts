
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
    
    for (let height = 0; height < this.screenElement.clientHeight ; height++) {
      for (let width = 0; width < this.screenElement.clientWidth; width++) {
        
        if(display[height * this.screenElement.clientWidth + width]) {
          this.screen.fillStyle = "red";
          this.screen.fillRect(width,height,1,1);
        }
        else {
          this.screen.fillStyle = "black";
          this.screen.fillRect(width,height,1,1);
        }
      }
      
    }
  }

}
export default Screen;

import Screen from "./Screen";
class Cpu {
  register;
  I: number;
  DT: Uint8Array;
  ST: Uint8Array;
  PC: number;
  SP: number;
  stack: Uint16Array;
    memory: Uint8Array;
    FONT: Array<Number>;
    RAM_START: number;
  opcode: Uint8Array;
  display: Array<number>;
  screen: Screen;
  screenElement: HTMLCanvasElement;
  constructor() {
    this.register = new Uint8Array(16);
    this.I = 0x0;
    this.ST = new Uint8Array(1);
    this.DT = new Uint8Array(1);
    this.PC = 0x200; // Program counter
    this.RAM_START = 0x200;
    this.SP = 0x0;
    this.stack = new Uint16Array(16);
    this.memory = new Uint8Array(4096);
    // this.display = [...Array(64)].map(() => Array(32).fill(0));
    this.opcode = new Uint8Array(2);
    this.FONT = new Array(0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
	0x20, 0x60, 0x20, 0x20, 0x70, // 1
	0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
	0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
	0x90, 0x90, 0xF0, 0x10, 0x10, // 4
	0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
	0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
	0xF0, 0x10, 0x20, 0x40, 0x40, // 7
	0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
	0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
	0xF0, 0x90, 0xF0, 0x90, 0x90, // A
	0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
	0xF0, 0x80, 0x80, 0x80, 0xF0, // C
	0xE0, 0x90, 0x90, 0x90, 0xE0, // D
	0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
	0xF0, 0x80, 0xF0, 0x80, 0x80  // F'
    );
this.screenElement = document.querySelector<HTMLCanvasElement>('#screen')!;
this.display = new Array(64 * 32).fill(0);
this.screen = new Screen();
  }
  _initKeyboard() {

  }
  _loadFont() {
      const FONT_INDEX = 0x050;  
      for (let i = 0; i < this.FONT.length; i++) {
          this.memory[FONT_INDEX + i] = Number(this.FONT[i]);
          
      }
    }


    async _loadRom() {
      let response = await fetch('../roms/IBM Logo.ch8');
      let content = await response.blob();
      const romBuffer = new Uint8Array(await content.arrayBuffer());
      for (let i = 0; i < romBuffer.byteLength; i++) {
        this.memory[this.PC + i] = romBuffer[i];  
      }
    }
    
    _randomByte() {
      return Math.floor(Math.random() * 255)
    }

    _fetch() {
      console.log(`this.PC: ${this.PC}`);
      
      this.opcode[0] = this.memory[this.PC];
      this.opcode[1] = this.memory[this.PC + 1];
      this.PC += 2;
    }

    _decode() {
      const opcode = this.opcode[0] << 8 | this.opcode[1];
      const op = (this.opcode[0] >> 4);
      const Vx = (opcode & 0x0f00) >> 8;
      const Vy = (opcode & 0x00f0) >> 4;
      const n = opcode & 0x000f;
      const nn =  opcode & 0x00ff;
      const nnn = opcode & 0x0fff;
      return [opcode, op, Vx, Vy, n, nn, nnn];
    }
    _execute(...[opcode, op, Vx, Vy, n, nn, nnn]: Array<number>) {

      // console.log([opcode, op, Vx, Vy, n, nn, nnn]);
      
      switch (op) {
        case 0:
          switch (n) {
            case 0x0:
              this.display.fill(0)
              this.screen._setPixel(this.display)
              console.log(`clear screen`)
              break;
            case 0xe:
              this.PC = this.stack[this.SP];
              this.SP--;
              console.log(`return call ${this.PC}`);
              break;
          }
          break;

        case 1:
          // 1nnn - JP addr
          // Jump to location nnn.
          // The interpreter sets the program counter to nnn.
          this.PC = nnn;
          console.log(`jump to address ${nnn}`);
          console.log(`jump to address ${this.memory[this.PC]}}`);
          break;

        case 2:
          this.SP++
          this.stack[this.SP] = this.PC;
          this.PC = nnn;
          console.log(`call ${nnn}`);
          break;
        case 3:
          if (this.register[Vx] === nn) {
            this.PC += 2;
          }
          console.log(`case 3`);
          
          break;
        case 4:
          if (this.register[Vx] !== nn) {
            this.PC += 2;
          }
          console.log(`case 4`);
          
          break;
        case 5:
          if (this.register[Vx] === this.register[Vy]) {
            this.PC += 2;
          }
          console.log(`case 5`);
          
          break;
        case 6:
          this.register[Vx] += nn;
          console.log(`this.register[Vx] ${this.register[Vx]}`);
          
          break;
        case 7:
          this.register[Vx] += nn;
          break;
        case 0xa:
          this.I = nnn;
          console.log(`this.I = nnn ${nnn}`);
          
          break;
        case 0xd:
          let xCoor = this.register[Vx] % 64;
          let yCoor = this.register[Vy] % 32;
          
          this.register[0xf] = 0;
          
          for (let row = 0, height = n; row < height; row++) {
                let pixelByte = this.memory[this.I + row];
                for (let col = 0; col < 8; col++) {
                  let pixelBinary = (pixelByte >> (7 - col)) & 0b1;
                let screenBinary = this.display[(yCoor + row ) * 64 + (xCoor + col)];
                  if(pixelBinary !== 0 ) {
                    if(screenBinary === 1) {
                        this.register[0xF] = 1
                    }
                     this.display[(yCoor + row ) * 64 + (xCoor + col)] ^= 1;

                  }else {
                  }
                }    
          }

          console.log(`draw function ${this.display}`);
          this.screen._setPixel(this.display)
          break;
        default:
          console.error(`Missing opcode: ${op}`);
          
          break;
        }

    }
    
}

export default Cpu;

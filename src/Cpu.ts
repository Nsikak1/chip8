import Screen from "./Screen";
class Cpu {
  register;
  I: number;
  DT: number;
  ST: number;
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
  mappedKeys: { '1': string; '2': string; '3': string; c: string; '4': string; '5': string; '6': string; d: string; '7': string; '8': string; '9': string; e: string; a: string; '0': string; b: string; f: string; };
  keys: { '1': string; '2': string; '3': string; c: string; '4': string; '5': string; '6': string; d: string; '7': string; '8': string; '9': string; e: string; a: string; '0': string; b: string; f: string; };
  FONT_INDEX: number;
  key: string;
  constructor() {
    this.register = new Uint8Array(16);
    this.I = 0x0;
    this.ST = 0o0;
    this.DT = 0o0;
    this.PC = 0x200; // Program counter
    this.RAM_START = 0x200;
    this.SP = 0x0;
    this.stack = new Uint16Array(16);
    this.memory = new Uint8Array(4096);
    // this.display = [...Array(64)].map(() => Array(32).fill(0));
    this.opcode = new Uint8Array(2);
    this.FONT_INDEX = 0x050;  
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
this.mappedKeys = {
  '1': "1",
  '2': "2",
  '3': "3",
  'c': "4",
  '4': 'q',
  '5': "w",
  '6': "e",
  'd': "r",
  '7': "a",
  '8': "s",
  '9': "d",
  'e': "f",
  'a': "z",
  '0': "x",
  'b': "c",
  'f': "v",
};
this.keys = Object.assign({},this.mappedKeys) 
this.screenElement = document.querySelector<HTMLCanvasElement>('#screen')!;
this.display = new Array(64 * 32).fill(0);
this.screen = new Screen();
this.key = ""
  }

  _setkeys(event : KeyboardEvent) {
    let key: keyof typeof this.mappedKeys;
      for (key in this.mappedKeys) {
        if (event.key === this.mappedKeys[key]) {
        // console.log(`In`);
          this.keys[key] = key;          
        }
      }
  }
  _getkeys(value: any ) {
      let key  = value as unknown as  keyof typeof this.mappedKeys;
      for (key in this.mappedKeys) {
        if (value === this.mappedKeys[key]) {
          return parseInt(key, 16)          
        }
      }
       return  undefined       
      }
      _getDirectkeys(Vx: any) {
        let key  = Vx as unknown as  keyof typeof this.mappedKeys;
        for (key in this.mappedKeys) {
          if (Vx === parseInt(key, 16)) {
            return Vx;          
          }
        }
        return undefined;
      }
  _getPress() {
    document.addEventListener('keydown', event => {
      this.key = event.key;     
      // console.log(this.key);
       
    }, false);
    document.removeEventListener('keydown', event => {
      return event;
  }, false)
}
  _initKeyboard() {
    document.addEventListener('keydown', event => {
      this._setkeys(event)      
      
    }, true);
      document.addEventListener('keyup', event => {
        let key: keyof typeof this.mappedKeys;
        for (key in this.mappedKeys) {        
          if (event.key === this.mappedKeys[key]) {
          // console.log(`Out`);
            this.keys[key] = undefined as unknown as  keyof typeof this.mappedKeys;          
          }
        }
      }, true)
  }
  _loadFont() {
      for (let i = 0; i < this.FONT.length; i++) {
          this.memory[this.FONT_INDEX + i] = Number(this.FONT[i]);
          
      }
    }


    async _loadRom(rom: string) {
      let response = await fetch(rom);
      let content = await response.blob();
      const romBuffer = new Uint8Array(await content.arrayBuffer());
      for (let i = 0; i < romBuffer.byteLength; i++) {
        this.memory[this.PC + i] = romBuffer[i];  
      }
      let textElement = document.getElementById("text")!;
      let romInstructionPath = rom.replace("ch8", "txt")
      try {
      let response = await fetch(romInstructionPath);
      let romInstruction = await response.text();
      textElement.innerText =  romInstruction;
      } catch (error) {
        alert(error)
        textElement.innerHTML =  `<pre class="keyboard">
Key layout:

1 2 3 4
Q W E R
A S D F
Z X C V</pre> `
      }
    }
    _loadtxt() {

    }
    
    _randomByte() {
      return Math.floor(Math.random() * 255)
    }

    _fetch() {
      // console.log(`this.PC: ${this.PC}`);
      
      this.opcode[0] = this.memory[this.PC];
      this.opcode[1] = this.memory[this.PC + 1];
      this.PC += 2;
    }

    _decode() {
      const opcode = this.opcode[0] << 8 | this.opcode[1];
      const op = (this.opcode[0] >> 4);
      const Vx: any = (opcode & 0x0f00) >> 8;
      const Vy = (opcode & 0x00f0) >> 4;
      const n = opcode & 0x000f;
      const nn =  opcode & 0x00ff;
      const nnn = opcode & 0x0fff;
      return [op, Vx, Vy, n, nn, nnn];
    }
    _execute(...[op, Vx, Vy, n, nn, nnn]: Array<number>) {
      switch (op) {
        case 0:
          switch (n) {
            case 0x0:
              this.display.fill(0)
              this.screen._setPixel(this.display)
              // console.log(`clear screen`)
              break;
            case 0xe:
              this.PC = this.stack[this.SP];
              this.SP--;
              // console.log(`return call ${this.PC}`);
              break;
          }
          break;

        case 1:
          // 1nnn - JP addr
          // Jump to location nnn.
          // The interpreter sets the program counter to nnn.
          this.PC = nnn;
          // console.log(`jump to address ${nnn}`);
          // console.log(`jump to address ${this.memory[this.PC]}}`);
          break;

        case 2:
          this.SP++
          this.stack[this.SP] = this.PC;
          this.PC = nnn;
          // console.log(`call ${nnn}`);
          break;
        case 3:
          if (this.register[Vx] === nn) {
            this.PC += 2;
          }
          // console.log(`case 3`);
          
          break;
        case 4:
          if (this.register[Vx] !== nn) {
            this.PC += 2;
          }
          // console.log(`case 4`);
          
          break;
        case 5:
          if (this.register[Vx] === this.register[Vy]) {
            this.PC += 2;
          }
          // console.log(`case 5`);
          
          break;
        case 6:
          this.register[Vx] = nn;
          // console.log(`this.register[Vx] ${this.register[Vx]}`);          
          break;
        case 7:
          this.register[Vx] += nn;
          break;
        case 8:
         switch (n) {
           case 0:
             this.register[Vx] = this.register[Vy];
             // console.log(`case 8xy0`);   
             break;
            case 1:
              this.register[Vx] = this.register[Vx] | this.register[Vy];
             // console.log(`case 8xy1`);
            break;
            case 2:
              this.register[Vx] = this.register[Vx] & this.register[Vy];
              // console.log(`case 8xy2`);
              break;
            case 3:
              this.register[Vx] = this.register[Vx] ^ this.register[Vy];
              // console.log(`case 8xy3`);
              break;
            case 4:
              let sum = this.register[Vx] + this.register[Vy];
              if (sum > 0xff) {
                this.register[0xf] = 1;
              } else {
                this.register[0xf] = 0;
              }
              this.register[Vx] = sum & 0xff ;
              // console.log(`case 8xy4`);
              break;
            case 5:
             if ( this.register[Vx] > this.register[Vy]) {
              this.register[0xf] = 1;
             }
             else {
              this.register[0xf] = 0;
            }
            this.register[Vx] -= this.register[Vy];
             // console.log(`case 8xy5`);
              break;
            case 6:
              // Save least significant bit
              this.register[0xf] =  this.register[Vx] & 0b1;
              // division by 2 is a right shift
              this.register[Vx] >>= 0b1;
              // console.log(`case 8xy6`);
              break;
            case 7:
              if (this.register[Vy] > this.register[Vx]) {
                this.register[0xf] = 0b1;
              }
              else {
                this.register[0xf] = 0;
              }
              this.register[Vx] = this.register[Vy] - this.register[Vx];
              // console.log(`case 8xy7`);
              break;
            case 0xe:
              this.register[0xf] = (this.register[Vx] & 0x80) >> 7;
              this.register[Vx] *= 2;
              // console.log(`case 8xye`);
              break;
           default:
            throw new Error(`Case 8xy${n} not Implemented`);
            break;
         } 
          break;
        case 9:
          if (this.register[Vx] !== this.register[Vy]) {
            this.PC +=2;
          }
          // console.log(`case 9xy0`);
          break;
        case 0xa:
          this.I = nnn;
          // console.log(`this.I = nnn ${nnn}`);
          break;
        case 0xb:
          this.PC = nnn + this.register[0];
          // console.log(`case B`);          
          break;
        case 0xc:
          this.register[Vx] = this._randomByte() & nn;
          // console.log(`Case C`);          
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

                  }
                }    
          }

          // console.log(`draw function`);
          this.screen._setPixel(this.display)
          break;
        case 0xe:
          switch (n) {
            case 0xe:
              this._getPress();
              if(Vx === this._getkeys(this.key)) {
                this.key = "";
                this.PC += 2
              }
              break;
              case 0x1:
                this._getPress();
              if (undefined === this._getkeys(this.key)) {
                this.key = "";
                this.PC += 2
              }
              break;
            default:
             throw new Error(`Case Exx${n} not Implemented`);
             break;
          }
          break;
        case 0xf:
          switch (nn) {
            case 0x07:
              this.register[Vx] = this.DT
              break;
            case 0x0a:
                this._getPress()
                // console.log(`Key: ${this.key}`);
                
                if (this.key !== "") {
                  this.register[Vx] = this._getkeys(this.key)! ;
                  this.key = ""
                  break;
                } else {
                  this.PC -=2
                }
              break;
            case 0x15:
              this.DT = this.register[Vx];
              break;
            case 0x18:
              this.ST = this.register[Vx];
              break;
            case 0x1e:
              this.I += this.register[Vx];
              break;
            case 0x29:
              this.I = this.FONT_INDEX + (5 * this.register[Vx]) 
              break;
            case 0x33:
              let value =  this.register[Vx]
              this.memory[this.I + 2] = value % 10;
              value = Math.floor(value / 10);
              this.memory[this.I + 1] = value % 10;
              value = Math.floor(value / 10);
              this.memory[this.I] = value % 10;
              break;
            case 0x55:
              for (let i = 0; i <= Vx; i++) {
                 this.memory[this.I + i] = this.register[i];
              }
              break;
            case 0x65:
              for (let i = 0; i <= Vx; i++) {
                  this.register[i] = this.memory[this.I + i];
              }
              break;
            default:
              throw new Error(`Missing Case Ex${nn}`);
              break;
          }
          break;
        default:
          throw new Error(`Missing opcode ${op}`);
          break;
        }
    }
  
}

export default Cpu;

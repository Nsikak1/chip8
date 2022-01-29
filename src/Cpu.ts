class Cpu {
  register;
  I: Number;
  DT: Uint8Array;
  ST: Uint8Array;
  PC: number;
  SP: number;
  stack: Uint16Array;
    memory: Uint8Array;
    FONT: Array<Number>;
    display: any[][];
    RAM_START: number;
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
    this.display = [...Array(64)].map(() => Array(32).fill(0))
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

    console.log(`inside cpu`);
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
      let response = await fetch('../roms/IBM.ch8');
      let content = await response.blob();
    const romBuffer = new Uint8Array(await content.arrayBuffer());
    for (let i = 0; i < romBuffer.byteLength; i++) {
      this.memory[this.PC + i] = romBuffer[i];  
    }


    }

    _fetch() {
      
    }
}

export default Cpu;

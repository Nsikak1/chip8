import Cpu from '../src/Cpu';

const cpu = new Cpu();

// isInteger.spec.js
test("Sanity check", () => {
  expect(true).toBe(true);
});
test('Font memory', () => {
  cpu._loadFont();
  expect(cpu.memory[0x50]).toBe(0xF0)
  ;
});
test('Font memory end', () => {
  expect(cpu.memory[0x9f]).toBe(0x80)
  ;
});
test('should load rom', () => {

  cpu._loadRom().then(() => {
    expect(cpu.memory[0x201]).toBe(0xe0);

}).catch(e => {
    console.log(e);    
});


});



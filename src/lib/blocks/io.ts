import * as Blockly from 'blockly';

const DIGITAL_PINS_DROPDOWN: any = Array.from({ length: 25 }, (_, i) => [i.toString(), i.toString()]);

export const defineIOBlocks = () => {
  Blockly.Blocks['arduino_pin_mode'] = {
    init: function () {
      this.appendValueInput('PIN').setCheck('Number').appendField(Blockly.Msg['B_IO_PINMODE']);
      this.appendDummyInput().appendField(Blockly.Msg['B_IO_MODE']).appendField(new Blockly.FieldDropdown([['INPUT', 'INPUT'], ['OUTPUT', 'OUTPUT'], ['INPUT_PULLUP', 'INPUT_PULLUP']]), 'MODE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF'); // Hardware IO
    }
  };

  Blockly.Blocks['arduino_digital_write'] = {
    init: function () {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField(Blockly.Msg['B_IO_WRITE_D']);

      this.appendDummyInput()
        .appendField(Blockly.Msg['B_IO_VAL'])
        .appendField(new Blockly.FieldDropdown([
          [Blockly.Msg['B_IO_HIGH'], "HIGH"], 
          [Blockly.Msg['B_IO_LOW'], "LOW"]
        ]), "VALUE");

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_digital_read'] = {
    init: function () {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField(Blockly.Msg['B_IO_READ_D']);

      this.setOutput(true, "Number");
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_analog_write'] = {
    init: function () {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField(Blockly.Msg['B_IO_WRITE_A']);

      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(Blockly.Msg['B_IO_VAL']);

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_analog_read'] = {
    init: function () {
      this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField(Blockly.Msg['B_IO_READ_A']);

      this.setOutput(true, "Number");
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_delay'] = {
    init: function () {
      this.appendValueInput("TIME").setCheck("Number").appendField("Esperar (ms)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_delay_microseconds'] = {
    init: function () {
      this.appendValueInput("TIME").setCheck("Number").appendField("Esperar (us)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_millis'] = {
    init: function () {
      this.appendDummyInput().appendField('millis()');
      this.setOutput(true, 'Number');
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_micros'] = {
    init: function () {
      this.appendDummyInput().appendField('micros()');
      this.setOutput(true, 'Number');
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_pin_number'] = {
    init: function () {
      this.appendDummyInput().appendField('pin').appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_led_builtin'] = {
    init: function () {
      this.appendDummyInput().appendField('LED_BUILTIN');
      this.setOutput(true, 'Number');
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_high_low'] = {
    init: function () {
      this.appendDummyInput().appendField(new Blockly.FieldDropdown([['HIGH', 'HIGH'], ['LOW', 'LOW']]), 'VALUE');
      this.setOutput(true, 'Number');
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_tone'] = {
    init: function () {
      this.appendValueInput('PIN').setCheck('Number').appendField('tone pin');
      this.appendValueInput('FREQ').setCheck('Number').appendField('frequency');
      this.appendValueInput('DURATION').setCheck('Number').appendField('duration (ms)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
    }
  };

  Blockly.Blocks['arduino_no_tone'] = {
    init: function () {
      this.appendValueInput('PIN').setCheck('Number').appendField('noTone pin');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
    }
  };
};

export const defineIOGenerators = (Arduino: any) => {
  Arduino.forBlock['arduino_pin_mode'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || '0';
    const mode = block.getFieldValue('MODE');
    return `pinMode(${pin}, ${mode});\n`;
  };

  Arduino.forBlock['arduino_digital_write'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || '0';
    const state = block.getFieldValue('VALUE');
    Arduino.setups_['pin_' + pin] = `pinMode(${pin}, OUTPUT);`;
    return `digitalWrite(${pin}, ${state});\n`;
  };

  Arduino.forBlock['arduino_digital_read'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || '0';
    Arduino.setups_['pin_' + pin] = `pinMode(${pin}, INPUT);`;
    return [`digitalRead(${pin})`, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_analog_write'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || '0';
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '0';
    Arduino.setups_['pin_' + pin] = `pinMode(${pin}, OUTPUT);`;
    return `analogWrite(${pin}, ${val});\n`;
  };

  Arduino.forBlock['arduino_analog_read'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || 'A0';
    return [`analogRead(${pin})`, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_delay'] = function (block: Blockly.Block) {
    const time = Arduino.valueToCode(block, 'TIME', Arduino.ORDER_ATOMIC) || '1000';
    return `delay(${time});\n`;
  };

  Arduino.forBlock['arduino_delay_microseconds'] = function (block: Blockly.Block) {
    const time = Arduino.valueToCode(block, 'TIME', Arduino.ORDER_ATOMIC) || '1000';
    return `delayMicroseconds(${time});\n`;
  };

  Arduino.forBlock['arduino_millis'] = function () {
    return ['millis()', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_micros'] = function () {
    return ['micros()', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_pin_number'] = function (block: Blockly.Block) {
    const pin = block.getFieldValue('PIN');
    return [pin, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_led_builtin'] = function () {
    return ['LED_BUILTIN', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_high_low'] = function (block: Blockly.Block) {
    const val = block.getFieldValue('VALUE');
    return [val, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_tone'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || '0';
    const freq = Arduino.valueToCode(block, 'FREQ', Arduino.ORDER_ATOMIC) || '440';
    const duration = Arduino.valueToCode(block, 'DURATION', Arduino.ORDER_ATOMIC) || '1000';
    return `tone(${pin}, ${freq}, ${duration});\n`;
  };

  Arduino.forBlock['arduino_no_tone'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || '0';
    return `noTone(${pin});\n`;
  };
};

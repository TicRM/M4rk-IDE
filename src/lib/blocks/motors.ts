import * as Blockly from 'blockly';
import { FieldSlider } from '@blockly/field-slider';

const DIGITAL_PINS_DROPDOWN: any = Array.from({ length: 25 }, (_, i) => [i.toString(), i.toString()]);
const MOTOR_DROPDOWN: any = [
  ['Motor1', 'motor1'],
  ['Motor2', 'motor2'],
  ['Motor3', 'motor3'],
  ['Motor4', 'motor4'],
  ['Motor5', 'motor5'],
  ['Motor6', 'motor6'],
  ['Motor7', 'motor7'],
  ['Motor8', 'motor8'],
  ['Motor9', 'motor9']
];

export const defineMotorBlocks = () => {
  // Configuración del Motor
  Blockly.Blocks['motor_setup'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_MOTOR_SETUP']);
      this.appendDummyInput()
        .appendField(Blockly.Msg['B_MOTOR_NAME'])
        .appendField(new Blockly.FieldDropdown(MOTOR_DROPDOWN), 'MOTOR')
        .appendField("EN")
        .appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'EN')
        .appendField("IN1")
        .appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'IN1')
        .appendField("IN2")
        .appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'IN2');

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF'); // VexIQ Motor Blue
      this.setTooltip('Configuración del motor L298N. EN controla la velocidad.');
    }
  };

  // Mover Motor con Slider
  Blockly.Blocks['motor_run'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(Blockly.Msg['B_MOTOR_RUN']);

      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(MOTOR_DROPDOWN), 'MOTOR')
        .appendField(Blockly.Msg['B_MOTOR_SPEED'])
        .appendField(new FieldSlider(100, -100, 100), "SPEED")
        .appendField("%");

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF'); // VexIQ Motor Blue
      this.setTooltip('Mueve el motor. Positivo hacia adelante, negativo en reversa.');
    }
  };

  Blockly.Blocks['motor_stop'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_MOTOR_STOP']);
      this.appendDummyInput().appendField(new Blockly.FieldDropdown(MOTOR_DROPDOWN), 'MOTOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
    }
  };

  // Servos
  Blockly.Blocks['arduino_servo_attach'] = {
    init: function () {
      this.appendValueInput('PIN').setCheck('Number').appendField(Blockly.Msg['B_SERVO_ATTACH']);
      this.appendDummyInput().appendField(Blockly.Msg['B_SERVO_AS']).appendField(new Blockly.FieldDropdown([['servo1', 'servo1'], ['servo2', 'servo2']]), 'SERVO');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
    }
  };

  Blockly.Blocks['arduino_servo_write'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['servo1', 'servo1'], ['servo2', 'servo2']]), 'SERVO');

      this.appendValueInput('ANGLE').setCheck('Number').appendField(Blockly.Msg['B_SERVO_WRITE']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
    }
  };
};

export const defineMotorGenerators = (Arduino: any) => {
  Arduino.forBlock['motor_setup'] = function (block: Blockly.Block) {
    const name = Arduino.getVariableName(block.getFieldValue('MOTOR'));
    const in1 = block.getFieldValue('IN1');
    const in2 = block.getFieldValue('IN2');
    const en = block.getFieldValue('EN');

    Arduino.definitions_['motor_' + name] = `int ${name}_IN1=${in1}; int ${name}_IN2=${in2}; int ${name}_EN=${en};`;
    Arduino.setups_['motor_' + name] = `pinMode(${name}_IN1, OUTPUT); pinMode(${name}_IN2, OUTPUT); pinMode(${name}_EN, OUTPUT);`;
    return '';
  };

  Arduino.forBlock['motor_run'] = function (block: Blockly.Block) {
    const name = Arduino.getVariableName(block.getFieldValue('MOTOR'));
    // Obtenemos el valor del slider directamente (-100 a 100)
    const speed = block.getFieldValue('SPEED');
    const speedNum = parseInt(speed, 10);
    
    // Si es positivo, adelante. Si es negativo, reversa.
    const isForward = speedNum >= 0;
    const absSpeed = Math.abs(speedNum);

    const code = `digitalWrite(${name}_IN1, ${isForward ? 'HIGH' : 'LOW'});\n` +
      `digitalWrite(${name}_IN2, ${isForward ? 'LOW' : 'HIGH'});\n` +
      `analogWrite(${name}_EN, map(${absSpeed}, 0, 100, 0, 255));\n`;
    return code;
  };

  Arduino.forBlock['motor_stop'] = function (block: Blockly.Block) {
    const name = Arduino.getVariableName(block.getFieldValue('MOTOR'));
    return `analogWrite(${name}_EN, 0); digitalWrite(${name}_IN1, LOW); digitalWrite(${name}_IN2, LOW);\n`;
  };

  Arduino.forBlock['arduino_servo_attach'] = function (block: Blockly.Block) {
    const pin = Arduino.valueToCode(block, 'PIN', Arduino.ORDER_ATOMIC) || '9';
    const servo = block.getFieldValue('SERVO');
    Arduino.definitions_['servo_inc'] = '#include <Servo.h>';
    Arduino.definitions_['servo_' + servo] = `Servo ${servo};`;
    Arduino.setups_['servo_att_' + servo] = `${servo}.attach(${pin});`;
    return '';
  };

  Arduino.forBlock['arduino_servo_write'] = function (block: Blockly.Block) {
    const servo = block.getFieldValue('SERVO');
    const angle = Arduino.valueToCode(block, 'ANGLE', Arduino.ORDER_ATOMIC) || '90';
    return `${servo}.write(${angle});\n`;
  };
};

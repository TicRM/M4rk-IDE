import * as Blockly from 'blockly';

const DIGITAL_PINS_DROPDOWN: any = Array.from({ length: 25 }, (_, i) => [i.toString(), i.toString()]);
const ANALOG_PINS_DROPDOWN: any = Array.from({ length: 12 }, (_, i) => [`A${i}`, `A${i}`]);
const ULTRASONIC_DROPDOWN: any = [
  ['Ultrasonic1', 'Ultra1'],
  ['Ultrasonic2', 'Ultra2'],
  ['Ultrasonic3', 'Ultra3']
];

export const defineSensorBlocks = () => {
  Blockly.Blocks['ultrasonic_setup'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(Blockly.Msg['B_SNS_US_SETUP'])
        .appendField(new Blockly.FieldDropdown(ULTRASONIC_DROPDOWN), "ULTRA_NAME")
        .appendField(Blockly.Msg['B_SNS_TRIG'])
        .appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'TRIG_PIN')
        .appendField(Blockly.Msg['B_SNS_ECHO'])
        .appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'ECHO_PIN');

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4FC3B8'); // Sensores
      this.setTooltip('Configura los pines del sensor ultrasónico.');
    }
  };

  Blockly.Blocks['ultrasonic_read'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(Blockly.Msg['B_SNS_US_READ'])
        .appendField(new Blockly.FieldDropdown(ULTRASONIC_DROPDOWN), "ULTRA_NAME")
        .appendField(Blockly.Msg['B_SNS_US_READ_IN'])
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg['B_SNS_US_CM'], "CM"], [Blockly.Msg['B_SNS_US_INCH'], "INCH"]]), "UNIT");

      this.setOutput(true, "Number");
      this.setColour('#4FC3B8');
      this.setTooltip('Obtiene la distancia del sensor en la unidad seleccionada.');
    }
  };

  Blockly.Blocks['color_sensor_read'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_SNS_COLOR_SENSOR']);
      this.appendDummyInput()
        .appendField(Blockly.Msg['B_SNS_S0']).appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'S0')
        .appendField(Blockly.Msg['B_SNS_S1']).appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'S1')
        .appendField(Blockly.Msg['B_SNS_S2']).appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'S2')
        .appendField(Blockly.Msg['B_SNS_S3']).appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'S3')
        .appendField(Blockly.Msg['B_SNS_OUT']).appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'OUT');

      this.appendDummyInput().appendField(Blockly.Msg['B_SNS_COMPONENT']).appendField(new Blockly.FieldDropdown([[Blockly.Msg['B_SNS_RED'], 'RED'], [Blockly.Msg['B_SNS_GREEN'], 'GREEN'], [Blockly.Msg['B_SNS_BLUE'], 'BLUE']]), 'COLOR_COMP');
      this.setOutput(true, "Number");
      this.setColour('#4FC3B8');
    }
  };

  Blockly.Blocks['sound_sensor_read'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_SNS_SOUND_SENSOR']);
      this.appendDummyInput().appendField(Blockly.Msg['B_SNS_PIN']).appendField(new Blockly.FieldDropdown(ANALOG_PINS_DROPDOWN), 'PIN');
      this.setOutput(true, "Number");
      this.setColour('#4FC3B8');
    }
  };
};

export const defineSensorGenerators = (Arduino: any) => {
  Arduino.forBlock['ultrasonic_setup'] = function (block: Blockly.Block) {
    const name = block.getFieldValue('ULTRA_NAME');
    const trig = block.getFieldValue('TRIG_PIN');
    const echo = block.getFieldValue('ECHO_PIN');

    Arduino.definitions_['ultra_pins_' + name] = `const int ${name}_TRIG = ${trig};\nconst int ${name}_ECHO = ${echo};`;
    Arduino.setups_['ultra_setup_' + name] = `pinMode(${name}_TRIG, OUTPUT); pinMode(${name}_ECHO, INPUT);`;

    Arduino.definitions_['func_ultra_duration'] = `long readUltrasonicDuration(int trigPin, int echoPin) {\n  digitalWrite(trigPin, LOW);\n  delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long duration = pulseIn(echoPin, HIGH, 30000);\n  if (duration == 0) return 30000;\n  return duration;\n}`;

    return '';
  };

  Arduino.forBlock['ultrasonic_read'] = function (block: Blockly.Block) {
    const name = block.getFieldValue('ULTRA_NAME');
    const unit = block.getFieldValue('UNIT');
    const multiplier = unit === 'CM' ? '0.034 / 2' : '0.0133 / 2';
    return [`(readUltrasonicDuration(${name}_TRIG, ${name}_ECHO) * ${multiplier})`, Arduino.ORDER_MULTIPLICATIVE];
  };

  Arduino.forBlock['color_sensor_read'] = function (block: Blockly.Block) {
    const s0 = block.getFieldValue('S0');
    const s1 = block.getFieldValue('S1');
    const s2 = block.getFieldValue('S2');
    const s3 = block.getFieldValue('S3');
    const out = block.getFieldValue('OUT');
    const colorComp = block.getFieldValue('COLOR_COMP');

    Arduino.setups_['color_sensor_' + out] = `pinMode(${s0}, OUTPUT); pinMode(${s1}, OUTPUT); pinMode(${s2}, OUTPUT); pinMode(${s3}, OUTPUT); pinMode(${out}, INPUT); digitalWrite(${s0}, HIGH); digitalWrite(${s1}, LOW);`;

    let filterCode = '';
    if (colorComp === 'RED') { filterCode = `digitalWrite(${s2}, LOW); digitalWrite(${s3}, LOW);`; }
    else if (colorComp === 'GREEN') { filterCode = `digitalWrite(${s2}, HIGH); digitalWrite(${s3}, HIGH);`; }
    else if (colorComp === 'BLUE') { filterCode = `digitalWrite(${s2}, LOW); digitalWrite(${s3}, HIGH);`; }

    const funcName = `readColor_${colorComp}`;
    Arduino.definitions_['func_' + funcName] = `int ${funcName}(int s2, int s3, int out) { ${filterCode} return pulseIn(out, LOW); }`;

    return [`${funcName}(${s2}, ${s3}, ${out})`, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['sound_sensor_read'] = function (block: Blockly.Block) {
    const pin = block.getFieldValue('PIN');
    return ['analogRead(' + pin + ')', Arduino.ORDER_ATOMIC] as [string, number];
  };
};

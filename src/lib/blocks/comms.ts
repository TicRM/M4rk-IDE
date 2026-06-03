import * as Blockly from 'blockly';

const DIGITAL_PINS_DROPDOWN: any = Array.from({ length: 25 }, (_, i) => [i.toString(), i.toString()]);

export const defineCommsBlocks = () => {
  // WiFi
  Blockly.Blocks['wifi_connect'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_WIFI_CON']);
      this.appendValueInput("SSID").setCheck("String").appendField(Blockly.Msg['B_COM_WIFI_SSID']);
      this.appendValueInput("PASS").setCheck("String").appendField(Blockly.Msg['B_COM_WIFI_PASS']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00'); // Conectividad / Eventos (VexIQ Yellow)
    }
  };

  Blockly.Blocks['wifi_is_connected'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_WIFI_CHECK']);
      this.setOutput(true, "Boolean");
      this.setColour('#FFBF00');
    }
  };

  // Bluetooth
  Blockly.Blocks['bluetooth_setup'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_BT_SETUP']);
      this.appendDummyInput().appendField("RX").appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'RX_PIN')
        .appendField("TX").appendField(new Blockly.FieldDropdown(DIGITAL_PINS_DROPDOWN), 'TX_PIN')
        .appendField("Baud").appendField(new Blockly.FieldDropdown([['9600', '9600'], ['38400', '38400']]), 'BAUD');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['bluetooth_read_string'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_BT_READ']);
      this.setOutput(true, "String");
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['bluetooth_send_string'] = {
    init: function () {
      this.appendValueInput("DATA").setCheck(null).appendField(Blockly.Msg['B_COM_BT_SEND']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  // Serial
  Blockly.Blocks['arduino_serial_begin'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SER_BEGIN']).appendField(new Blockly.FieldDropdown([['9600', '9600'], ['115200', '115200']]), 'BAUD');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['arduino_serial_print'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck(null).appendField(Blockly.Msg['B_COM_SER_PRINT']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['arduino_serial_println'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck(null).appendField(Blockly.Msg['B_COM_SER_PRINTLN']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['arduino_serial_available'] = {
    init: function () {
      this.appendDummyInput().appendField('Serial.available()');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['arduino_serial_read'] = {
    init: function () {
      this.appendDummyInput().appendField('Serial.read()');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
    }
  };

  // I2C
  Blockly.Blocks['i2c_begin'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_BEGIN']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
      this.setTooltip('Inicializa el bus I2C (Wire).');
    }
  };

  Blockly.Blocks['i2c_request_from'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_REQ']);
      this.appendValueInput('ADDRESS').setCheck('Number').appendField("Address");
      this.appendValueInput('BYTES').setCheck('Number').appendField(Blockly.Msg['B_I2C_BYTES']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['i2c_read'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_READ']);
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['i2c_begin_transmission'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_BEGIN_TX']);
      this.appendValueInput('ADDRESS').setCheck('Number').appendField("Address");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['i2c_write'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck(null).appendField(Blockly.Msg['B_I2C_WRITE']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };

  Blockly.Blocks['i2c_end_transmission'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_END_TX']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFBF00');
    }
  };
};

export const defineCommsGenerators = (Arduino: any) => {
  Arduino.forBlock['wifi_connect'] = function (block: Blockly.Block) {
    const ssid = Arduino.valueToCode(block, 'SSID', Arduino.ORDER_ATOMIC) || '"SSID"';
    const pass = Arduino.valueToCode(block, 'PASS', Arduino.ORDER_ATOMIC) || '"PASS"';
    Arduino.definitions_['wifi_inc'] = '#include <WiFi.h>';
    Arduino.setups_['wifi_begin'] = `WiFi.begin(${ssid}, ${pass});`;
    return '';
  };

  Arduino.forBlock['wifi_is_connected'] = function (block: Blockly.Block) {
    return ['(WiFi.status() == WL_CONNECTED)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['bluetooth_setup'] = function (block: Blockly.Block) {
    const rx = block.getFieldValue('RX_PIN');
    const tx = block.getFieldValue('TX_PIN');
    const baud = block.getFieldValue('BAUD');
    Arduino.definitions_['bt_inc'] = '#include <SoftwareSerial.h>';
    Arduino.definitions_['bt_obj'] = `SoftwareSerial BTSerial(${rx}, ${tx});`;
    Arduino.setups_['bt_begin'] = `BTSerial.begin(${baud});`;
    return '';
  };

  Arduino.forBlock['bluetooth_read_string'] = function (block: Blockly.Block) {
    return ['BTSerial.readString()', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['bluetooth_send_string'] = function (block: Blockly.Block) {
    const data = Arduino.valueToCode(block, 'DATA', Arduino.ORDER_ATOMIC) || '""';
    return `BTSerial.println(${data});\n`;
  };

  Arduino.forBlock['arduino_serial_begin'] = function (block: Blockly.Block) {
    const baud = block.getFieldValue('BAUD');
    Arduino.setups_['serial'] = `Serial.begin(${baud});`;
    return '';
  };

  Arduino.forBlock['arduino_serial_print'] = function (block: Blockly.Block) {
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '""';
    return `Serial.print(${val});\n`;
  };

  Arduino.forBlock['arduino_serial_println'] = function (block: Blockly.Block) {
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '""';
    return `Serial.println(${val});\n`;
  };

  Arduino.forBlock['arduino_serial_available'] = function () {
    return ['Serial.available()', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_serial_read'] = function () {
    return ['Serial.read()', Arduino.ORDER_ATOMIC] as [string, number];
  };

  // I2C
  Arduino.forBlock['i2c_begin'] = function () {
    Arduino.definitions_['wire_inc'] = '#include <Wire.h>';
    return `Wire.begin();\n`;
  };

  Arduino.forBlock['i2c_request_from'] = function (block: Blockly.Block) {
    const addr = Arduino.valueToCode(block, 'ADDRESS', Arduino.ORDER_ATOMIC) || '0';
    const bytes = Arduino.valueToCode(block, 'BYTES', Arduino.ORDER_ATOMIC) || '1';
    return `Wire.requestFrom(${addr}, ${bytes});\n`;
  };

  Arduino.forBlock['i2c_read'] = function () {
    return ['Wire.read()', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['i2c_begin_transmission'] = function (block: Blockly.Block) {
    const addr = Arduino.valueToCode(block, 'ADDRESS', Arduino.ORDER_ATOMIC) || '0';
    return `Wire.beginTransmission(${addr});\n`;
  };

  Arduino.forBlock['i2c_write'] = function (block: Blockly.Block) {
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '0';
    return `Wire.write(${val});\n`;
  };

  Arduino.forBlock['i2c_end_transmission'] = function () {
    return `Wire.endTransmission();\n`;
  };
};

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
      this.setColour('#FFA040'); // Conectividad / Eventos (VexIQ Yellow)
    }
  };

  Blockly.Blocks['wifi_is_connected'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_WIFI_CHECK']);
      this.setOutput(true, "Boolean");
      this.setColour('#FFA040');
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
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['bluetooth_read_string'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_BT_READ']);
      this.setOutput(true, "String");
      this.setColour('#FFA040');
      this.setTooltip('Lee el texto recibido por Bluetooth, sin saltos de línea ni espacios al final. Devuelve "" si no llegó nada.');
    }
  };

  Blockly.Blocks['bluetooth_read_number'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_BT_READ_NUM']);
      this.setOutput(true, 'Number');
      this.setColour('#FFA040');
      this.setTooltip('Lee un número recibido por Bluetooth (por ejemplo 1 o 0). Devuelve -1 si no llegó nada.');
    }
  };

  Blockly.Blocks['bluetooth_read_decimal'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_BT_READ_DEC']);
      this.setOutput(true, 'Number');
      this.setColour('#FFA040');
      this.setTooltip('Lee un número con decimales recibido por Bluetooth (por ejemplo 12.5). Devuelve -1 si no llegó nada.');
    }
  };

  Blockly.Blocks['bluetooth_read_char'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_BT_READ_CHAR']);
      this.setOutput(true, 'String');
      this.setColour('#FFA040');
      this.setTooltip('Lee una sola tecla o carácter recibido por Bluetooth (por ejemplo w, a, s, d), sin esperar. Devuelve "" si no llegó nada.');
    }
  };

  Blockly.Blocks['bluetooth_has_data'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_BT_HAS_DATA']);
      this.setOutput(true, 'Boolean');
      this.setColour('#FFA040');
      this.setTooltip('Verdadero si llegó algo por Bluetooth que aún no se ha leído.');
    }
  };

  Blockly.Blocks['bluetooth_send_string'] = {
    init: function () {
      this.appendValueInput("DATA").setCheck(null).appendField(Blockly.Msg['B_COM_BT_SEND']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
    }
  };

  // Serial
  Blockly.Blocks['arduino_serial_begin'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SER_BEGIN']).appendField(new Blockly.FieldDropdown([['9600', '9600'], ['115200', '115200']]), 'BAUD');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['arduino_serial_print'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck(null).appendField(Blockly.Msg['B_COM_SER_PRINT']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['arduino_serial_println'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck(null).appendField(Blockly.Msg['B_COM_SER_PRINTLN']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['arduino_serial_read_text'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SER_READ_TEXT']);
      this.setOutput(true, 'String');
      this.setColour('#FFA040');
      this.setTooltip('Lee el texto enviado desde el monitor serial, sin saltos de línea ni espacios al final. Devuelve "" si no llegó nada.');
    }
  };

  Blockly.Blocks['arduino_serial_read_number'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SER_READ_NUM']);
      this.setOutput(true, 'Number');
      this.setColour('#FFA040');
      this.setTooltip('Lee un número enviado desde el monitor serial (por ejemplo 1 o 0). Devuelve -1 si no llegó nada.');
    }
  };

  Blockly.Blocks['arduino_serial_read_decimal'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SER_READ_DEC']);
      this.setOutput(true, 'Number');
      this.setColour('#FFA040');
      this.setTooltip('Lee un número con decimales enviado desde el monitor serial (por ejemplo 12.5). Devuelve -1 si no llegó nada.');
    }
  };

  Blockly.Blocks['arduino_serial_read_char'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SER_READ_CHAR']);
      this.setOutput(true, 'String');
      this.setColour('#FFA040');
      this.setTooltip('Lee una sola tecla o carácter enviado desde el monitor serial (por ejemplo w, a, s, d), sin esperar. Devuelve "" si no llegó nada.');
    }
  };

  Blockly.Blocks['arduino_serial_has_data'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SER_HAS_DATA']);
      this.setOutput(true, 'Boolean');
      this.setColour('#FFA040');
      this.setTooltip('Verdadero si llegó algo desde el monitor serial que aún no se ha leído.');
    }
  };

  Blockly.Blocks['arduino_serial_available'] = {
    init: function () {
      this.appendDummyInput().appendField('Serial.available()');
      this.setOutput(true, 'Number');
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['arduino_serial_read'] = {
    init: function () {
      this.appendDummyInput().appendField('Serial.read()');
      this.setOutput(true, 'Number');
      this.setColour('#FFA040');
    }
  };

  // I2C
  Blockly.Blocks['i2c_begin'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_BEGIN']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
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
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['i2c_read'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_READ']);
      this.setOutput(true, 'Number');
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['i2c_begin_transmission'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_BEGIN_TX']);
      this.appendValueInput('ADDRESS').setCheck('Number').appendField("Address");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['i2c_write'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck(null).appendField(Blockly.Msg['B_I2C_WRITE']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
    }
  };

  Blockly.Blocks['i2c_end_transmission'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_I2C_END_TX']);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFA040');
    }
  };
};

// Funciones auxiliares C++ para leer comandos sin que el salto de línea
// (\n, \r\n) enviado por el monitor serial o la app Bluetooth interfiera.
const READ_TEXT_HELPER =
  'String m4rkReadText(Stream &s) {\n' +
  '  if (!s.available()) return "";\n' +
  '  String t = s.readString();\n' +
  '  t.trim();\n' +
  '  return t;\n' +
  '}';

const READ_NUMBER_HELPER =
  'long m4rkReadNumber(Stream &s) {\n' +
  '  String t = m4rkReadText(s);\n' +
  '  if (t.length() == 0) return -1;\n' +
  '  return t.toInt();\n' +
  '}';

const READ_DECIMAL_HELPER =
  'float m4rkReadDecimal(Stream &s) {\n' +
  '  String t = m4rkReadText(s);\n' +
  '  if (t.length() == 0) return -1;\n' +
  '  return t.toFloat();\n' +
  '}';

// Lee un solo carácter sin esperar, ignorando saltos de línea y espacios.
// Devuelve String para poder compararlo directamente con un bloque de texto ("w").
const READ_CHAR_HELPER =
  'String m4rkReadChar(Stream &s) {\n' +
  '  while (s.available()) {\n' +
  '    char c = s.read();\n' +
  '    if (c != \'\\n\' && c != \'\\r\' && c != \' \') return String(c);\n' +
  '  }\n' +
  '  return "";\n' +
  '}';

// Tiempo de espera corto: readString() espera 1 s por defecto tras el último carácter.
const READ_TIMEOUT_MS = 50;

export const defineCommsGenerators = (Arduino: any) => {
  type ReadKind = 'text' | 'number' | 'decimal' | 'char' | 'none';

  const addReadHelpers = (kind: ReadKind) => {
    if (kind === 'none') return;
    if (kind === 'char') {
      Arduino.definitions_['m4rk_read_char'] = READ_CHAR_HELPER;
      return;
    }
    Arduino.definitions_['m4rk_read_text'] = READ_TEXT_HELPER;
    if (kind === 'number') Arduino.definitions_['m4rk_read_number'] = READ_NUMBER_HELPER;
    if (kind === 'decimal') Arduino.definitions_['m4rk_read_decimal'] = READ_DECIMAL_HELPER;
  };

  const requireSerialReader = (kind: ReadKind) => {
    addReadHelpers(kind);
    // Si el usuario no puso "Iniciar Serial", se inicia a 9600 para que la lectura funcione.
    if (!Arduino.setups_['serial']) Arduino.setups_['serial'] = 'Serial.begin(9600);';
    Arduino.setups_['serial_timeout'] = `Serial.setTimeout(${READ_TIMEOUT_MS});`;
  };

  const requireBluetoothReader = (kind: ReadKind) => {
    addReadHelpers(kind);
    Arduino.setups_['bt_timeout'] = `BTSerial.setTimeout(${READ_TIMEOUT_MS});`;
  };

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

  Arduino.forBlock['bluetooth_read_string'] = function () {
    requireBluetoothReader('text');
    return ['m4rkReadText(BTSerial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['bluetooth_read_number'] = function () {
    requireBluetoothReader('number');
    return ['m4rkReadNumber(BTSerial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['bluetooth_read_decimal'] = function () {
    requireBluetoothReader('decimal');
    return ['m4rkReadDecimal(BTSerial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['bluetooth_read_char'] = function () {
    requireBluetoothReader('char');
    return ['m4rkReadChar(BTSerial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['bluetooth_has_data'] = function () {
    return ['(BTSerial.available() > 0)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['bluetooth_send_string'] = function (block: Blockly.Block) {
    const data = Arduino.valueToCode(block, 'DATA', Arduino.ORDER_ATOMIC) || '""';
    return `BTSerial.println(${data});\n`;
  };

  // Imprimir sin "Iniciar Serial" no mostraba nada: se inicia a 9600 automáticamente (GEN-02).
  // Si el usuario pone "Iniciar Serial", su velocidad reemplaza esta.
  const ensureSerialBegin = () => {
    if (!Arduino.setups_['serial']) Arduino.setups_['serial'] = 'Serial.begin(9600);';
  };

  Arduino.forBlock['arduino_serial_begin'] = function (block: Blockly.Block) {
    const baud = block.getFieldValue('BAUD');
    Arduino.setups_['serial'] = `Serial.begin(${baud});`;
    return '';
  };

  Arduino.forBlock['arduino_serial_print'] = function (block: Blockly.Block) {
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '""';
    ensureSerialBegin();
    return `Serial.print(${val});\n`;
  };

  Arduino.forBlock['arduino_serial_println'] = function (block: Blockly.Block) {
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '""';
    ensureSerialBegin();
    return `Serial.println(${val});\n`;
  };

  Arduino.forBlock['arduino_serial_read_text'] = function () {
    requireSerialReader('text');
    return ['m4rkReadText(Serial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_serial_read_number'] = function () {
    requireSerialReader('number');
    return ['m4rkReadNumber(Serial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_serial_read_decimal'] = function () {
    requireSerialReader('decimal');
    return ['m4rkReadDecimal(Serial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_serial_read_char'] = function () {
    requireSerialReader('char');
    return ['m4rkReadChar(Serial)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_serial_has_data'] = function () {
    requireSerialReader('none');
    return ['(Serial.available() > 0)', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_serial_available'] = function () {
    ensureSerialBegin();
    return ['Serial.available()', Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_serial_read'] = function () {
    ensureSerialBegin();
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

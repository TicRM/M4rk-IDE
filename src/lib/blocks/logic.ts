import * as Blockly from 'blockly';

export const defineLogicBlocks = () => {
  Blockly.Blocks['arduino_map'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck('Number').appendField('map');
      this.appendValueInput('FROM_LOW').setCheck('Number').appendField('de min');
      this.appendValueInput('FROM_HIGH').setCheck('Number').appendField('de max');
      this.appendValueInput('TO_LOW').setCheck('Number').appendField('a min');
      this.appendValueInput('TO_HIGH').setCheck('Number').appendField('a max');
      this.setOutput(true, 'Number');
      this.setColour('#59C059'); // Matemáticas (VexIQ Green)
    }
  };

  Blockly.Blocks['arduino_constrain'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck('Number').appendField('constrain');
      this.appendValueInput('LOW').setCheck('Number').appendField('min');
      this.appendValueInput('HIGH').setCheck('Number').appendField('max');
      this.setOutput(true, 'Number');
      this.setColour('#59C059');
    }
  };

  Blockly.Blocks['arduino_text'] = {
    init: function () {
      this.appendDummyInput().appendField('"').appendField(new Blockly.FieldTextInput('Hello'), 'TEXT').appendField('"');
      this.setOutput(true, 'String');
      this.setColour('#59C059');
    }
  };
};

export const defineLogicGenerators = (Arduino: any) => {
  Arduino.forBlock['arduino_map'] = function (block: Blockly.Block) {
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '0';
    const fl = Arduino.valueToCode(block, 'FROM_LOW', Arduino.ORDER_ATOMIC) || '0';
    const fh = Arduino.valueToCode(block, 'FROM_HIGH', Arduino.ORDER_ATOMIC) || '1023';
    const tl = Arduino.valueToCode(block, 'TO_LOW', Arduino.ORDER_ATOMIC) || '0';
    const th = Arduino.valueToCode(block, 'TO_HIGH', Arduino.ORDER_ATOMIC) || '255';
    return [`map(${val}, ${fl}, ${fh}, ${tl}, ${th})`, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_constrain'] = function (block: Blockly.Block) {
    const val = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ATOMIC) || '0';
    const low = Arduino.valueToCode(block, 'LOW', Arduino.ORDER_ATOMIC) || '0';
    const high = Arduino.valueToCode(block, 'HIGH', Arduino.ORDER_ATOMIC) || '255';
    return [`constrain(${val}, ${low}, ${high})`, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['arduino_text'] = function (block: Blockly.Block) {
    const text = block.getFieldValue('TEXT');
    return [`"${text}"`, Arduino.ORDER_ATOMIC] as [string, number];
  };

  // Standard Logic & Control Wrappers for Arduino Generator
  Arduino.forBlock['controls_if'] = function (block: Blockly.Block) {
    let n = 0;
    let code = '';
    let branchCode, conditionCode;
    do {
      conditionCode = Arduino.valueToCode(block, 'IF' + n, Arduino.ORDER_NONE) || 'false';
      branchCode = Arduino.statementToCode(block, 'DO' + n);
      code += (n > 0 ? ' else ' : '') + `if (${conditionCode}) {\n${branchCode}}`;
      ++n;
    } while (block.getInput('IF' + n));
    if (block.getInput('ELSE')) {
      branchCode = Arduino.statementToCode(block, 'ELSE');
      code += ` else {\n${branchCode}}`;
    }
    return code + '\n';
  };

  Arduino.forBlock['controls_repeat_ext'] = function (block: Blockly.Block) {
    const times = Arduino.valueToCode(block, 'TIMES', Arduino.ORDER_ATOMIC) || '10';
    const branch = Arduino.statementToCode(block, 'DO');
    return `for (int i = 0; i < ${times}; i++) {\n${branch}}\n`;
  };

  Arduino.forBlock['controls_whileUntil'] = function (block: Blockly.Block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    let argument0 = Arduino.valueToCode(block, 'BOOL', Arduino.ORDER_NONE) || 'false';
    const branch = Arduino.statementToCode(block, 'DO');
    if (until) {
      argument0 = `!${argument0}`;
    }
    return `while (${argument0}) {\n${branch}}\n`;
  };

  Arduino.forBlock['controls_for'] = function (block: Blockly.Block) {
    const varId = block.getFieldValue('VAR');
    const variable = block.workspace.getVariableById(varId);
    const varName = Arduino.getVariableName(variable.name);

    const argument0 = Arduino.valueToCode(block, 'FROM', Arduino.ORDER_ASSIGNMENT) || '0';
    const argument1 = Arduino.valueToCode(block, 'TO', Arduino.ORDER_ASSIGNMENT) || '10';
    const increment = Arduino.valueToCode(block, 'BY', Arduino.ORDER_ASSIGNMENT) || '1';
    const branch = Arduino.statementToCode(block, 'DO');
    return `for (int ${varName} = ${argument0}; ${varName} <= ${argument1}; ${varName} += ${increment}) {\n${branch}}\n`;
  };

  Arduino.forBlock['math_number'] = function (block: Blockly.Block) {
    const code = String(block.getFieldValue('NUM'));
    return [code, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['math_arithmetic'] = function (block: Blockly.Block) {
    const OPERATORS: any = {
      'ADD': [' + ', Arduino.ORDER_ADDITIVE],
      'MINUS': [' - ', Arduino.ORDER_ADDITIVE],
      'MULTIPLY': [' * ', Arduino.ORDER_MULTIPLICATIVE],
      'DIVIDE': [' / ', Arduino.ORDER_MULTIPLICATIVE],
      'POWER': [null, Arduino.ORDER_NONE]
    };
    const tuple = OPERATORS[block.getFieldValue('OP')];
    const operator = tuple[0];
    const order = tuple[1];
    const arg0 = Arduino.valueToCode(block, 'A', order) || '0';
    const arg1 = Arduino.valueToCode(block, 'B', order) || '0';
    if (!operator) return [`pow(${arg0}, ${arg1})`, Arduino.ORDER_UNARY_POSTFIX] as [string, number];
    return [arg0 + operator + arg1, order] as [string, number];
  };

  Arduino.forBlock['logic_compare'] = function (block: Blockly.Block) {
    const OPS: any = { 'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>=' };
    const op = OPS[block.getFieldValue('OP')];
    const arg0 = Arduino.valueToCode(block, 'A', Arduino.ORDER_RELATIONAL) || '0';
    const arg1 = Arduino.valueToCode(block, 'B', Arduino.ORDER_RELATIONAL) || '0';
    return [`${arg0} ${op} ${arg1}`, Arduino.ORDER_RELATIONAL] as [string, number];
  };

  Arduino.forBlock['logic_operation'] = function (block: Blockly.Block) {
    const op = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
    const order = (op == '&&') ? Arduino.ORDER_LOGICAL_AND : Arduino.ORDER_LOGICAL_OR;
    const argument0 = Arduino.valueToCode(block, 'A', order) || 'false';
    const argument1 = Arduino.valueToCode(block, 'B', order) || 'false';
    return [argument0 + ' ' + op + ' ' + argument1, order] as [string, number];
  };

  Arduino.forBlock['logic_negate'] = function (block: Blockly.Block) {
    const argument0 = Arduino.valueToCode(block, 'BOOL', Arduino.ORDER_UNARY_PREFIX) || 'true';
    return ['!' + argument0, Arduino.ORDER_UNARY_PREFIX] as [string, number];
  };

  Arduino.forBlock['logic_boolean'] = function (block: Blockly.Block) {
    const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
    return [code, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['variables_get'] = function (block: Blockly.Block) {
    const varId = block.getFieldValue('VAR');
    const variable = block.workspace.getVariableById(varId);
    const varName = Arduino.getVariableName(variable.name);
    return [varName, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['variables_set'] = function (block: Blockly.Block) {
    const varId = block.getFieldValue('VAR');
    const variable = block.workspace.getVariableById(varId);
    const varName = Arduino.getVariableName(variable.name);

    const value = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ASSIGNMENT) || '0';
    return `${varName} = ${value};\n`;
  };
};

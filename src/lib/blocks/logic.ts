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
      this.setColour('#66BB6A'); // Matemáticas (VexIQ Green)
    }
  };

  Blockly.Blocks['arduino_constrain'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck('Number').appendField('constrain');
      this.appendValueInput('LOW').setCheck('Number').appendField('min');
      this.appendValueInput('HIGH').setCheck('Number').appendField('max');
      this.setOutput(true, 'Number');
      this.setColour('#66BB6A');
    }
  };

  Blockly.Blocks['arduino_text'] = {
    init: function () {
      this.appendDummyInput().appendField('"').appendField(new Blockly.FieldTextInput('Hello'), 'TEXT').appendField('"');
      this.setOutput(true, 'String');
      this.setColour('#66BB6A');
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
    // Escapar \, comillas y saltos de línea para que el texto no rompa el C++ (GEN-04)
    const text = String(block.getFieldValue('TEXT') ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
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
    const argument0 = Arduino.valueToCode(block, 'BOOL', Arduino.ORDER_NONE) || 'false';
    const branch = Arduino.statementToCode(block, 'DO');
    // "repetir hasta X" = mientras NO X. Con paréntesis: !(x > 5), no !x > 5 (GEN-15)
    const condition = until ? `!(${argument0})` : argument0;
    return `while (${condition}) {\n${branch}}\n`;
  };

  Arduino.forBlock['controls_for'] = function (block: Blockly.Block) {
    const varId = block.getFieldValue('VAR');
    const variable = block.workspace.getVariableById(varId);
    const varName = Arduino.getVariableName(variable?.name ?? 'i');

    const from = Arduino.valueToCode(block, 'FROM', Arduino.ORDER_ASSIGNMENT) || '0';
    const to = Arduino.valueToCode(block, 'TO', Arduino.ORDER_ASSIGNMENT) || '10';
    const by = Arduino.valueToCode(block, 'BY', Arduino.ORDER_ASSIGNMENT) || '1';
    const branch = Arduino.statementToCode(block, 'DO');

    // Se usa la variable global (no se redeclara con "int"), así su valor se ve
    // fuera del bucle. Como en Blockly, el sentido depende de "desde" y "hasta":
    // de 10 a 1 cuenta hacia atrás aunque el paso sea positivo (GEN-05).
    const isNum = (s: string) => /^-?\d+(\.\d+)?$/.test(s);
    if (isNum(from) && isNum(to) && isNum(by)) {
      const up = Number(from) <= Number(to);
      const step = Math.abs(Number(by)) || 1;
      const cmp = up ? '<=' : '>=';
      const inc = step === 1 ? (up ? `${varName}++` : `${varName}--`) : `${varName} ${up ? '+=' : '-='} ${step}`;
      return `for (${varName} = ${from}; ${varName} ${cmp} ${to}; ${inc}) {\n${branch}}\n`;
    }

    // Valores calculados: el sentido se decide al ejecutar.
    const numType = variable?.type === 'Decimal' ? 'float' : 'long';
    const start = `${varName}_desde`;
    const end = `${varName}_hasta`;
    const step = `${varName}_paso`;
    return (
      `{\n` +
      `  ${numType} ${start} = ${from};\n` +
      `  ${numType} ${end} = ${to};\n` +
      `  ${numType} ${step} = abs(${by});\n` +
      `  if (${start} > ${end}) ${step} = -${step};\n` +
      `  for (${varName} = ${start}; ${step} > 0 ? ${varName} <= ${end} : ${varName} >= ${end}; ${varName} += ${step}) {\n` +
      (branch ? Arduino.prefixLines(branch, '  ') : '') +
      `  }\n` +
      `}\n`
    );
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

  // variables_get / variables_set / math_change: ver variables.ts
};

import * as Blockly from 'blockly';

export const setupArduinoGenerator = (Arduino: any) => {
  // Prioridad de operadores C++
  Arduino.ORDER_ATOMIC = 0;
  Arduino.ORDER_UNARY_POSTFIX = 1;
  Arduino.ORDER_UNARY_PREFIX = 2;
  Arduino.ORDER_MULTIPLICATIVE = 3;
  Arduino.ORDER_ADDITIVE = 4;
  Arduino.ORDER_SHIFT = 5;
  Arduino.ORDER_RELATIONAL = 6;
  Arduino.ORDER_EQUALITY = 7;
  Arduino.ORDER_BITWISE_AND = 8;
  Arduino.ORDER_BITWISE_XOR = 9;
  Arduino.ORDER_BITWISE_OR = 10;
  Arduino.ORDER_LOGICAL_AND = 11;
  Arduino.ORDER_LOGICAL_OR = 12;
  Arduino.ORDER_CONDITIONAL = 13;
  Arduino.ORDER_ASSIGNMENT = 14;
  Arduino.ORDER_NONE = 99;

  // Inicialización de listas para definiciones
  Arduino.init = function (workspace: Blockly.Workspace) {
    this.definitions_ = {};
    this.setups_ = {};
    this.variables_ = {};

    // Declarar variables globales automáticamente
    const variables = workspace.getVariableMap().getAllVariables();
    for (const variable of variables) {
      const varName = variable.name.replace(/[^a-zA-Z0-9_]/g, '_');
      this.variables_[varName] = `int ${varName} = 0;`;
    }
  };

  // Construcción del código final
  Arduino.finish = function (code: string) {
    const definitions = Object.values(this.definitions_).join('\n');
    const variables = Object.values(this.variables_).join('\n');
    const setups = Object.values(this.setups_).join('\n  ');

    if (code.includes('void setup()') || code.includes('void loop()')) {
      let patched = code;
      if (setups.trim()) {
        patched = patched.replace(
          /void\s+setup\s*\(\s*\)\s*\{\s*/m,
          (m: string) => `${m}\n  ${setups}\n`
        );
      }
      return `// Generado por M4rk-IDE\n${definitions}\n${variables}\n\n${patched}`;
    }
  };

  Arduino.workspaceToCode = function (workspace: Blockly.Workspace) {
    this.init(workspace);
    let codeArray = [];

    const blocks = workspace.getTopBlocks(true);

    const validTopBlocks = [
      'arduino_setup_loop',
      'arduino_start',
      'procedures_defnoreturn',
      'procedures_defreturn'
    ];

    for (const block of blocks) {
      if (validTopBlocks.includes(block.type)) {
        let line = this.blockToCode(block);
        if (Array.isArray(line)) {
          line = line[0];
        }
        if (line) {
          codeArray.push(line);
        }
      }
    }

    let code = codeArray.join('\n');
    code = this.finish(code);

    if (code) {
      code = code.replace(/^\s+\n/, '');
      code = code.replace(/\n\s+$/, '\n');
      code = code.replace(/[ \t]+\n/g, '\n');
    }

    return code;
  };

  Arduino.scrub_ = function (block: Blockly.Block, code: string) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = this.blockToCode(nextBlock);
    return code + nextCode;
  };

  Arduino.getVariableName = function (name: string) {
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  };

  Arduino.forBlock = Arduino.forBlock || {};

  Arduino.forBlock['arduino_setup_loop'] = function (block: Blockly.Block) {
    const setupCode = Arduino.statementToCode(block, 'SETUP');
    const loopCode = Arduino.statementToCode(block, 'LOOP');
    return `void setup() {\n${setupCode}}\n\nvoid loop() {\n${loopCode}}\n`;
  };
};

export const defineCoreBlocks = () => {
  Blockly.Blocks['arduino_setup_loop'] = {
    init: function () {
      this.appendDummyInput().appendField(Blockly.Msg['B_COM_SETUP_LOOP']);
      this.appendStatementInput('SETUP').setCheck(null).appendField(Blockly.Msg['B_COM_SETUP']);
      this.appendStatementInput('LOOP').setCheck(null).appendField(Blockly.Msg['B_COM_LOOP']);
      this.setColour('#FFBF00'); // Eventos style
      this.setTooltip('Estructura principal con setup y loop');
    }
  };
};

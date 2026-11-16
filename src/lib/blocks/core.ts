import * as Blockly from 'blockly';
import { getVarTypeInfo, buildCppNames, toCppName } from './variables';

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
    this.warnings_ = [];

    // Declarar variables globales con el tipo elegido al crearlas.
    // varNames_: nombre visible -> nombre C++ seguro (sin palabras reservadas ni colisiones).
    const variables = workspace.getVariableMap().getAllVariables();
    this.varNames_ = buildCppNames(variables);
    for (const variable of variables) {
      const varName = this.varNames_[variable.name];
      const info = getVarTypeInfo(variable.type);
      this.variables_[varName] = `${info.cType} ${varName} = ${info.initValue};`;
    }
  };

  // Construcción del código final
  // Siempre devuelve un programa válido. Si falta el bloque principal se genera
  // un setup()/loop() vacío, para que el panel Código nunca muestre texto viejo (GEN-06).
  Arduino.finish = function (code: string) {
    const definitions = Object.values(this.definitions_).join('\n');
    const variables = Object.values(this.variables_).join('\n');
    const setups = Object.values(this.setups_).join('\n  ');

    let patched = code;
    if (!patched.includes('void setup()')) {
      patched = `void setup() {\n}\n\nvoid loop() {\n}\n${patched ? '\n' + patched : ''}`;
    }
    if (setups.trim()) {
      patched = patched.replace(
        /void\s+setup\s*\(\s*\)\s*\{[ \t]*\n?/m,
        (m: string) => `${m.trimEnd()}\n  ${setups}\n`
      );
    }
    const warnings = (this.warnings_ as string[]).map((w) => `// ⚠ ${w}`).join('\n');
    const header = warnings ? `// Generado por M4rk-IDE\n${warnings}` : '// Generado por M4rk-IDE';
    // Solo se incluyen las secciones con contenido, separadas por una línea en blanco
    return [header, definitions, variables, patched.trim()].filter((s) => s.trim()).join('\n\n') + '\n';
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

    const mainBlockTypes = ['arduino_setup_loop', 'arduino_start'];
    const mainName = Blockly.Msg['B_COM_SETUP_LOOP'] || 'Arduino Setup & Loop';
    let hasMain = false;
    let extraMain = 0;
    let loose = 0;

    for (const block of blocks) {
      if (!block.isEnabled()) continue;
      if (mainBlockTypes.includes(block.type)) {
        // Solo se usa el primer bloque principal: dos setup() no compilan.
        if (hasMain) { extraMain++; continue; }
        hasMain = true;
      } else if (!validTopBlocks.includes(block.type)) {
        loose++;
        continue;
      }
      let line = this.blockToCode(block);
      if (Array.isArray(line)) {
        line = line[0];
      }
      if (line) {
        codeArray.push(line);
      }
    }

    // Avisos que se escriben como comentario al inicio del código (GEN-06)
    if (!hasMain) {
      this.warnings_.push(`Falta el bloque "${mainName}" (categoría Eventos). Arrástralo y pon tus bloques dentro.`);
    }
    if (loose > 0) {
      this.warnings_.push(
        loose === 1
          ? `Hay 1 bloque suelto que no se incluye: debe ir dentro de "${mainName}".`
          : `Hay ${loose} bloques sueltos que no se incluyen: deben ir dentro de "${mainName}".`
      );
    }
    if (extraMain > 0) {
      this.warnings_.push(
        extraMain === 1
          ? `Solo se usa un bloque "${mainName}"; el otro se ignora.`
          : `Solo se usa un bloque "${mainName}"; se ignoran los otros ${extraMain}.`
      );
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
    return (this.varNames_ && this.varNames_[name]) || toCppName(name);
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
      this.setColour('#FFD54F'); // Eventos style
      this.setTooltip('Estructura principal con setup y loop');
    }
  };
};

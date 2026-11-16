import * as Blockly from 'blockly';

/**
 * Variables con tipo.
 *
 * Al crear una variable el estudiante elige su tipo (Número, Decimal, Texto o
 * Verdadero/Falso) y el generador la declara con el tipo C++ correcto.
 * El tipo se guarda en el XML del proyecto (<variable type="...">).
 * Las variables de proyectos antiguos (sin tipo) se tratan como Número.
 */
export interface VarTypeInfo {
  id: string;            // tipo guardado en la variable de Blockly
  cType: string;         // tipo C++ generado
  initValue: string;     // valor inicial / valor por defecto al asignar
  buttonMsg: string;     // clave Blockly.Msg del botón "Crear variable ..."
  labelMsg: string;      // clave Blockly.Msg del título del grupo en el menú
  numeric: boolean;      // permite el bloque "cambiar en"
}

export const VAR_TYPES: VarTypeInfo[] = [
  { id: 'Number', cType: 'long', initValue: '0', buttonMsg: 'M4RK_VAR_BTN_NUMBER', labelMsg: 'M4RK_VAR_TYPE_NUMBER', numeric: true },
  { id: 'Decimal', cType: 'float', initValue: '0.0', buttonMsg: 'M4RK_VAR_BTN_DECIMAL', labelMsg: 'M4RK_VAR_TYPE_DECIMAL', numeric: true },
  { id: 'String', cType: 'String', initValue: '""', buttonMsg: 'M4RK_VAR_BTN_TEXT', labelMsg: 'M4RK_VAR_TYPE_TEXT', numeric: false },
  { id: 'Boolean', cType: 'bool', initValue: 'false', buttonMsg: 'M4RK_VAR_BTN_BOOL', labelMsg: 'M4RK_VAR_TYPE_BOOL', numeric: false },
];

// Título del próximo diálogo de nombre (p. ej. "Crear variable Número").
// Lo consume BlocklyDialogs al abrir el diálogo.
let nextPromptTitle: string | null = null;
export const consumePromptTitle = (): string | null => {
  const t = nextPromptTitle;
  nextPromptTitle = null;
  return t;
};

export const getVarTypeInfo = (type: string | undefined | null): VarTypeInfo =>
  VAR_TYPES.find((t) => t.id === type) ?? VAR_TYPES[0];

// ---------------------------------------------------------------------------
// Nombres seguros para C++ (GEN-07)
// El bloque muestra el nombre que eligió el estudiante; el código usa uno válido.
// ---------------------------------------------------------------------------
const RESERVED_NAMES = new Set([
  // Palabras clave de C++
  'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch',
  'char', 'char16_t', 'char32_t', 'class', 'compl', 'const', 'constexpr', 'const_cast', 'continue', 'decltype',
  'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false',
  'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
  'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'register',
  'reinterpret_cast', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct',
  'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union',
  'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq', 'NULL',
  // Tipos de Arduino
  'boolean', 'byte', 'word', 'String', 'size_t', 'int8_t', 'uint8_t', 'int16_t', 'uint16_t', 'int32_t', 'uint32_t',
  // Constantes de Arduino
  'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN', 'PI', 'HALF_PI', 'TWO_PI', 'DEG_TO_RAD',
  'RAD_TO_DEG', 'EULER', 'LSBFIRST', 'MSBFIRST', 'CHANGE', 'RISING', 'FALLING', 'DEC', 'HEX', 'OCT', 'BIN',
  'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7',
  // Funciones y objetos de Arduino (y los que genera el IDE)
  'setup', 'loop', 'main', 'delay', 'delayMicroseconds', 'millis', 'micros', 'pinMode', 'digitalWrite',
  'digitalRead', 'analogRead', 'analogWrite', 'analogReference', 'pulseIn', 'tone', 'noTone', 'shiftIn',
  'shiftOut', 'map', 'constrain', 'min', 'max', 'abs', 'pow', 'sqrt', 'sq', 'sin', 'cos', 'tan', 'round',
  'random', 'randomSeed', 'bit', 'bitRead', 'bitWrite', 'bitSet', 'bitClear', 'lowByte', 'highByte',
  'attachInterrupt', 'detachInterrupt', 'interrupts', 'noInterrupts', 'Serial', 'Serial1', 'Wire', 'SPI',
  'BTSerial', 'WiFi', 'Servo',
]);

const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Convierte el nombre visible en un identificador C++ válido (sin resolver colisiones). */
export const toCppName = (name: string): string => {
  let n = stripAccents(name).replace(/[^a-zA-Z0-9_]/g, '_');
  if (!n) n = 'variable';
  if (/^[0-9]/.test(n) || RESERVED_NAMES.has(n) || n.startsWith('m4rk')) n = `var_${n}`;
  return n;
};

/**
 * Asigna un nombre C++ único a cada variable. Si dos nombres quedan iguales
 * (por ejemplo "mi var" y "mi_var"), el segundo recibe un sufijo: mi_var_2.
 */
export const buildCppNames = (variables: { name: string }[]): Record<string, string> => {
  const used = new Set<string>();
  const names: Record<string, string> = {};
  for (const v of variables) {
    const base = toCppName(v.name);
    let candidate = base;
    let i = 2;
    while (used.has(candidate)) candidate = `${base}_${i++}`;
    used.add(candidate);
    names[v.name] = candidate;
  }
  return names;
};

/** Problema del nombre al crear/renombrar una variable, para avisar al estudiante. */
export const checkVariableName = (name: string): 'reserved' | 'digit' | null => {
  const t = name.trim();
  if (/^[0-9]/.test(t)) return 'digit';
  if (RESERVED_NAMES.has(t)) return 'reserved';
  return null;
};

// Bloque "sombra" que aparece ya puesto en "asignar", según el tipo.
const valueShadowFor = (t: VarTypeInfo) => {
  switch (t.id) {
    case 'String':
      return { type: 'arduino_text', fields: { TEXT: '' } };
    case 'Boolean':
      return { type: 'logic_boolean', fields: { BOOL: 'TRUE' } };
    default:
      return { type: 'math_number', fields: { NUM: 0 } };
  }
};

/**
 * Reemplaza la categoría "Variables" por defecto de Blockly:
 * un botón de creación por tipo y los bloques agrupados por tipo.
 * Debe llamarse después de Blockly.inject.
 */
export const registerTypedVariables = (workspace: Blockly.WorkspaceSvg) => {
  for (const t of VAR_TYPES) {
    workspace.registerButtonCallback(`M4RK_CREATE_VAR_${t.id}`, (button) => {
      nextPromptTitle = Blockly.Msg[t.buttonMsg] || null;
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), undefined, t.id);
    });
  }

  workspace.registerToolboxCategoryCallback('VARIABLE', (ws: Blockly.WorkspaceSvg) => {
    const items: Blockly.utils.toolbox.FlyoutItemInfoArray = [];

    for (const t of VAR_TYPES) {
      items.push({ kind: 'button', text: Blockly.Msg[t.buttonMsg] || t.id, callbackkey: `M4RK_CREATE_VAR_${t.id}` });
    }

    const allVars = ws.getVariableMap().getAllVariables();
    for (const t of VAR_TYPES) {
      const vars = allVars
        .filter((v) => getVarTypeInfo(v.type).id === t.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      if (vars.length === 0) continue;

      // 'webclass' aplica el mismo estilo que las etiquetas del resto del toolbox
      items.push({ kind: 'label', text: `── ${Blockly.Msg[t.labelMsg] || t.id} ──`, webclass: 'category-label' } as Blockly.utils.toolbox.FlyoutItemInfo);

      const first = vars[0];
      items.push({
        kind: 'block',
        type: 'variables_set',
        fields: { VAR: { id: first.getId() } },
        inputs: { VALUE: { shadow: valueShadowFor(t) } },
      });

      if (t.numeric) {
        items.push({
          kind: 'block',
          type: 'math_change',
          fields: { VAR: { id: first.getId() } },
          inputs: { DELTA: { shadow: { type: 'math_number', fields: { NUM: 1 } } } },
        });
      }

      for (const v of vars) {
        items.push({ kind: 'block', type: 'variables_get', fields: { VAR: { id: v.getId() } } });
      }
    }

    return items;
  });
};

export const defineVariableGenerators = (Arduino: any) => {
  const lookup = (block: Blockly.Block) => {
    const variable = block.workspace.getVariableById(block.getFieldValue('VAR'));
    return {
      name: Arduino.getVariableName(variable?.name ?? 'x'),
      info: getVarTypeInfo(variable?.type),
    };
  };

  Arduino.forBlock['variables_get'] = function (block: Blockly.Block) {
    return [lookup(block).name, Arduino.ORDER_ATOMIC] as [string, number];
  };

  Arduino.forBlock['variables_set'] = function (block: Blockly.Block) {
    const { name, info } = lookup(block);
    const value = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ASSIGNMENT) || info.initValue;
    return `${name} = ${value};\n`;
  };

  // "cambiar [variable] en N" (bloque estándar de Blockly; antes no tenía generador)
  Arduino.forBlock['math_change'] = function (block: Blockly.Block) {
    const { name } = lookup(block);
    const delta = Arduino.valueToCode(block, 'DELTA', Arduino.ORDER_ASSIGNMENT) || '1';
    return `${name} += ${delta};\n`;
  };
};

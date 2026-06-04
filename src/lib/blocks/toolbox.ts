export const arduinoToolbox = {
  kind: 'categoryToolbox',
  contents: [
    // ============================================
    // ESTRUCTURA
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_EVENTS}',
      colour: '#FFD54F',
      contents: [
        { kind: 'block', type: 'arduino_setup_loop' }
      ]
    },

    // ============================================
    // MOTORES 
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_MOTORS}',
      colour: '#5C9EFF',
      contents: [
        // Configuración
        {
          kind: 'label',
          text: '────────── Configuración ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'motor_setup' },
        
        // Control de Motores DC
        {
          kind: 'label',
          text: '────────── Motores DC ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'motor_run' },
        { kind: 'block', type: 'motor_control' },
        { kind: 'block', type: 'motor_stop' },
        
        // Servomotores
        {
          kind: 'label',
          text: '────────── Servomotores ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'arduino_servo_attach' },
        { kind: 'block', type: 'arduino_servo_write' }
      ]
    },

    // ============================================
    // HARDWARE IO
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_IO}',
      colour: '#6C63D9',
      contents: [
        // Digital
        {
          kind: 'label',
          text: '────────── Digital ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'arduino_digital_write' },
        { kind: 'block', type: 'arduino_digital_read' },
        { kind: 'block', type: 'arduino_pin_mode' },
        
        // Analógico
        {
          kind: 'label',
          text: '────────── Analógico ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'arduino_analog_write' },
        { kind: 'block', type: 'arduino_analog_read' },
        
        // Tiempo
        {
          kind: 'label',
          text: '────────── Tiempo ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'arduino_delay' },
        { kind: 'block', type: 'arduino_millis' },
        { kind: 'block', type: 'arduino_pin_number' }
      ]
    },

    // ============================================
    // SENSORES
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_SENSORS}',
      colour: '#4FC3B8',
      contents: [
        // Ultrasonido
        {
          kind: 'label',
          text: '────────── Ultrasonido ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'ultrasonic_setup' },
        { kind: 'block', type: 'ultrasonic_read' },
        
        // Color
        {
          kind: 'label',
          text: '────────── Color ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'color_sensor_read' },
        
        // Sonido
        {
          kind: 'label',
          text: '────────── Sonido ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'sound_sensor_read' }
      ]
    },

    // ============================================
    // COMUNICACIÓN
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_COMMS}',
      colour: '#FFA040',
      contents: [
        // Serial
        {
          kind: 'label',
          text: '────────── Puerto Serial ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'arduino_serial_begin' },
        { kind: 'block', type: 'arduino_serial_print' },
        { kind: 'block', type: 'arduino_serial_println' },
        
        // WiFi
        {
          kind: 'label',
          text: '──────────── WiFi ────────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'wifi_connect' },
        { kind: 'block', type: 'wifi_is_connected' },
        
        // Bluetooth
        {
          kind: 'label',
          text: '────────── Bluetooth ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'bluetooth_setup' },
        { kind: 'block', type: 'bluetooth_send_string' },
        { kind: 'block', type: 'bluetooth_read_string' },
        
        // I2C
        {
          kind: 'label',
          text: '──────────── I2C ────────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'i2c_begin' },
        { kind: 'block', type: 'i2c_begin_transmission' },
        { kind: 'block', type: 'i2c_write' },
        { kind: 'block', type: 'i2c_end_transmission' },
        { kind: 'block', type: 'i2c_request_from' },
        { kind: 'block', type: 'i2c_read' }
      ]
    },

    // ============================================
    // CONTROL
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_CONTROL}',
      colour: '#FF8A80',
      contents: [
        // Condicionales
        {
          kind: 'label',
          text: '────────── Si / Entonces ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'controls_if' },
        {
          kind: 'block',
          type: 'controls_if',
          extraState: { hasElse: true }
        },
        {
          kind: 'block',
          type: 'controls_if',
          extraState: { elseIfCount: 1, hasElse: true }
        },
        
        // Bucles
        {
          kind: 'label',
          text: '──────────── Bucles ────────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' }
      ]
    },

    // ============================================
    // MATEMÁTICAS
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_MATH}',
      colour: '#66BB6A',
      contents: [
        // Números
        {
          kind: 'label',
          text: '────────── Números ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'math_number' },
        
        // Operaciones
        {
          kind: 'label',
          text: '────────── Operaciones ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'arduino_map' },
        { kind: 'block', type: 'arduino_constrain' },
        
        // Lógica (operadores de comparación)
        {
          kind: 'label',
          text: '────────── Comparación ──────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_negate' },
        
        // Texto
        {
          kind: 'label',
          text: '──────────── Texto ────────────',
          webclass: 'category-label'
        },
        { kind: 'block', type: 'arduino_text' }
      ]
    },

    // ============================================
    // VARIABLES
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_VARS}',
      colour: '#EC6C9E',
      custom: 'VARIABLE'
    },

    // ============================================
    // FUNCIONES
    // ============================================
    {
      kind: 'category',
      name: '%{BKY_CAT_FUNCTIONS}',
      colour: '#C59BF0',
      custom: 'PROCEDURE'
    }
  ]
};
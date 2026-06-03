export const arduinoToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '%{BKY_CAT_EVENTS}',
      colour: '#FFBF00',
      contents: [
        { kind: 'block', type: 'arduino_setup_loop' }
      ]
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_MOTORS}',
      colour: '#4C97FF',
      contents: [
        { kind: 'block', type: 'motor_setup' },
        { kind: 'block', type: 'motor_run' },
        { kind: 'block', type: 'motor_stop' },
        { kind: 'block', type: 'arduino_servo_attach' },
        { kind: 'block', type: 'arduino_servo_write' }
      ]
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_IO}',
      colour: '#9966FF',
      contents: [
        { kind: 'block', type: 'arduino_digital_write' },
        { kind: 'block', type: 'arduino_digital_read' },
        { kind: 'block', type: 'arduino_analog_write' },
        { kind: 'block', type: 'arduino_analog_read' },
        { kind: 'block', type: 'arduino_pin_mode' },
        { kind: 'block', type: 'arduino_pin_number' },
        { kind: 'block', type: 'arduino_delay' },
        { kind: 'block', type: 'arduino_millis' }
      ]
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_SENSORS}',
      colour: '#5CB1D6',
      contents: [
        { kind: 'block', type: 'ultrasonic_setup' },
        { kind: 'block', type: 'ultrasonic_read' },
        { kind: 'block', type: 'color_sensor_read' },
        { kind: 'block', type: 'sound_sensor_read' }
      ]
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_COMMS}',
      colour: '#FF8C1A',
      contents: [
        { kind: 'block', type: 'wifi_connect' },
        { kind: 'block', type: 'wifi_is_connected' },
        { kind: 'block', type: 'bluetooth_setup' },
        { kind: 'block', type: 'bluetooth_send_string' },
        { kind: 'block', type: 'bluetooth_read_string' },
        { kind: 'block', type: 'arduino_serial_begin' },
        { kind: 'block', type: 'arduino_serial_print' },
        { kind: 'block', type: 'arduino_serial_println' },
        { kind: 'block', type: 'i2c_begin' },
        { kind: 'block', type: 'i2c_request_from' },
        { kind: 'block', type: 'i2c_read' },
        { kind: 'block', type: 'i2c_begin_transmission' },
        { kind: 'block', type: 'i2c_write' },
        { kind: 'block', type: 'i2c_end_transmission' }
      ]
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_CONTROL}',
      colour: '#FFAB19',
      contents: [
        { kind: 'block', type: 'controls_if' },
        {
          kind: 'block',
          type: 'controls_if',
          extraState: {
            hasElse: true
          }
        },
        {
          kind: 'block',
          type: 'controls_if',
          extraState: {
            elseIfCount: 1,
            hasElse: true
          }
        },
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' }
      ]
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_MATH}',
      colour: '#59C059',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'arduino_map' },
        { kind: 'block', type: 'arduino_constrain' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'arduino_text' }
      ]
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_VARS}',
      colour: '#FF6680',
      custom: 'VARIABLE'
    },
    {
      kind: 'category',
      name: '%{BKY_CAT_FUNCTIONS}',
      colour: '#FF4D6A',
      custom: 'PROCEDURE'
    }
  ]
};

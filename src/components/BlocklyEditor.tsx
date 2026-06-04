import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as Blockly from 'blockly';
import * as En from 'blockly/msg/en';
import * as Es from 'blockly/msg/es';
import { defineArduinoBlocks, createArduinoGenerator, arduinoToolbox } from '@/lib/blocks';
import { useIDE } from '@/contexts/IDEContext';
import { translations, Language } from '@/lib/i18n';
import { Blocks } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BlocklyEditorProps {
  onCodeChange?: (code: string) => void;
  initialXml?: string;
}

const BlocklyEditor: React.FC<BlocklyEditorProps> = ({ onCodeChange, initialXml }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const generatorRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const { setGeneratedCode, addConsoleMessage, language } = useIDE();
  const previousLanguageRef = useRef<Language>(language);
  const [isToolboxVisible, setIsToolboxVisible] = useState(true);
  const isMobile = useIsMobile();

  const toggleToolbox = useCallback(() => {
    if (workspaceRef.current) {
      const toolbox = workspaceRef.current.getToolbox();
      if (toolbox) {
        const nextVisible = !isToolboxVisible;
        toolbox.setVisible(nextVisible);
        setIsToolboxVisible(nextVisible);
        // Force resize so the workspace adapts to the new width
        setTimeout(() => {
          if (workspaceRef.current) {
            Blockly.svgResize(workspaceRef.current);
          }
        }, 50);
      }
    }
  }, [isToolboxVisible]);

  const generateCode = useCallback(() => {
    if (!workspaceRef.current || !generatorRef.current) return;
    
    try {
      generatorRef.current.init(workspaceRef.current);
      const code = generatorRef.current.workspaceToCode(workspaceRef.current);
      setGeneratedCode(code);
      onCodeChange?.(code);
    } catch (error) {
      console.error('Code generation error:', error);
      addConsoleMessage('error', `Error generando código: ${error}`);
    }
  }, [setGeneratedCode, onCodeChange, addConsoleMessage]);

  // Handle Language changes
  useEffect(() => {
    if (workspaceRef.current && language !== previousLanguageRef.current) {
      previousLanguageRef.current = language;
      
      // Set Blockly core locale for standard blocks (math, logic, loops, etc)
      Blockly.setLocale(language === 'es' ? Es : En);

      // Update Blockly.Msg for custom blocks
      const dict = translations[language];
      Blockly.Msg['CAT_MOTORS'] = dict.cat_motors;
      Blockly.Msg['CAT_IO'] = dict.cat_io;
      Blockly.Msg['CAT_SENSORS'] = dict.cat_sensors;
      Blockly.Msg['CAT_COMMS'] = dict.cat_comms;
      Blockly.Msg['CAT_CONTROL'] = dict.cat_control;
      Blockly.Msg['CAT_MATH'] = dict.cat_math;
      Blockly.Msg['CAT_VARS'] = dict.cat_vars;
      Blockly.Msg['CAT_EVENTS'] = dict.cat_events;
      Blockly.Msg['CAT_FUNCTIONS'] = dict.cat_functions;
      
      Blockly.Msg['B_MOTOR_SETUP'] = dict.b_motor_setup;
      Blockly.Msg['B_MOTOR_NAME'] = dict.b_motor_name;
      Blockly.Msg['B_MOTOR_RUN'] = dict.b_motor_run;
      Blockly.Msg['B_MOTOR_SPEED'] = dict.b_motor_speed;
      Blockly.Msg['B_MOTOR_STOP'] = dict.b_motor_stop;
      Blockly.Msg['B_SERVO_ATTACH'] = dict.b_servo_attach;
      Blockly.Msg['B_SERVO_AS'] = dict.b_servo_as;
      Blockly.Msg['B_SERVO_WRITE'] = dict.b_servo_write;

      Blockly.Msg['B_IO_PINMODE'] = dict.b_io_pinmode;
      Blockly.Msg['B_IO_MODE'] = dict.b_io_mode;
      Blockly.Msg['B_IO_WRITE_D'] = dict.b_io_write_d;
      Blockly.Msg['B_IO_READ_D'] = dict.b_io_read_d;
      Blockly.Msg['B_IO_VAL'] = dict.b_io_val;
      Blockly.Msg['B_IO_WRITE_A'] = dict.b_io_write_a;
      Blockly.Msg['B_IO_READ_A'] = dict.b_io_read_a;
      Blockly.Msg['B_IO_DELAY'] = dict.b_io_delay;
      Blockly.Msg['B_IO_MS'] = dict.b_io_ms;
      Blockly.Msg['B_IO_MILLIS'] = dict.b_io_millis;
      Blockly.Msg['B_IO_HIGH'] = dict.b_io_high;
      Blockly.Msg['B_IO_LOW'] = dict.b_io_low;

      Blockly.Msg['B_SNS_US_SETUP'] = dict.b_sns_us_setup;
      Blockly.Msg['B_SNS_TRIG'] = dict.b_sns_trig;
      Blockly.Msg['B_SNS_ECHO'] = dict.b_sns_echo;
      Blockly.Msg['B_SNS_US_READ'] = dict.b_sns_us_read;
      Blockly.Msg['B_SNS_US_READ_IN'] = dict.b_sns_us_read_in;
      Blockly.Msg['B_SNS_US_CM'] = dict.b_sns_us_cm;
      Blockly.Msg['B_SNS_US_INCH'] = dict.b_sns_us_inch;
      Blockly.Msg['B_SNS_COLOR_SENSOR'] = dict.b_sns_color_sensor;
      Blockly.Msg['B_SNS_S0'] = dict.b_sns_s0;
      Blockly.Msg['B_SNS_S1'] = dict.b_sns_s1;
      Blockly.Msg['B_SNS_S2'] = dict.b_sns_s2;
      Blockly.Msg['B_SNS_S3'] = dict.b_sns_s3;
      Blockly.Msg['B_SNS_OUT'] = dict.b_sns_out;
      Blockly.Msg['B_SNS_COMPONENT'] = dict.b_sns_component;
      Blockly.Msg['B_SNS_RED'] = dict.b_sns_red;
      Blockly.Msg['B_SNS_GREEN'] = dict.b_sns_green;
      Blockly.Msg['B_SNS_BLUE'] = dict.b_sns_blue;
      Blockly.Msg['B_SNS_COLOR_READ'] = dict.b_sns_color_read;
      Blockly.Msg['B_SNS_SOUND_SENSOR'] = dict.b_sns_sound_sensor;
      Blockly.Msg['B_SNS_PIN'] = dict.b_sns_pin;
      Blockly.Msg['B_SNS_SOUND_READ'] = dict.b_sns_sound_read;

      Blockly.Msg['B_COM_SETUP_LOOP'] = dict.b_com_setup_loop;
      Blockly.Msg['B_COM_SETUP'] = dict.b_com_setup;
      Blockly.Msg['B_COM_LOOP'] = dict.b_com_loop;
      Blockly.Msg['B_COM_WIFI_CON'] = dict.b_com_wifi_con;
      Blockly.Msg['B_COM_WIFI_SSID'] = dict.b_com_wifi_ssid;
      Blockly.Msg['B_COM_WIFI_PASS'] = dict.b_com_wifi_pass;
      Blockly.Msg['B_COM_WIFI_CHECK'] = dict.b_com_wifi_check;
      Blockly.Msg['B_COM_BT_SETUP'] = dict.b_com_bt_setup;
      Blockly.Msg['B_COM_BT_NAME'] = dict.b_com_bt_name;
      Blockly.Msg['B_COM_BT_SEND'] = dict.b_com_bt_send;
      Blockly.Msg['B_COM_BT_READ'] = dict.b_com_bt_read;
      Blockly.Msg['B_COM_SER_BEGIN'] = dict.b_com_ser_begin;
      Blockly.Msg['B_COM_SER_PRINT'] = dict.b_com_ser_print;
      Blockly.Msg['B_COM_SER_PRINTLN'] = dict.b_com_ser_println;
      Blockly.Msg['B_I2C_BEGIN'] = dict.b_i2c_begin;
      Blockly.Msg['B_I2C_REQ'] = dict.b_i2c_req;
      Blockly.Msg['B_I2C_BYTES'] = dict.b_i2c_bytes;
      Blockly.Msg['B_I2C_READ'] = dict.b_i2c_read;
      Blockly.Msg['B_I2C_BEGIN_TX'] = dict.b_i2c_begin_tx;
      Blockly.Msg['B_I2C_WRITE'] = dict.b_i2c_write;
      Blockly.Msg['B_I2C_END_TX'] = dict.b_i2c_end_tx;

      // Reload workspace
      try {
        const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
        workspaceRef.current.clear();
        workspaceRef.current.updateToolbox(JSON.parse(JSON.stringify(arduinoToolbox)));
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (e: any) {
        alert("Error cambiando idioma: " + e.message);
        console.error(e);
      }
    }
  }, [language]);

  // Force resize when component mounts or visibility changes
  const forceResize = useCallback(() => {
    if (workspaceRef.current && containerRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (workspaceRef.current) {
          Blockly.svgResize(workspaceRef.current);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    // Define Arduino blocks
    defineArduinoBlocks();
    
    // Create Generator
    generatorRef.current = createArduinoGenerator();

    // Create workspace with kids theme
    const kidsTheme = Blockly.Theme.defineTheme('arduino-kids', {
      name: 'arduino-kids',
      base: Blockly.Themes.Zelos,
      componentStyles: {
        workspaceBackgroundColour: '#f8fafc',
        toolboxBackgroundColour: '#f1f5f9',
        toolboxForegroundColour: '#475569',
        flyoutBackgroundColour: '#f8fafc',
        flyoutForegroundColour: '#334155',
        flyoutOpacity: 0.98,
        scrollbarColour: '#94a3b8',
        insertionMarkerColour: '#06b6d4',
        insertionMarkerOpacity: 0.4,
        scrollbarOpacity: 0.7,
        cursorColour: '#06b6d4',
      },
      fontStyle: {
        family: 'Nunito, Quicksand, sans-serif',
        weight: 'bold',
        size: 10,
      },
    });

    // Set Blockly core locale for standard blocks on initial load
    Blockly.setLocale(language === 'es' ? Es : En);

    // Init dictionary for first load
    const dict = translations[language];
    Blockly.Msg['CAT_MOTORS'] = dict.cat_motors;
    Blockly.Msg['CAT_IO'] = dict.cat_io;
    Blockly.Msg['CAT_SENSORS'] = dict.cat_sensors;
    Blockly.Msg['CAT_COMMS'] = dict.cat_comms;
    Blockly.Msg['CAT_CONTROL'] = dict.cat_control;
    Blockly.Msg['CAT_MATH'] = dict.cat_math;
    Blockly.Msg['CAT_VARS'] = dict.cat_vars;
    Blockly.Msg['CAT_EVENTS'] = dict.cat_events;
    Blockly.Msg['CAT_FUNCTIONS'] = dict.cat_functions;
    
    Blockly.Msg['B_MOTOR_SETUP'] = dict.b_motor_setup;
    Blockly.Msg['B_MOTOR_NAME'] = dict.b_motor_name;
    Blockly.Msg['B_MOTOR_RUN'] = dict.b_motor_run;
    Blockly.Msg['B_MOTOR_SPEED'] = dict.b_motor_speed;
    Blockly.Msg['B_MOTOR_STOP'] = dict.b_motor_stop;
    Blockly.Msg['B_SERVO_ATTACH'] = dict.b_servo_attach;
    Blockly.Msg['B_SERVO_AS'] = dict.b_servo_as;
    Blockly.Msg['B_SERVO_WRITE'] = dict.b_servo_write;

    Blockly.Msg['B_IO_PINMODE'] = dict.b_io_pinmode;
    Blockly.Msg['B_IO_MODE'] = dict.b_io_mode;
    Blockly.Msg['B_IO_WRITE_D'] = dict.b_io_write_d;
    Blockly.Msg['B_IO_READ_D'] = dict.b_io_read_d;
    Blockly.Msg['B_IO_VAL'] = dict.b_io_val;
    Blockly.Msg['B_IO_WRITE_A'] = dict.b_io_write_a;
    Blockly.Msg['B_IO_READ_A'] = dict.b_io_read_a;
    Blockly.Msg['B_IO_DELAY'] = dict.b_io_delay;
    Blockly.Msg['B_IO_MS'] = dict.b_io_ms;
    Blockly.Msg['B_IO_MILLIS'] = dict.b_io_millis;
    Blockly.Msg['B_IO_HIGH'] = dict.b_io_high;
    Blockly.Msg['B_IO_LOW'] = dict.b_io_low;

    Blockly.Msg['B_SNS_US_SETUP'] = dict.b_sns_us_setup;
    Blockly.Msg['B_SNS_TRIG'] = dict.b_sns_trig;
    Blockly.Msg['B_SNS_ECHO'] = dict.b_sns_echo;
    Blockly.Msg['B_SNS_US_READ'] = dict.b_sns_us_read;
    Blockly.Msg['B_SNS_US_READ_IN'] = dict.b_sns_us_read_in;
    Blockly.Msg['B_SNS_US_CM'] = dict.b_sns_us_cm;
    Blockly.Msg['B_SNS_US_INCH'] = dict.b_sns_us_inch;
    Blockly.Msg['B_SNS_COLOR_SENSOR'] = dict.b_sns_color_sensor;
    Blockly.Msg['B_SNS_S0'] = dict.b_sns_s0;
    Blockly.Msg['B_SNS_S1'] = dict.b_sns_s1;
    Blockly.Msg['B_SNS_S2'] = dict.b_sns_s2;
    Blockly.Msg['B_SNS_S3'] = dict.b_sns_s3;
    Blockly.Msg['B_SNS_OUT'] = dict.b_sns_out;
    Blockly.Msg['B_SNS_COMPONENT'] = dict.b_sns_component;
    Blockly.Msg['B_SNS_RED'] = dict.b_sns_red;
    Blockly.Msg['B_SNS_GREEN'] = dict.b_sns_green;
    Blockly.Msg['B_SNS_BLUE'] = dict.b_sns_blue;
    Blockly.Msg['B_SNS_COLOR_READ'] = dict.b_sns_color_read;
    Blockly.Msg['B_SNS_SOUND_SENSOR'] = dict.b_sns_sound_sensor;
    Blockly.Msg['B_SNS_PIN'] = dict.b_sns_pin;
    Blockly.Msg['B_SNS_SOUND_READ'] = dict.b_sns_sound_read;

    Blockly.Msg['B_COM_SETUP_LOOP'] = dict.b_com_setup_loop;
    Blockly.Msg['B_COM_SETUP'] = dict.b_com_setup;
    Blockly.Msg['B_COM_LOOP'] = dict.b_com_loop;
    Blockly.Msg['B_COM_WIFI_CON'] = dict.b_com_wifi_con;
    Blockly.Msg['B_COM_WIFI_SSID'] = dict.b_com_wifi_ssid;
    Blockly.Msg['B_COM_WIFI_PASS'] = dict.b_com_wifi_pass;
    Blockly.Msg['B_COM_WIFI_CHECK'] = dict.b_com_wifi_check;
    Blockly.Msg['B_COM_BT_SETUP'] = dict.b_com_bt_setup;
    Blockly.Msg['B_COM_BT_NAME'] = dict.b_com_bt_name;
    Blockly.Msg['B_COM_BT_SEND'] = dict.b_com_bt_send;
    Blockly.Msg['B_COM_BT_READ'] = dict.b_com_bt_read;
    Blockly.Msg['B_COM_SER_BEGIN'] = dict.b_com_ser_begin;
    Blockly.Msg['B_COM_SER_PRINT'] = dict.b_com_ser_print;
    Blockly.Msg['B_COM_SER_PRINTLN'] = dict.b_com_ser_println;
    Blockly.Msg['B_I2C_BEGIN'] = dict.b_i2c_begin;
    Blockly.Msg['B_I2C_REQ'] = dict.b_i2c_req;
    Blockly.Msg['B_I2C_BYTES'] = dict.b_i2c_bytes;
    Blockly.Msg['B_I2C_READ'] = dict.b_i2c_read;
    Blockly.Msg['B_I2C_BEGIN_TX'] = dict.b_i2c_begin_tx;
    Blockly.Msg['B_I2C_WRITE'] = dict.b_i2c_write;
    Blockly.Msg['B_I2C_END_TX'] = dict.b_i2c_end_tx;

    workspaceRef.current = Blockly.inject(containerRef.current, {
      toolbox: JSON.parse(JSON.stringify(arduinoToolbox)),
      theme: kidsTheme,
      renderer: 'zelos',
      rendererOverrides: {
        'FIELD_TEXT_FONTSIZE': 10,
        'ADD_START_HATS': true,
        'STATEMENT_INPUT_PADDING_LEFT': 12,
      },
      grid: {
        spacing: 24,
        length: 4,
        colour: '#e2e8f0',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: isMobile ? 0.75 : 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      sounds: false,
    });

    isInitializedRef.current = true;

    // Load initial XML or default blocks
    if (!initialXml) {
      const defaultXml = `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="arduino_setup_loop" x="50" y="50">
            <statement name="SETUP">
              <block type="arduino_pin_mode">
                <value name="PIN">
                  <block type="arduino_led_builtin"></block>
                </value>
              </block>
            </statement>
            <statement name="LOOP">
              <block type="arduino_digital_write">
                <value name="PIN">
                  <block type="arduino_led_builtin"></block>
                </value>
                <next>
                  <block type="arduino_delay">
                    <value name="TIME">
                      <block type="math_number">
                        <field name="NUM">1000</field>
                      </block>
                    </value>
                    <next>
                      <block type="arduino_digital_write">
                        <value name="PIN">
                          <block type="arduino_led_builtin"></block>
                        </value>
                        <field name="VALUE">LOW</field>
                        <next>
                          <block type="arduino_delay">
                            <value name="TIME">
                              <block type="math_number">
                                <field name="NUM">1000</field>
                              </block>
                            </value>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </xml>
      `;
      Blockly.Xml.domToWorkspace(
        Blockly.utils.xml.textToDom(defaultXml),
        workspaceRef.current
      );
    } else {
      try {
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(initialXml),
          workspaceRef.current
        );
      } catch (error) {
        console.error('Error loading XML:', error);
        addConsoleMessage('error', `Error cargando bloques: ${error}`);
      }
    }

    // Generate initial code
    setTimeout(generateCode, 100);

    // Listen for workspace changes
    const changeListener = (event: Blockly.Events.Abstract) => {
      if (
        event.type === Blockly.Events.BLOCK_CHANGE ||
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_MOVE
      ) {
        generateCode();
      }

      // Force resize on toolbox events to fix scroll issues
      if (event.type === Blockly.Events.UI || event.type === Blockly.Events.VIEWPORT_CHANGE) {
        Blockly.svgResize(workspaceRef.current!);
      }
    };

    workspaceRef.current.addChangeListener(changeListener);

    // Handle resize with ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      forceResize();
    });
    resizeObserver.observe(containerRef.current);

    // Also handle window resize
    const handleWindowResize = () => forceResize();
    window.addEventListener('resize', handleWindowResize);

    // Handle visibility change (when switching tabs/views)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(forceResize, 100);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (workspaceRef.current) {
        workspaceRef.current.removeChangeListener(changeListener);
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [generateCode, initialXml, forceResize, addConsoleMessage]);

  // Handle initialXml changes (when loading a project)
  useEffect(() => {
    if (workspaceRef.current && initialXml && isInitializedRef.current) {
      try {
        workspaceRef.current.clear();
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(initialXml),
          workspaceRef.current
        );
        setTimeout(() => {
          generateCode();
          forceResize();
        }, 100);
      } catch (error) {
        console.error('Error updating workspace XML:', error);
      }
    }
  }, [initialXml, generateCode, forceResize]);

  return (
    <div className="w-full h-full relative z-0">
      <div 
        ref={containerRef} 
        className="w-full h-full blockly-container bg-card"
      />
      {/* Floating Toggle Toolbox Button - Sleek FAB for mobile/tablet */}
      {isMobile && (
        <div className="absolute right-4 top-4 z-[99]">
          <button
            onClick={toggleToolbox}
            className={`flex items-center justify-center w-11 h-11 rounded-2xl shadow-lg border-2 hover:scale-105 active:scale-95 transition-all ${
              isToolboxVisible 
                ? 'bg-card text-muted-foreground border-border/50 shadow-md' 
                : 'bg-primary text-primary-foreground border-primary/30 glow-primary'
            }`}
            title={isToolboxVisible ? 'Ocultar Categorías' : 'Mostrar Categorías'}
          >
            <Blocks className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlocklyEditor;

// Export function to get workspace XML
export const getWorkspaceXml = (workspace: Blockly.WorkspaceSvg): string => {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToText(xml);
};

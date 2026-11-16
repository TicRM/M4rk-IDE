import * as Blockly from 'blockly';
import { defineCoreBlocks, setupArduinoGenerator } from './core';
import { defineIOBlocks, defineIOGenerators } from './io';
import { defineMotorBlocks, defineMotorGenerators } from './motors';
import { defineSensorBlocks, defineSensorGenerators } from './sensors';
import { defineCommsBlocks, defineCommsGenerators } from './comms';
import { defineLogicBlocks, defineLogicGenerators } from './logic';
import { defineVariableGenerators } from './variables';
export { registerTypedVariables } from './variables';
export { arduinoToolbox } from './toolbox';

export const defineArduinoBlocks = () => {
  defineCoreBlocks();
  defineIOBlocks();
  defineMotorBlocks();
  defineSensorBlocks();
  defineCommsBlocks();
  defineLogicBlocks();
};

export const createArduinoGenerator = (): any => {
  const Arduino: any = new Blockly.Generator('Arduino');
  setupArduinoGenerator(Arduino);
  
  defineIOGenerators(Arduino);
  defineMotorGenerators(Arduino);
  defineSensorGenerators(Arduino);
  defineCommsGenerators(Arduino);
  defineLogicGenerators(Arduino);
  defineVariableGenerators(Arduino);
  
  return Arduino;
};

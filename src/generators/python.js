import * as Blockly from "blockly";
import { pythonGenerator } from "blockly/python";

// Define the custom block
Blockly.Blocks['print_message'] = {
  init: function() {
    this.appendValueInput("MESSAGE")
        .setCheck(null)
        .appendField("print");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Print the specified message");
    this.setHelpUrl("");
  }
};

// Define custom block generators
const forBlock = {
  'print_message': function(block, generator) {
    var message = generator.valueToCode(block, 'MESSAGE', pythonGenerator.ORDER_ATOMIC) || "''";
    var code = 'print(' + message + ')\n';
    return code;
  },
  
  // You can add more custom block generators here if needed
};

pythonGenerator.forBlock['controls_repeat_ext'] = function(block, generator) {
  var repeats = generator.valueToCode(block, 'TIMES', pythonGenerator.ORDER_ATOMIC) || '0';
  var branch = generator.statementToCode(block, 'DO');
  branch = generator.addLoopTrap(branch, block);
  var code = 'for count in range(' + repeats + '):\n' + generator.prefixLines(branch, '  ');
  return code;
};

// Add your custom block generators to the pythonGenerator
Object.assign(pythonGenerator.forBlock, forBlock);

export { pythonGenerator };
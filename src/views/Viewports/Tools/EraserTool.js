import { BaseTool } from "@cornerstonejs/tools/dist/esm/tools/base";

class EraserTool extends BaseTool {
  constructor(
    toolProps = {},
    defaultToolProps = {
      supportedInteractionTypes: ["Mouse", "Touch"],
    }
  ) {
    super(toolProps, defaultToolProps);
  }
}

EraserTool.toolName = "Eraser";

export default EraserTool;

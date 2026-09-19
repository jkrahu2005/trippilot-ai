export function routeFromSupervisor(state) {
  switch (state.currentStep) {
    case "planner":
      return "planner";

    case "transport":
      return "transport";

    case "budget":
      return "budget";

    case "weather":
      return "weather";

    case "optimizer":
      return "optimizer";

    case "done":
      return "end";

    default:
      return "planner";
  }
}
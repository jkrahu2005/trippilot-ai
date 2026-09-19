export async function supervisorAgent(state) {
  console.log('1');
  return {
    currentStep: state.currentStep || "planner",
    trace: ["Supervisor"],
  };
}
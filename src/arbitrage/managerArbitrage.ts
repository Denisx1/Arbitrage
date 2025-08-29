import { routeArbitrage } from "./routeArbitrage";
import { ArbitrageOpportunity } from "./service";
export class ManagerArbitrage {
  private isRunning = false;
  private firstOpportunityProcessed = false;

  async runArbitrage(opportunity: ArbitrageOpportunity) {
    if (opportunity === null) return;
    if (this.firstOpportunityProcessed) {
      return;
    }
    this.isRunning = true;
    this.firstOpportunityProcessed = true;
    console.log("🚀 ~ ManagerArbitrage ~ runArbitrage ~ opportunity:", opportunity)
    await routeArbitrage(opportunity);

    this.isRunning = false;
  }
  get status() {
    return this.isRunning;
  }
  reset() {
    this.firstOpportunityProcessed = false; // Если хочешь снова ловить первую возможность
  }
}
export const managerArbitrage = new ManagerArbitrage();

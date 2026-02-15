export type AnalyticsSummary = {
  dateRange: {
    start: string;
    end: string;
    months: number;
  };
  summary: {
    activeConditions: number;
    activeMedications: number;
    encounters: number;
    immunizations: number;
    notes: {
      recentConditions: number;
      medicationChanges: number;
      telehealthVisits: number;
      boostersDue: number;
    };
  };
  encounterTotals: {
    outpatient: number;
    telehealth: number;
    inpatient: number;
  };
  encounterHistory: {
    month: string;
    outpatient: number;
    telehealth: number;
    inpatient: number;
  }[];
  allergySeverity: {
    name: string;
    value: number;
  }[];
  topConditions: {
    name: string;
    count: number;
  }[];
  procedureBreakdown: {
    name: string;
    count: number;
  }[];
  medicationHistory: {
    month: string;
    active: number;
    new: number;
    stopped: number;
  }[];
  immunizationHistory: {
    month: string;
    routine: number;
    booster: number;
    travel: number;
  }[];
  providerNetwork: {
    activeProviders: number;
    referralsYtd: number;
    careTouchpoints: number;
    topProviders: {
      name: string;
      count: number;
    }[];
  };
};

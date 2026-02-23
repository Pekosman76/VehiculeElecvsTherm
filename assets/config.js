window.APP_CONFIG = {
  SITE_NAME: "Comparateur coût total de possession : Véhicule Électrique vs Thermique",
  BASE_URL: "https://example.com/",
  SITE_YEAR: 2026,
  NEXT_YEAR: 2027,
  LEGAL_NOTICE_SHORT: "Outil indicatif basé sur les barèmes légaux {SITE_YEAR}. Seule la CAF / MSA peut valider vos droits.",
  defaults: {
    years: 5,
    electricityPrice: 0.25,
    fuelPrice: 1.9,
    ecologicalBonus: 4000,
    ecologicalMalus: 1500,
    annualElectricityIncrease: 0,
    annualFuelIncrease: 0,
    chargerInstallCost: 0,
    annualKm: 15000
  },
  // Presets by vehicle type. Edit values here to update the whole simulator.
  presets: {
    citadine: {
      label: "Citadine",
      evConsumption: 15,
      thermalConsumption: 5.5,
      evMaintenance: 300,
      thermalMaintenance: 600,
      resalePercent: 45
    },
    suv: {
      label: "SUV",
      evConsumption: 20,
      thermalConsumption: 7.5,
      evMaintenance: 400,
      thermalMaintenance: 750,
      resalePercent: 40
    },
    utilitaire: {
      label: "Utilitaire",
      evConsumption: 23,
      thermalConsumption: 8.5,
      evMaintenance: 500,
      thermalMaintenance: 900,
      resalePercent: 35
    }
  },
  adsense: {
    clientId: "",
    slotHomeTop: "",
    slotInline: ""
  }
};

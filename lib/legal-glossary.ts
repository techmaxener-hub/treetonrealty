// Plain-English explanations for legal/trust terms shown on the PDP -- the
// differentiator called out in the project spec vs. competitor sites that just show
// a green checkmark with no explanation. Many buyers (especially NRIs) won't know
// what "7/12 Satbara" or "OC" means.

export const TITLE_TYPE_EXPLANATIONS: Record<string, string> = {
  freehold:
    "Freehold means the owner holds full, permanent ownership of the property and the land it sits on, with no time limit and no lease payments to a third party.",
  leasehold:
    "Leasehold means the property is held on a long-term lease from a landowner (often a government authority) for a fixed number of years, after which ownership rights may need renewal.",
  a_khata:
    "A-Khata (used in Karnataka) is a property record confirming the property was built following an approved plan and is eligible for a building license and bank loans.",
  b_khata:
    "B-Khata (used in Karnataka) is a record for properties with some regulatory violation or missing approval -- these carry more legal and financing risk than A-Khata properties.",
  satbara_712:
    "7/12 Satbara (used in Maharashtra) is an extract of village land records showing the survey number, area, and registered ownership of a plot of land.",
  other: "This property's title type doesn't fit a standard category -- ask your relationship manager for details.",
};

export const CERTIFICATE_EXPLANATIONS = {
  oc: "The Occupancy Certificate (OC) is issued by the local municipal authority confirming a building was constructed as per the sanctioned plan and is safe to live in.",
  cc: "The Commencement Certificate (CC) is issued before construction begins, confirming the builder has permission to start work on the sanctioned plan.",
};

export const RERA_EXPLANATION =
  "RERA registration means the project is registered with the state's Real Estate Regulatory Authority, which requires the developer to disclose project details, timelines, and escrow project funds for construction.";

export const BROKER_RERA_EXPLANATION =
  "This is the real estate agency's own broker registration number with the state RERA authority, separate from the project's own RERA registration.";

export const VASTU_SCORE_EXPLANATIONS: Record<string, string> = {
  Excellent: "The property closely follows traditional Vastu Shastra principles for room placement and orientation, as assessed by our team.",
  Good: "The property follows most Vastu Shastra principles, with only minor deviations, as assessed by our team.",
  Average: "The property follows some Vastu Shastra principles but has notable deviations, as assessed by our team.",
  "Not Vastu Compliant": "The property does not follow Vastu Shastra principles in its current layout, as assessed by our team.",
};

export const FACING_DIRECTION_LABELS: Record<string, string> = {
  N: "North-Facing",
  S: "South-Facing",
  E: "East-Facing",
  W: "West-Facing",
  NE: "North-East-Facing",
  NW: "North-West-Facing",
  SE: "South-East-Facing",
  SW: "South-West-Facing",
};

/**
 * CloudSun — central product configuration.
 *
 * CloudSun is an operational CRM for IT businesses and call-centre teams
 * serving the IT industry: IT service providers, MSPs, SaaS companies,
 * software-development agencies, cloud-service providers, cybersecurity
 * companies, IT infrastructure companies, technical-support centres, B2B
 * technology sales teams, and IT implementation/consulting companies.
 */
export const product = {
  name: "CloudSun",
  shortName: "CloudSun",
  category: "IT customer operations CRM",
  eyebrow: "Customer operations for IT teams",
  tagline:
    "Every customer, conversation and opportunity. One operational workspace.",
  supporting:
    "CloudSun helps IT sales, support and customer-success teams manage companies, decision-makers, enquiries, opportunities and follow-ups from one shared workspace.",
  repository: "hello-aditya-dev/cloudsun-crm",
  authorIdentity: "hello-aditya-dev",
  demoModeLabel: "Demonstration workspace",
  currentYear: 2026,
} as const;

export type ProductConfig = typeof product;

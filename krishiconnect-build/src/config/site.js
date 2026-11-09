/**
 * Public site configuration. Values that identify the student team are injected
 * at build time from .env (see .env.example) so no personal data is invented.
 */
export const siteConfig = {
  name: 'KrishiConnect',
  tagline: 'Farm intelligence for Karnataka',
  location: 'Bengaluru, Karnataka, India',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'team@krishiconnect.example',
  repositoryUrl: import.meta.env.VITE_REPOSITORY_URL || 'https://github.com/your-team/krishiconnect',
  agmarknetUrl: 'https://agmarknet.gov.in/',
  dataGovUrl: 'https://www.data.gov.in/',
}

export const DISCLAIMERS = {
  samplePrices:
    'This is a clearly labelled sample dataset for demonstration. It is not live Agmarknet data and must not be used for trading decisions.',
  calculators:
    'Estimates use the values you enter. Verify local costs, yields and prices with your extension officer or Krishi Vigyan Kendra before acting.',
  fertilizer:
    'Indicative blanket nutrient arithmetic only. It is not a soil-test prescription or an official recommendation. Confirm doses with your local agriculture officer.',
}

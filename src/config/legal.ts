export const SITE_ORIGIN = 'https://ymemberapp.com'

export const legalPaths = {
  privacy: '/privacy',
  terms: '/terms',
  accountDeletion: '/account-deletion',
} as const

export const legalPageUrls = {
  privacy: `${SITE_ORIGIN}${legalPaths.privacy}`,
  terms: `${SITE_ORIGIN}${legalPaths.terms}`,
  accountDeletion: `${SITE_ORIGIN}${legalPaths.accountDeletion}`,
} as const

export const legalContact = {
  organisation: 'YMCA Ghana',
  operator: 'GreenBrain Technologies LTD',
  email: 'frederickohe@gmail.com',
  phone: '+233 247 291 736',
  address: 'Pelican Group Building, Dzorwulu, Accra',
} as const

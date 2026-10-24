import logo from '../assets/nipangishe-logo.svg'
import mark from '../assets/nipangishe-mark.svg'

// Platform-level identity (the system owner's brand). Each landlord still sets
// their own company name/contact under Settings; this is only the product brand
// shown on the public site, auth screens and app shell.
// `logo` is the full lockup (symbol + wordmark + tagline) for large/print use;
// `mark` is the symbol only, for compact bars and small headers.
export const BRAND = {
  name: 'Nipangishe',
  tagline: 'Makazi yako, hatua moja karibu',
  description:
    'Jukwaa la kisasa la kusimamia nyumba na vyumba vya kupangisha — kwa wamiliki na wapangaji.',
  logo,
  mark,
}

export interface Country {
  name: string;
  code: string;
  emoji: string;
  callingCode: string;
  format: string;
}

export const countries: Country[] = [
  {
    name: "United States",
    code: "US",
    emoji: "🇺🇸",
    callingCode: "+1",
    format: "(###) ###-####",
  },
  {
    name: "Canada",
    code: "CA",
    emoji: "🇨🇦",
    callingCode: "+1",
    format: "(###) ###-####",
  },
  {
    name: "United Kingdom",
    code: "GB",
    emoji: "🇬🇧",
    callingCode: "+44",
    format: "#### ######",
  },
  {
    name: "Australia",
    code: "AU",
    emoji: "🇦🇺",
    callingCode: "+61",
    format: "#### ####",
  },
  {
    name: "Germany",
    code: "DE",
    emoji: "🇩🇪",
    callingCode: "+49",
    format: "### #######",
  },
  {
    name: "France",
    code: "FR",
    emoji: "🇫🇷",
    callingCode: "+33",
    format: "# ## ## ## ##",
  },
  {
    name: "Japan",
    code: "JP",
    emoji: "🇯🇵",
    callingCode: "+81",
    format: "##-####-####",
  },
  {
    name: "Brazil",
    code: "BR",
    emoji: "🇧🇷",
    callingCode: "+55",
    format: "(##) #####-####",
  },
  {
    name: "India",
    code: "IN",
    emoji: "🇮🇳",
    callingCode: "+91",
    format: "#### ######",
  },
  {
    name: "Mexico",
    code: "MX",
    emoji: "🇲🇽",
    callingCode: "+52",
    format: "(##) ####-####",
  },
  {
    name: "China",
    code: "CN",
    emoji: "🇨🇳",
    callingCode: "+86",
    format: "### #### ####",
  },
  {
    name: "South Africa",
    code: "ZA",
    emoji: "🇿🇦",
    callingCode: "+27",
    format: "## ### ####",
  },
];

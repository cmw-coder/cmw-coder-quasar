export const REGEXP_WORD = /[^a-zA-Z0-9]/;

export const IGNORE_RESERVED_KEYWORDS = new Set([
  'assert',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'def',
  'else',
  'enum',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'match',
  'new',
  'raise',
  'repeat',
  'return',
  'static',
  'struct',
  'super',
  'switch',
  'then',
  'this',
  'TODO',
  'try',
  'var',
  'while',
  'with',
]);

export const IGNORE_COMMON_WORD = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'all',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'did',
  'do',
  'does',
  'doing',
  'don',
  'down',
  'during',
  'each',
  'few',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'here',
  'how',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'more',
  'most',
  'no',
  'not',
  'now',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'out',
  'over',
  'own',
  's',
  'same',
  'should',
  'so',
  'some',
  'such',
  't',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'will',
  'would',
  'you',
]);

export const IGNORE_COMWARE_INTERNAL = new Set([
  //* Comware Macros *//
  'DBGASSERT',
  'INLINE',
  'ISSU',
  'NOINLSTATIC',
  'STATIC',
  'STATICASSERT',
  //* Comware Naming Standards *//
  'E', //? Enum
  'S', //? Struct
  'T', //? Typedef
]);

export const MODULE_PATH = {
  ACCESS: 'ACCESS/src/sbin',
  CRYPTO: 'CRYPTO/src/sbin',
  DC: 'DC/src/sbin',
  DEV: 'DEV/src/sbin',
  DLP: 'DLP/src/sbin',
  DPI: 'DPI/src/sbin',
  DRV_SIMSWITCH: 'DRV_SIMSWITCH/src/sbin',
  DRV_SIMWARE9: 'DRV_SIMWARE9/src/sbin',
  FE: 'FE/src/sbin',
  FW: 'FW/src/sbin',
  IP: 'IP/src/sbin',
  L2VPN: 'L2VPN/src/sbin',
  LAN: 'LAN/src/sbin',
  LB: 'LB/src/sbin',
  LINK: 'LINK/src/sbin',
  LSM: 'LSM/src/sbin',
  MCAST: 'MCAST/src/sbin',
  NETFWD: 'NETFWD/src/sbin',
  OFP: 'OFP/src/sbin',
  PSEC: 'PSEC/src/sbin',
  PUBLIC: 'PUBLIC/include/comware',
  QACL: 'QACL/src/sbin',
  TEST: 'TEST/src/sbin',
  VOICE: 'VOICE/src/sbin',
  VPN: 'VPN/src/sbin',
  WLAN: 'WLAN/src/sbin',
  X86PLAT: 'X86PLAT/src/sbin',
} as const;

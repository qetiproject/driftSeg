export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
} as const;

export type InputType = (typeof INPUT_TYPES)[keyof typeof INPUT_TYPES];

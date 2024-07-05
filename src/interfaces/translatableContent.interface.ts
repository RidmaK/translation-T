export interface TranslatableContentFields {
  fieldName: string;
  text: any;
  output: any;
  status: Status;
}

export enum Status {
  PENDING = 'PENDING',
  TRANSLATING = 'TRANSLATING',
  UPDATED = 'UPDATED',
  COMPLETED = 'COMPLETED',
  TRANSLATED = 'TRANSLATED',
}

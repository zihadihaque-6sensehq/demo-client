export type ContactInitiationPostResponse = {
  accepted: boolean;
  nextStep: string;
};

export type ContactInitiationPayload = {
  name?: string;
  email?: string;
};

export type PostContactInitiationDto = {
  destinationRoute?: string;
  formId?: string;
  payload?: ContactInitiationPayload;
};
import { MfaDataPocketbase } from "backend/provider/auth/pocketbase";

export type LoginParams = {
  email: string;
  password: string;
};

export type LoginMfaParams = {
  mfaCode: string;
  mfaData: MfaData;
};

export type MFARequiredResponse = {
  mfaRequired: true;
  mfaData: MfaData;
};

export type MfaData = MfaDataPocketbase;

import { ErrorType } from "constants/errors";
import { getAdminClient, getUserClient } from "../pocketbase-util";
import { object, string } from "yup";

export async function getPocketbaseAuthLogs({
  page = 1,
  perPage = 10,
  filter = "",
} = {}) {
  const pb = await getAdminClient();

  const result = await pb.logs.getList(page, perPage, {
    filter: filter || undefined,
  });
  return result;
}

export const authenticateCredentialsPocketbase = async (
  email: string,
  password: string,
  ip: string,
) => {
  const pb = getUserClient();

  const authData = await pb
    .collection("users")
    .authWithPassword(email, password, {
      headers: { "X-Forwarded-For": ip },
    });

  return authData.token;
};

export const authenticateTokenPocketbase = async (token: string) => {
  const pb = getUserClient();
  pb.authStore.save(token, null);
  try {
    const authData = await pb.collection("users").authRefresh();
    return authData.record.id;
  } catch (e) {
    const err = e as {
      status?: number;
      response?: {
        message?: string;
      };
    };
    if (err.status === 401) {
      throw new Error(ErrorType.UNAUTHORIZED, {
        cause: "Invalid or expired token",
      });
    }
    throw e;
  }
};

export const refreshTokenPocketbase = async (token: string) => {
  const pb = getUserClient();
  pb.authStore.save(token, null);
  const authData = await pb.collection("users").authRefresh();
  return authData.token;
};

export const changePasswordPocketbase = async (
  auth_id: string,
  email: string,
  token: string,
  oldPassword: string,
  newPassword: string,
  ip: string,
) => {
  const pb = getUserClient();
  pb.authStore.save(token, null);
  try {
    const user = await pb.collection("users").getOne(auth_id);

    await pb.collection("users").update(
      auth_id,
      {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      },
      {
        headers: { "X-Forwarded-For": ip },
      },
    );

    if (!user.mfa_enabled) {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, newPassword);
      return { token: authData.token };
    } else {
      return { token_invalidated: true };
    }
  } catch (e) {
    const err = e as {
      status?: number;
      response?: {
        data?: Record<string, { message?: string }>;
        message?: string;
      };
    };
    if (err.status === 400) {
      const fieldMessages = Object.values(err.response?.data ?? {})
        .map((f) => f.message)
        .filter(Boolean)
        .join(" ");
      throw new Error(ErrorType.BAD_REQUEST, {
        cause: fieldMessages || err.response?.message,
      });
    }
    throw e;
  }
};

export const createAuthUserPocketbase = async (
  auth_id: string,
  email: string,
  first_name: string,
  last_name: string,
  mfa_enabled: boolean,
) => {
  const pb = await getAdminClient();
  const tempPassword = crypto.randomUUID();
  await pb.collection("users").create({
    id: auth_id,
    email,
    first_name,
    last_name,
    emailVisibility: true,
    password: tempPassword,
    passwordConfirm: tempPassword,
    mfa_enabled,
  });
  await pb.collection("users").requestPasswordReset(email);
};

export const deleteAuthUserPocketbase = async (auth_id: string) => {
  const pb = await getAdminClient();
  await pb.collection("users").delete(auth_id);
};

export const confirmPasswordResetPocketbase = async (
  token: string,
  password: string,
) => {
  const pb = getUserClient();
  try {
    await pb
      .collection("users")
      .confirmPasswordReset(token, password, password);
  } catch (e) {
    const err = e as {
      status?: number;
      response?: {
        data?:
          | Record<string, { code?: string; message?: string }>
          | {
              data?: Record<string, { code?: string; message?: string }>;
            };
        message?: string;
      };
    };
    if (err.status === 400) {
      const responseData = err.response?.data;
      const fieldData = (
        responseData && "data" in responseData
          ? responseData.data
          : responseData
      ) as Record<string, { code?: string; message?: string }> | undefined;

      if (
        fieldData &&
        Object.values(fieldData).some(
          (v) => v.code === "validation_invalid_token",
        )
      ) {
        throw new Error(ErrorType.BAD_REQUEST, {
          cause: "Invalid or expired password reset link",
        });
      }

      const fieldMessages = Object.values(fieldData ?? {})
        .map((f) => f.message)
        .filter(Boolean)
        .join(" ");

      throw new Error(ErrorType.BAD_REQUEST, {
        cause: fieldMessages || err.response?.message || "Bad Request",
      });
    }
    throw e;
  }
};

export const requestPasswordResetPocketbase = async (
  email: string,
  ip: string,
) => {
  const pb = getUserClient();
  try {
    await pb.collection("users").requestPasswordReset(email, {
      headers: { "X-Forwarded-For": ip },
    });
  } catch (e) {
    const err = e as {
      status?: number;
      response?: {
        message?: string;
      };
    };
    if (err.status === 429) {
      throw new Error(ErrorType.TOO_MANY_REQUESTS, {
        cause: "Please wait two minutes between requests.",
      });
    }
    throw e;
  }
};

export const getTokenExpiryPocketbase = (token: string) => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  if (!payload.exp || typeof payload.exp !== "number") {
    throw new Error("Failed to parse expiry from token");
  }
  return payload.exp as number;
};

export const requestOTPPocketbase = async (email: string) => {
  const pb = getUserClient();

  const result = await pb.collection("users").requestOTP(email);
  return result;
};

export const loginWithMfaPocketbase = async (
  otp: string,
  data: MfaDataPocketbase,
  ip: string,
) => {
  const pb = getUserClient();
  const { otpId, mfaId } = data;
  const authData = await pb.collection("users").authWithOTP(otpId, otp, {
    mfaId: mfaId,
    headers: { "X-Forwarded-For": ip },
  });

  return { token: authData.token, email: authData.record.email };
};

export type MfaDataPocketbase = {
  otpId: string;
  mfaId: string;
};

export const mfaDataSchemaPocketbase = object({
  otpId: string().required("OTP ID is required"),
  mfaId: string().required("MFA ID is required"),
});

export const getUserMfaEnabledPocketbase = async (auth_id: string) => {
  const pb = await getAdminClient();
  const user = await pb.collection("users").getOne(auth_id);
  return user.mfa_enabled as boolean;
};

export const setUserMfaEnabledPocketbase = async (
  auth_id: string,
  enabled: boolean,
  token: string,
  ip: string,
) => {
  const pb = getUserClient();
  pb.authStore.save(token, null);
  await pb.collection("users").update(
    auth_id,
    {
      mfa_enabled: enabled,
    },
    {
      headers: { "X-Forwarded-For": ip },
    },
  );
};

export const setUserMfaEnabledPocketbaseAdmin = async (
  auth_id: string,
  enabled: boolean,
) => {
  const pb = await getAdminClient();
  await pb.collection("users").update(auth_id, {
    mfa_enabled: enabled,
  });
};

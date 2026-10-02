import PocketBase from "pocketbase";

export const getUserClient = () => {
  const url = process.env.POCKETBASE_URL;
  if (!url) {
    throw new Error("No PocketBase URL provided");
  }
  return new PocketBase(url);
};

export const getPocketbaseUrl = () => {
  const url = process.env.POCKETBASE_URL;
  if (!url) {
    throw new Error("No PocketBase URL provided");
  }
  return url;
};

export const getAdminClient = async () => {
  const pb = getUserClient();
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("No PocketBase admin credentials provided");
  }
  await pb.collection("_superusers").authWithPassword(email, password);
  return pb;
};

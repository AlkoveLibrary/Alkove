import LoginForm from "components/LoginForm";
import { LIBRARY_NAME } from "config/config";
import Head from "next/head";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login - {LIBRARY_NAME}</title>
      </Head>
      <LoginForm />
    </>
  );
}

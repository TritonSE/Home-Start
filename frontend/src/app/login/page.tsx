"use client";

import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";

import styles from "./page.module.css";

import homeStartLogoAsset from "@/assets/homestartLogo.svg";
import icHideAsset from "@/assets/icHide.svg";
import icShowAsset from "@/assets/icShow.svg";
import SuccessNotification from "@/components/SuccessNotification";
import { auth } from "@/firebase/firebase";

const homeStartLogo = homeStartLogoAsset as string;
const icHide = icHideAsset as string;
const icShow = icShowAsset as string;

// import "@fontsource/albert-sans";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Search for query parameters
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(searchParams.get("success") === "true"); // If user successfully signed up and was redirected
  const [showLoggedin, setShowLoggedin] = useState(false); // Once user logs in
  const [showResetPasswordSuccess, setShowResetPasswordSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoggedin(true);
      if (window.location.pathname === "/") {
        window.location.reload();
      } else {
        void router.push("/dashboard");
      }
    } catch (caughtError) {
      if (caughtError instanceof FirebaseError) {
        switch (caughtError.code) {
          case "auth/invalid-email":
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            setError("Password invalid. Try again!");
            break;
          case "auth/network-request-failed":
            setError("Request failed, check your Internet connection and try again");
            break;
          default:
            setError(`Error signing in: ${caughtError.code}`);
        }
      } else {
        setError(`Error signing in: ${String(caughtError)}`);
      }
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setShowResetPasswordSuccess(true);
    } catch (caughtError) {
      setError(`Error resetting password: ${String(caughtError)}`);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear success & error messages
    setShowSuccess(false);
    setShowLoggedin(false);
    setShowResetPasswordSuccess(false);
    setError("");

    if (showResetPassword) {
      void handleResetPassword();
    } else {
      void handleLogin();
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.form}>
        <div className={styles.logoContainer}>
          <Image src={homeStartLogo} alt="Home Start Logo" width={120} height={120} priority />
        </div>
        <div className={styles.subtitle}>
          {showResetPassword ? (
            "Reset your password"
          ) : (
            <>
              Strengthening <br /> Families Protects <br /> Children.
            </>
          )}
        </div>
        <form className={styles.innerForm} id="contactForm" onSubmit={handleSubmit}>
          {showResetPassword ? (
            <p className={styles.subtitle2} style={{ marginTop: 0, marginBottom: 24 }}>
              We&apos;ll email you with a link to reset your password!
            </p>
          ) : null}
          <input
            type="email"
            id="email"
            className={styles.input}
            placeholder="Enter Email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          ></input>
          {showResetPassword ? null : (
            <>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  placeholder="Enter Password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                ></input>
                <button
                  type="button"
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Image src={icShow} alt="to hide password" width={20} height={20} />
                  ) : (
                    <Image src={icHide} alt="to show password" width={20} height={20} />
                  )}
                </button>
              </div>
              {error && <div className={styles.passwordError}>{error}</div>}
            </>
          )}

          <div className={styles.rememberMeContainer}>
            <label className={styles.rememberMeLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Keep me logged in
            </label>
            {!showResetPassword && (
              <a
                className={styles.linkText}
                onClick={() => {
                  setShowResetPassword(true);
                }}
              >
                Forgot Password?
              </a>
            )}
          </div>

          <button className={styles.signInButton} type="submit">
            Log In
          </button>
        </form>
        {showResetPassword ? (
          <div className={styles.subtitle2}>
            <div>
              Remembered your password?
              <div
                className={styles.linkText}
                onClick={() => {
                  setShowResetPassword(false);
                }}
              >
                &nbsp;Log in.
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {showSuccess && <SuccessNotification message="User Created Successfully" />}
      {showLoggedin && <SuccessNotification message="User Logged In Successfully" />}
      {showResetPasswordSuccess && (
        <SuccessNotification message="Email sent! Check your spam folder if you didn't receive it." />
      )}
    </main>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

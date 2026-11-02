"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  PAYMENT_PREFERENCES,
  isPaymentPreference,
  type PaymentPreference,
} from "../catalog/paymentPreferences";
import type { User } from "../types/auth";

type Outcome = { kind: "success" | "error"; message: string } | null;

function FormOutcome({ outcome }: { outcome: Outcome }) {
  if (!outcome) return null;
  return outcome.kind === "error" ? (
    <p role="alert" className="account-settings-message error">{outcome.message}</p>
  ) : (
    <p role="status" className="account-settings-message">{outcome.message}</p>
  );
}

function EditProfileForm({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [preference, setPreference] = useState<PaymentPreference | null>(user.preferredPaymentMethod);
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setOutcome(null);
    const result = await updateProfile({ name, preferredPaymentMethod: preference });
    setSaving(false);
    setOutcome(
      result.ok
        ? { kind: "success", message: "Your profile is saved." }
        : { kind: "error", message: result.error ?? "Your profile could not be saved." }
    );
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="edit-profile-heading">
      <h2 id="edit-profile-heading">Edit profile</h2>
      <label>
        Full name
        <input
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label>
        Preferred payment method
        <select
          value={preference ?? ""}
          onChange={(event) => setPreference(isPaymentPreference(event.target.value) ? event.target.value : null)}
        >
          <option value="">No preference</option>
          {PAYMENT_PREFERENCES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <small>We&apos;ll highlight this at checkout. We never store your card details.</small>
      </label>
      <FormOutcome outcome={outcome} />
      <button type="submit" className="primary-button" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setOutcome({ kind: "error", message: "The new passwords don't match." });
      return;
    }
    setSaving(true);
    setOutcome(null);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);
    if (result.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOutcome({ kind: "success", message: "Your password is changed. Other devices have been signed out." });
    } else {
      setOutcome({ kind: "error", message: result.error ?? "Your password could not be changed." });
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="change-password-heading">
      <h2 id="change-password-heading">Change password</h2>
      <label>
        Current password
        <input
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
      <label>
        New password
        <input
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </label>
      <label>
        Confirm new password
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>
      <FormOutcome outcome={outcome} />
      <button type="submit" className="secondary-outline-button" disabled={saving}>
        {saving ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

/** The signed-in shopper's editable details. Keyed by user so a new sign-in starts fresh. */
export function AccountSettings({ user }: { user: User }) {
  return (
    <div className="account-settings">
      <EditProfileForm key={user.id} user={user} />
      {user.hasPassword === true && <ChangePasswordForm key={`password-${user.id}`} />}
      {user.hasPassword === false && (
        <div>
          <h2>Password</h2>
          <p>You sign in with Google, so your password is managed by your Google account.</p>
        </div>
      )}
    </div>
  );
}

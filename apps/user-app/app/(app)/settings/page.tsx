"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api, UserSettings } from "@/lib/api";

export default function SettingsPage() {
  const { data: session } = useSession();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    void (async () => {
      try {
        setLoading(true);
        const response = await api.getSettings(userId);
        setSettings(response.settings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load settings",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user?.id]);

  const updateAndPersist = async (patch: Partial<UserSettings>) => {
    const userId = session?.user?.id;
    if (!userId || !settings) return;

    const nextSettings = { ...settings, ...patch };
    setSettings(nextSettings);

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = await api.updateSettings(userId, patch);
      setSettings(response.settings);
      setMessage("Settings updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-gray-600">Loading settings...</div>;
  }

  return (
    <>

      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Security</h2>
        <label className="flex items-center justify-between">
          <span>Two-Factor Authentication</span>
          <input
            type="checkbox"
            checked={settings.twoFactorEnabled}
            onChange={(e) =>
              void updateAndPersist({ twoFactorEnabled: e.target.checked })
            }
            disabled={saving}
          />
        </label>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Email Notifications</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                void updateAndPersist({ emailNotifications: e.target.checked })
              }
              disabled={saving}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Transaction Alerts</span>
            <input
              type="checkbox"
              checked={settings.transactionAlerts}
              onChange={(e) =>
                void updateAndPersist({ transactionAlerts: e.target.checked })
              }
              disabled={saving}
            />
          </label>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) =>
                void updateAndPersist({ language: e.target.value })
              }
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) =>
                void updateAndPersist({ currency: e.target.value })
              }
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>
        </div>
      </section>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </>
  );
}

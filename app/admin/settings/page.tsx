"use client";

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';

interface OrganizationSettings {
  id: string;
  slug: string;
  organization_name: string;
  location: string;
  website_url: string;
  status: string;
  api_key: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [organizationName, setOrganizationName] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setOrganizationName(data.organization_name);
          setLocation(data.location);
          setWebsiteUrl(data.website_url);
        } else {
          console.error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_name: organizationName,
          location,
          website_url: websiteUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSaveMessage('✓ Settings saved successfully');
      } else {
        setSaveMessage('✗ Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('✗ Error saving settings');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setOrganizationName(settings.organization_name);
      setLocation(settings.location);
      setWebsiteUrl(settings.website_url);
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) {
      return;
    }

    setRegenerating(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'regenerate_api_key',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSaveMessage('✓ API key regenerated successfully');
        setShowApiKey(true);
      } else {
        setSaveMessage('✗ Failed to regenerate API key');
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      setSaveMessage('✗ Error regenerating API key');
    } finally {
      setRegenerating(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCopyApiKey = () => {
    if (settings?.api_key) {
      navigator.clipboard.writeText(settings.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader title="Settings" subtitle="Visit Fort Myers • Live since August 2024" />
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Settings" subtitle="Visit Fort Myers • Live since August 2024" />

      <div className="max-w-4xl mx-auto p-8">
        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.startsWith('✓')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Account Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={settings?.slug ?? ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <textarea
                rows={3}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <input
                type="text"
                value={settings?.status ?? ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
              />
            </div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">API Key</h2>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Use this API key to authenticate requests from the Concierge app to the CRM.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings?.api_key ?? ''}
                  disabled
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleRegenerateApiKey}
                disabled={regenerating}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate API Key'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Warning: Regenerating will invalidate the current API key and break existing integrations.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}


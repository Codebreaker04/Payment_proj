'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@repo/ui/sidebar';
import { api } from '@/lib/api';
import { getSidebarSections } from '@/lib/sidebar';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
};

export default function AccountPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
  });

  const sidebarSections = useMemo(() => getSidebarSections(), []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    void (async () => {
      try {
        setLoading(true);
        const response = await api.getProfile(userId);
        setProfile({
          name: response.profile.name ?? '',
          email: response.profile.email,
          phone: response.profile.phone ?? '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user?.id]);

  const handleSave = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await api.updateProfile(userId, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined,
      });
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className='p-8 text-gray-600'>Loading account...</div>;
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar
        sections={sidebarSections}
        currentPath={pathname}
        onNavigate={href => router.push(href)}
        showSearch={true}
      />

      <main className='flex-1 p-8'>
        <h1 className='text-3xl font-bold mb-6 text-gray-900'>Account</h1>

        <section className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold'>Profile Information</h2>
            <button
              onClick={() => setIsEditing(current => !current)}
              className='px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg'>
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Full Name</label>
              <input
                type='text'
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing || saving}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Email</label>
              <input
                type='email'
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing || saving}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Phone</label>
              <input
                type='tel'
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing || saving}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50'
              />
            </div>
          </div>

          {error && <p className='mt-4 text-sm text-red-600'>{error}</p>}
          {message && <p className='mt-4 text-sm text-green-600'>{message}</p>}

          {isEditing && (
            <div className='mt-6'>
              <button
                onClick={handleSave}
                disabled={saving}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400'>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

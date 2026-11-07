import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import OfflineBanner from '../components/OfflineBanner';
import TabBar from '../components/TabBar';
import { logOut, deleteAccount, getProfile } from '../lib/api/auth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function Profile() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getProfile().then((p) => {
      if (p) {
        setDisplayName(p.displayName);
        setEmail(p.email);
      }
    });
  }, []);

  async function handleLogOut() {
    await logOut();
    navigate('/log-in');
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (!error) {
      navigate('/log-in');
    }
    setShowConfirm(false);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <OfflineBanner offline={!isOnline} />
    <div className="mx-auto max-w-sm px-4 py-12 pb-20">
      <h1 className="mb-6 text-2xl font-bold text-[#111827]">Profile</h1>
      {displayName && (
        <p className="mb-1 text-lg font-semibold text-[#111827]">
          {displayName}
        </p>
      )}
      {email && (
        <p className="mb-8 text-sm text-[#6B7280]">{email}</p>
      )}
      <div className="flex flex-col gap-4">
        <Button variant="secondary" onClick={handleLogOut}>
          Log out
        </Button>
        <Button
          variant="danger"
          onClick={() => setShowConfirm(true)}
          loading={deleting}
        >
          Delete account
        </Button>
      </div>
      {showConfirm && (
        <ConfirmModal
          title="Delete account"
          message="Are you sure you want to delete your account? This cannot be undone."
          confirmLabel="Delete"
          confirmVariant="danger"
          cancelLabel="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
      <TabBar />
    </div>
  );
}

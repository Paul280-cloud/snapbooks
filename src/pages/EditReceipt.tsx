import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReceipt, updateReceipt, deleteReceipt } from '../lib/api/receipts';
import { validateReceipt } from '../lib/rules/receipt';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import ReceiptForm from '../components/ReceiptForm';
import OfflineBanner from '../components/OfflineBanner';
import ConfirmModal from '../components/ConfirmModal';
import type { ReceiptFormData, ReceiptErrors } from '../lib/rules/receipt';
import type { Category } from '../lib/rules/categories';

export default function EditReceipt() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isOnline = useOnlineStatus();

  const [signedUrl, setSignedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [values, setValues] = useState<ReceiptFormData>({
    vendor: '',
    amount: '',
    date: '',
    category: '',
  });
  const [errors, setErrors] = useState<ReceiptErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getReceipt(id)
      .then((receipt) => {
        if (!receipt) {
          setNotFound(true);
          return;
        }
        setSignedUrl(receipt.signed_url);
        setValues({
          vendor: receipt.vendor,
          amount: String(receipt.amount),
          date: receipt.date,
          category: receipt.category,
        });
      })
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  function handleChange(field: keyof ReceiptFormData, value: string) {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // Live-validate amount so the error shows immediately for non-numeric input
      if (field === 'amount' && value) {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          setErrors((e) => ({ ...e, amount: 'Enter a rand amount, e.g. 89.99.' }));
        } else {
          setErrors((e) => ({ ...e, amount: undefined }));
        }
      } else {
        setErrors((e) => ({ ...e, [field]: undefined }));
      }
      return next;
    });
  }

  async function handleSave() {
    const errs = validateReceipt(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      await updateReceipt(id!, {
        vendor: values.vendor,
        amount: parseFloat(values.amount),
        date: values.date,
        category: values.category as Category,
      });
      navigate('/receipts', { state: { toast: 'Receipt updated.' } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (/jwt expired|session|unauthorized/i.test(msg)) {
        navigate('/log-in', { replace: true });
      } else if (/not found/i.test(msg)) {
        setNotFound(true);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteReceipt(id!);
      navigate('/receipts', { state: { toast: 'Receipt deleted.' } });
    } catch {
      setDeleteError("Couldn't delete. Check your connection.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const actionDisabled = !isOnline || isSaving || isDeleting;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <span role="status" aria-label="Loading receipt…" className="text-sm text-[#6B7280]">
          Loading receipt…
        </span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="mx-auto max-w-sm px-4 py-12 text-center">
          <p className="text-[#6B7280]">This receipt is no longer available.</p>
          <button
            type="button"
            onClick={() => navigate('/receipts')}
            className="mt-4 text-sm text-[#1B7F4F] underline"
          >
            Back to receipts
          </button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="mx-auto max-w-sm px-4 py-12 text-center">
          <p className="text-[#DC2626]">Something went wrong. Try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-[#1B7F4F] underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <OfflineBanner offline={!isOnline} />

      <header className="bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-[1200px] items-center">
          <button
            type="button"
            onClick={() => navigate('/receipts')}
            className="mr-4 text-sm text-[#1B7F4F]"
          >
            ← Back
          </button>
          <span className="text-lg font-bold text-[#1B7F4F]">Edit Receipt</span>
        </div>
      </header>

      <div className="mx-auto max-w-[600px] px-4 py-6">
        <div className="mb-6">
          <img
            src={signedUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}
            alt="Receipt photo"
            className="max-h-64 w-full rounded-[8px] bg-gray-100 object-contain"
          />
        </div>

        {deleteError && (
          <div
            role="alert"
            className="mb-4 rounded-[8px] bg-red-50 px-4 py-3 text-sm text-[#DC2626]"
          >
            {deleteError}
          </div>
        )}

        <ReceiptForm
          values={values}
          onChange={handleChange}
          onSave={handleSave}
          loading={isSaving}
          disabled={actionDisabled}
          errors={errors}
        />

        <div className="mt-4">
          <button
            type="button"
            disabled={actionDisabled}
            onClick={() => setShowDeleteModal(true)}
            className="w-full rounded-[6px] border border-[#DC2626] px-4 py-2 text-sm font-semibold text-[#DC2626] disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 hover:bg-red-50"
          >
            Delete receipt
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete receipt?"
          message="This will permanently remove this receipt. This cannot be undone."
          confirmLabel="Yes, delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { readReceiptPhoto } from '../lib/api/ocr';
import { uploadPhoto, removePhoto } from '../lib/api/storage';
import { createReceipt } from '../lib/api/receipts';
import { validateReceipt } from '../lib/rules/receipt';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSession } from '../hooks/useSession';
import ReceiptForm from '../components/ReceiptForm';
import OfflineBanner from '../components/OfflineBanner';
import type { ReceiptFormData, ReceiptErrors } from '../lib/rules/receipt';
import type { Category } from '../lib/rules/categories';

export default function UploadReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const { session } = useSession();

  const file: File | null = (location.state as { file?: File } | null)?.file ?? null;

  const [photoUrl, setPhotoUrl] = useState('');
  const [isOcring, setIsOcring] = useState(true);
  const [values, setValues] = useState<ReceiptFormData>({
    vendor: '',
    amount: '',
    date: '',
    category: '',
  });
  const [errors, setErrors] = useState<ReceiptErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!file) {
      navigate('/receipts', { replace: true });
      return;
    }

    try {
      setPhotoUrl(URL.createObjectURL(file));
    } catch {
      // jsdom may not support createObjectURL
    }

    setIsOcring(true);
    readReceiptPhoto(file)
      .then((result) => {
        setValues({
          vendor: result.vendor,
          amount: result.amount,
          date: result.date,
          category: result.category,
        });
      })
      .catch(() => {
        // OCR failed — leave form empty for manual entry
      })
      .finally(() => setIsOcring(false));
  }, []); // intentionally runs once on mount — file reference is stable

  function handleChange(field: keyof ReceiptFormData, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSave() {
    const errs = validateReceipt(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    setSaveError('');

    let photoPath: string | null = null;
    try {
      photoPath = await uploadPhoto(session!.user.id, file!);
      await createReceipt({
        vendor: values.vendor,
        amount: parseFloat(values.amount),
        date: values.date,
        category: values.category as Category,
        photo_url: photoPath,
      });
      navigate('/receipts');
    } catch {
      if (photoPath) {
        await removePhoto(photoPath).catch(() => {});
      }
      setSaveError('Could not save receipt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!file) return null;

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
          <span className="text-lg font-bold text-[#1B7F4F]">Upload Receipt</span>
        </div>
      </header>

      <div className="mx-auto max-w-[600px] px-4 py-6">
        <div className="mb-6">
          <img
            src={photoUrl || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}
            alt="Receipt photo"
            className="max-h-64 w-full rounded-[8px] bg-gray-100 object-contain"
          />
        </div>

        {isOcring ? (
          <div className="flex justify-center py-8">
            <span
              role="status"
              aria-label="Scanning receipt…"
              className="text-sm text-[#6B7280]"
            >
              Scanning receipt…
            </span>
          </div>
        ) : (
          <>
            {saveError && (
              <div
                role="alert"
                className="mb-4 rounded-[8px] bg-red-50 px-4 py-3 text-sm text-[#DC2626]"
              >
                {saveError}
              </div>
            )}
            <ReceiptForm
              values={values}
              onChange={handleChange}
              onSave={handleSave}
              loading={isSaving}
              disabled={!isOnline}
              errors={errors}
            />
          </>
        )}
      </div>
    </div>
  );
}

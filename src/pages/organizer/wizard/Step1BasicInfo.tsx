import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Textarea, Select } from '@/components/ui/Input';
import type { WizardData } from '../CreateEventPage';

const EVENT_TYPES = [
  { value: 'concert', label: 'Concert / Music Event' },
  { value: 'conference', label: 'Conference' },
  { value: 'symposium', label: 'Symposium' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'university', label: 'University Event' },
  { value: 'award_ceremony', label: 'Award Ceremony' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'cultural', label: 'Religious / Cultural Event' },
  { value: 'sports', label: 'Sports Event' },
  { value: 'community', label: 'Community Event' },
  { value: 'private', label: 'Private Event' },
  { value: 'other', label: 'Other' },
];

interface Props {
  data: WizardData;
  updateData: (u: Partial<WizardData>) => void;
  onValid: (v: boolean) => void;
}

const getPreviewUrl = (url: string) => {
  if (!url) return '';
  // Convert Google Drive sharing links to direct image links
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?id=${driveMatch[1]}`;
  }
  return url;
};

export function Step1BasicInfo({ data, updateData, onValid }: Props) {
  const { register, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: data.title,
      event_type: data.event_type,
      short_description: data.short_description,
      description: data.description,
      organizer_name: data.organizer_name,
    },
    mode: 'onChange',
  });

  const watched = watch();

  useEffect(() => {
    updateData(watched);
    onValid(!!watched.title && !!watched.event_type && !!watched.short_description && !!watched.organizer_name);
  }, [JSON.stringify(watched)]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Basic Information</h2>
        <p className="text-sm text-neutral-500 mt-1">Tell us about your event. This is what attendees will see first.</p>
      </div>

      <div className="space-y-5">
        <Input
          label="Event Name"
          placeholder="e.g. FutureTech Summit 2026"
          {...register('title', { required: true })}
          error={errors.title?.message}
          required
        />

        <Select
          label="Event Type"
          placeholder="Select event type..."
          options={EVENT_TYPES}
          {...register('event_type', { required: true })}
          error={errors.event_type?.message}
          required
        />

        <Textarea
          label="Short Description"
          placeholder="A compelling one-liner about your event (max 300 chars)..."
          rows={2}
          maxLength={300}
          {...register('short_description', { required: true })}
          error={errors.short_description?.message}
          required
          hint="This appears in event listings and search results."
        />

        <Textarea
          label="Full Description"
          placeholder="Describe your event in detail — agenda highlights, why people should attend, what they'll gain..."
          rows={6}
          {...register('description', { required: true })}
          error={errors.description?.message}
          required
          hint="Markdown formatting is supported."
        />

        <Input
          label="Organizer Name"
          placeholder="Your name, company, or organization"
          {...register('organizer_name', { required: true })}
          error={errors.organizer_name?.message}
          required
        />

        {/* Cover image URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-800">
            Cover Image <span className="text-neutral-400 font-normal">(URL)</span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/event-cover.jpg"
            value={data.cover_image_url}
            onChange={(e) => updateData({ cover_image_url: e.target.value })}
            className="w-full h-10 px-3 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-neutral-300 transition-colors"
          />
          {data.cover_image_url && (
            <div className="relative w-full h-40 mt-2 bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden group">
              <img
                src={getPreviewUrl(data.cover_image_url)}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-4 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p class="text-sm font-medium">Image preview not available</p><p class="text-xs mt-1 max-w-[250px]">The link might be private, broken, or not direct image file.</p></div>';
                  }
                }}
              />
            </div>
          )}
          <p className="text-xs text-neutral-500">Recommended: 1400×600px, JPG or PNG. Google Drive links are supported.</p>
        </div>
      </div>
    </div>
  );
}

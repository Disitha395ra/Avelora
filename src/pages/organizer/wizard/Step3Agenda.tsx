import { useEffect } from 'react';
import { Plus, Trash2, Mic, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onValid: (valid: boolean) => void;
}

export function Step3Agenda({ data, updateData, onValid }: Props) {
  useEffect(() => {
    // Agenda and Speakers are completely optional
    onValid(true);
  }, [data.speakers, data.schedule, onValid]);

  const addSpeaker = () => {
    updateData({
      speakers: [...data.speakers, { name: '', title: '', org: '', avatar: '' }]
    });
  };

  const removeSpeaker = (index: number) => {
    updateData({
      speakers: data.speakers.filter((_, i) => i !== index)
    });
  };

  const updateSpeaker = (index: number, field: keyof WizardData['speakers'][0], value: string) => {
    const newSpeakers = [...data.speakers];
    newSpeakers[index] = { ...newSpeakers[index], [field]: value };
    updateData({ speakers: newSpeakers });
  };

  const addSchedule = () => {
    updateData({
      schedule: [...data.schedule, { time: '', title: '', speaker: '', location: '' }]
    });
  };

  const removeSchedule = (index: number) => {
    updateData({
      schedule: data.schedule.filter((_, i) => i !== index)
    });
  };

  const updateSchedule = (index: number, field: keyof WizardData['schedule'][0], value: string) => {
    const newSchedule = [...data.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    updateData({ schedule: newSchedule });
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-1">Agenda & Speakers</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Add the event schedule and key speakers. This information will be displayed on the public event page. Both are optional.
        </p>
      </div>

      {/* Speakers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Mic className="w-5 h-5 text-brand-500" /> Speakers / Artists
          </h3>
          <Button size="sm" variant="outline" onClick={addSpeaker} icon={<Plus className="w-4 h-4" />}>
            Add Speaker
          </Button>
        </div>

        {data.speakers.length === 0 ? (
          <div className="text-center py-6 bg-neutral-50 rounded-xl border border-neutral-100 border-dashed">
            <p className="text-sm text-neutral-500">No speakers added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.speakers.map((speaker, i) => (
              <div key={i} className="p-4 bg-white border border-neutral-200 rounded-xl flex gap-4 items-start relative group">
                <button
                  onClick={() => removeSpeaker(i)}
                  className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="Jane Doe"
                    value={speaker.name}
                    onChange={(e) => updateSpeaker(i, 'name', e.target.value)}
                  />
                  <Input
                    label="Title / Role"
                    placeholder="Keynote Speaker"
                    value={speaker.title}
                    onChange={(e) => updateSpeaker(i, 'title', e.target.value)}
                  />
                  <Input
                    label="Organization"
                    placeholder="Tech Corp"
                    value={speaker.org}
                    onChange={(e) => updateSpeaker(i, 'org', e.target.value)}
                  />
                  <Input
                    label="Initials / Avatar"
                    placeholder="JD"
                    maxLength={3}
                    value={speaker.avatar}
                    onChange={(e) => updateSpeaker(i, 'avatar', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-500" /> Event Schedule
          </h3>
          <Button size="sm" variant="outline" onClick={addSchedule} icon={<Plus className="w-4 h-4" />}>
            Add Schedule Item
          </Button>
        </div>

        {data.schedule.length === 0 ? (
          <div className="text-center py-6 bg-neutral-50 rounded-xl border border-neutral-100 border-dashed">
            <p className="text-sm text-neutral-500">No schedule items added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.schedule.map((item, i) => (
              <div key={i} className="p-4 bg-white border border-neutral-200 rounded-xl flex gap-4 items-start relative group">
                <button
                  onClick={() => removeSchedule(i)}
                  className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Time"
                    type="time"
                    value={item.time}
                    onChange={(e) => updateSchedule(i, 'time', e.target.value)}
                  />
                  <Input
                    label="Title / Description"
                    placeholder="Opening Ceremony"
                    value={item.title}
                    onChange={(e) => updateSchedule(i, 'title', e.target.value)}
                  />
                  <Input
                    label="Speaker (Optional)"
                    placeholder="Jane Doe"
                    value={item.speaker}
                    onChange={(e) => updateSchedule(i, 'speaker', e.target.value)}
                  />
                  <Input
                    label="Location (Optional)"
                    icon={<MapPin className="w-4 h-4" />}
                    placeholder="Main Hall"
                    value={item.location}
                    onChange={(e) => updateSchedule(i, 'location', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

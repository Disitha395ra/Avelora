import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
import { Step1BasicInfo } from './wizard/Step1BasicInfo';
import { Step2DateTime } from './wizard/Step2DateTime';
import { Step3Agenda } from './wizard/Step3Agenda';
import { Step4Location } from './wizard/Step4Location';
import { Step5Seating } from './wizard/Step5Seating';
import { Step6Tickets } from './wizard/Step6Tickets';
import { Step7Settings } from './wizard/Step7Settings';
import { Step8Preview } from './wizard/Step8Preview';
import { Step9Publish } from './wizard/Step9Publish';

export interface WizardData {
  // Step 1
  title: string;
  event_type: string;
  short_description: string;
  description: string;
  cover_image_url: string;
  organizer_name: string;
  // Step 2
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  timezone: string;
  // Step 3 (Agenda & Speakers)
  speakers: Array<{ name: string; title: string; org: string; avatar: string }>;
  schedule: Array<{ time: string; title: string; speaker: string; location: string }>;
  // Step 4
  venue_type: 'physical' | 'online' | 'hybrid';
  venue_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  online_url: string;
  online_platform: string;
  // Step 5
  seating_type: 'general_admission' | 'reserved' | 'table' | 'custom';
  seating_layout: {
    gridWidth: number;
    gridHeight: number;
    stage: { x: number; y: number; w: number; h: number } | null;
    sections: Array<{
      id: string;
      name: string;
      color: string;
      price: number;
    }>;
    cells: Array<{
      x: number;
      y: number;
      sectionId: string;
      label: string;
    }>;
  };
  // Step 6
  ticket_types: Array<{
    name: string; description: string; price: number;
    quantity: number; sale_start: string; sale_end: string;
  }>;
  currency: string;
  // Step 7
  max_capacity: number | null;
  booking_deadline: string;
  allow_cancellations: boolean;
  refund_policy: string;
  terms_and_conditions: string;
  contact_email: string;
  contact_phone: string;
  is_private: boolean;
  category_id: string;
}

const STEPS = [
  { number: 1, label: 'Basic Info', shortLabel: 'Info' },
  { number: 2, label: 'Date & Time', shortLabel: 'Date' },
  { number: 3, label: 'Agenda', shortLabel: 'Agenda' },
  { number: 4, label: 'Location', shortLabel: 'Location' },
  { number: 5, label: 'Seating', shortLabel: 'Seating' },
  { number: 6, label: 'Tickets', shortLabel: 'Tickets' },
  { number: 7, label: 'Settings', shortLabel: 'Settings' },
  { number: 8, label: 'Preview', shortLabel: 'Preview' },
  { number: 9, label: 'Publish', shortLabel: 'Publish' },
];

const defaultData: WizardData = {
  title: '',
  event_type: '',
  short_description: '',
  description: '',
  cover_image_url: '',
  organizer_name: '',
  start_date: '',
  start_time: '09:00',
  end_date: '',
  end_time: '17:00',
  timezone: 'UTC',
  speakers: [],
  schedule: [],
  venue_type: 'physical',
  venue_name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  latitude: null,
  longitude: null,
  online_url: '',
  online_platform: '',
  seating_type: 'general_admission',
  seating_layout: {
    gridWidth: 20,
    gridHeight: 20,
    stage: { x: 8, y: 0, w: 4, h: 2 },
    sections: [],
    cells: []
  },
  ticket_types: [{ name: 'General', description: '', price: 0, quantity: 100, sale_start: '', sale_end: '' }],
  currency: 'USD',
  max_capacity: null,
  booking_deadline: '',
  allow_cancellations: true,
  refund_policy: '',
  terms_and_conditions: '',
  contact_email: '',
  contact_phone: '',
  is_private: false,
  category_id: '',
};

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(defaultData);
  const [stepValid, setStepValid] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const markStepValid = (step: number, valid: boolean) => {
    setStepValid((prev) => ({ ...prev, [step]: valid }));
  };



  const goNext = () => {
    if (currentStep < 9) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const renderStep = () => {
    const props = { data, updateData, onValid: (v: boolean) => markStepValid(currentStep, v) };
    switch (currentStep) {
      case 1: return <Step1BasicInfo {...props} />;
      case 2: return <Step2DateTime {...props} />;
      case 3: return <Step3Agenda {...props} />;
      case 4: return <Step4Location {...props} />;
      case 5: return <Step5Seating {...props} />;
      case 6: return <Step6Tickets {...props} />;
      case 7: return <Step7Settings {...props} />;
      case 8: return <Step8Preview data={data} />;
      case 9: return <Step9Publish data={data} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Create Event</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
          </p>
        </div>
        <button
          onClick={() => navigate('/organizer/events')}
          className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        {/* Mobile: progress bar */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>{STEPS[currentStep - 1].label}</span>
            <span>{currentStep}/{STEPS.length}</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: step pills */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
          {STEPS.map((step, i) => {
            const isDone = step.number < currentStep;
            const isActive = step.number === currentStep;
            return (
              <div key={step.number} className="flex items-center shrink-0">
                <button
                  onClick={() => isDone && setCurrentStep(step.number)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150',
                    isDone && 'bg-green-50 text-green-700 cursor-pointer hover:bg-green-100',
                    isActive && 'bg-neutral-900 text-white',
                    !isDone && !isActive && 'bg-neutral-100 text-neutral-400 cursor-default'
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                      isActive ? 'bg-white/20' : 'bg-neutral-200 text-neutral-500'
                    )}>
                      {step.number}
                    </span>
                  )}
                  {step.label}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn('w-4 h-px mx-0.5', isDone ? 'bg-green-200' : 'bg-neutral-200')} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 mb-6 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 1}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        {currentStep < 8 ? (
          <Button
            onClick={goNext}
            disabled={!stepValid[currentStep]}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Continue
          </Button>
        ) : currentStep === 8 ? (
          <Button
            onClick={goNext}
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Proceed to Publish
          </Button>
        ) : null}
      </div>
    </div>
  );
}

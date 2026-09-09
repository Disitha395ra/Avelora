import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

interface Seat {
  id: string;
  section_id: string;
  row_id: string;
  label: string;
  row_label: string;
  seat_number: string;
  status: 'available' | 'held' | 'booked' | 'blocked';
  price: number;
}

interface Row {
  id: string;
  section_id: string;
  label: string;
  sort_order: number;
}

interface Section {
  id: string;
  name: string;
  capacity: number;
  sort_order: number;
}

interface SeatingMapProps {
  eventId: string;
  onSeatSelect: (selectedSeats: Seat[]) => void;
}

export function SeatingMap({ eventId, onSeatSelect }: SeatingMapProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeating = async () => {
      setLoading(true);
      
      const [sectionsRes, rowsRes, seatsRes] = await Promise.all([
        supabase.from('seating_sections').select('*').eq('event_id', eventId).order('sort_order'),
        supabase.from('seating_rows').select('*').eq('event_id', eventId).order('sort_order'),
        supabase.from('seats').select('*').eq('event_id', eventId).order('row_label').order('seat_number')
      ]);

      if (sectionsRes.data) setSections(sectionsRes.data);
      if (rowsRes.data) setRows(rowsRes.data);
      if (seatsRes.data) setSeats(seatsRes.data);
      
      setLoading(false);
    };

    fetchSeating();
  }, [eventId]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'available') return;
    
    const newSelected = new Set(selectedSeatIds);
    if (newSelected.has(seat.id)) {
      newSelected.delete(seat.id);
    } else {
      newSelected.add(seat.id);
    }
    setSelectedSeatIds(newSelected);
    
    const selectedSeatObjects = seats.filter(s => newSelected.has(s.id));
    onSeatSelect(selectedSeatObjects);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500 bg-neutral-50 rounded-xl">
        No seating map available for this event.
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Legend */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-center gap-6 bg-neutral-50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-brand-100 border border-brand-200" />
          <span className="text-xs text-neutral-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-brand-500 shadow-sm shadow-brand-500/20" />
          <span className="text-xs text-neutral-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-200" />
          <span className="text-xs text-neutral-600">Unavailable</span>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="min-w-max mx-auto">
          {/* Stage Area */}
          <div className="w-full h-12 bg-neutral-800 text-white flex items-center justify-center rounded-t-[50%] mb-12 shadow-inner">
            <span className="text-sm font-semibold tracking-widest uppercase opacity-50">Stage</span>
          </div>

          <div className="space-y-8">
            {sections.map(section => (
              <div key={section.id} className="text-center">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">{section.name}</h3>
                <div className="inline-flex flex-col gap-2">
                  {rows.filter(r => r.section_id === section.id).map(row => (
                    <div key={row.id} className="flex items-center justify-center gap-3">
                      <span className="text-xs font-semibold text-neutral-400 w-4">{row.label}</span>
                      <div className="flex items-center gap-1.5">
                        {seats.filter(s => s.row_id === row.id).map(seat => {
                          const isSelected = selectedSeatIds.has(seat.id);
                          const isAvailable = seat.status === 'available';
                          
                          return (
                            <button
                              key={seat.id}
                              disabled={!isAvailable}
                              onClick={() => toggleSeat(seat)}
                              title={`${seat.label} - $${seat.price}`}
                              className={cn(
                                "w-7 h-7 rounded-t-lg rounded-b-sm flex items-center justify-center text-[10px] font-medium transition-all duration-150",
                                isSelected ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-110 z-10" :
                                isAvailable ? "bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200" :
                                "bg-neutral-100 text-neutral-300 cursor-not-allowed"
                              )}
                            >
                              {seat.seat_number}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-semibold text-neutral-400 w-4">{row.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

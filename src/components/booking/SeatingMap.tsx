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

interface SeatingMapProps {
  eventId: string;
  onSeatSelect: (selectedSeats: Seat[]) => void;
}

export function SeatingMap({ eventId, onSeatSelect }: SeatingMapProps) {
  const [layout, setLayout] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeating = async () => {
      setLoading(true);
      
      try {
        const { data: eventData } = await supabase.from('events').select('layout_metadata').eq('id', eventId).single();
        if (eventData?.layout_metadata) setLayout(eventData.layout_metadata);

        // Fetch seats with pagination to bypass the 1000 row limit
        let allSeats: Seat[] = [];
        let hasMore = true;
        let from = 0;
        const step = 1000;
        
        while (hasMore) {
          const { data, error } = await supabase
            .from('seats')
            .select('*')
            .eq('event_id', eventId)
            .range(from, from + step - 1);
            
          if (error) break;
          if (data) {
            allSeats = [...allSeats, ...data];
            if (data.length < step) {
              hasMore = false;
            } else {
              from += step;
            }
          } else {
            hasMore = false;
          }
        }
        
        setSeats(allSeats);
      } catch (e) {
        console.error("Error fetching seating:", e);
      }
      
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

  if (!layout || !layout.cells || layout.cells.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500 bg-neutral-50 rounded-xl">
        No seating map available for this event.
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Legend */}
      <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center justify-center gap-6 bg-neutral-50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-neutral-300" />
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
        
        <div className="w-px h-4 bg-neutral-300 mx-2" />
        
        {layout.sections?.map((section: any) => (
          <div key={section.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }} />
            <span className="text-xs text-neutral-600">{section.name} (${section.price})</span>
          </div>
        ))}
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="min-w-max mx-auto flex items-center justify-center">
          
          <div 
            className="relative bg-white"
            style={{ 
              width: layout.gridWidth * 28, 
              height: layout.gridHeight * 28,
            }}
          >
            {/* Render Stage Overlay */}
            {layout.stage && (
              <div 
                className="absolute bg-neutral-900 rounded-xl shadow-lg flex items-center justify-center text-white font-bold tracking-widest text-sm pointer-events-none"
                style={{
                  left: layout.stage.x * 28 + 4,
                  top: layout.stage.y * 28 + 4,
                  width: layout.stage.w * 28 - 8,
                  height: layout.stage.h * 28 - 8,
                }}
              >
                STAGE
              </div>
            )}

            {/* Render Seats */}
            {layout.cells.map((cell: any) => {
              // Find matching seat from DB
              const dbSeat = seats.find(s => s.label === cell.label);
              const section = layout.sections.find((s: any) => s.id === cell.sectionId);
              
              if (!dbSeat || !section) return null;

              const isSelected = selectedSeatIds.has(dbSeat.id);
              const isAvailable = dbSeat.status === 'available';

              return (
                <button
                  key={dbSeat.id}
                  disabled={!isAvailable}
                  onClick={() => toggleSeat(dbSeat)}
                  title={`${dbSeat.label} - $${dbSeat.price}`}
                  className={cn(
                    "absolute w-6 h-6 rounded-t-full rounded-b-sm flex items-center justify-center text-[9px] font-bold transition-all duration-150",
                    isSelected ? "bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-110 z-10 border-0" :
                    isAvailable ? "bg-white hover:scale-110 z-0" :
                    "bg-neutral-200 text-neutral-400 cursor-not-allowed border-0"
                  )}
                  style={{
                    left: cell.x * 28 + 2,
                    top: cell.y * 28 + 2,
                    border: isSelected || !isAvailable ? 'none' : `2px solid ${section.color}`,
                    color: isSelected ? 'white' : (!isAvailable ? '#a3a3a3' : '#171717')
                  }}
                >
                  {dbSeat.seat_number}
                </button>
              );
            })}
          </div>
          
        </div>
      </div>
    </div>
  );
}

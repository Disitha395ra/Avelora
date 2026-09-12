import { useState, useEffect, useCallback } from 'react';
import { Users, Layout, Table, Pencil, Plus, Trash2, Maximize, Printer, X } from 'lucide-react';
import { cn } from '@/utils';
import { Input } from '@/components/ui/Input';
import type { WizardData } from '../CreateEventPage';

interface Props {
  data: WizardData;
  updateData: (u: Partial<WizardData>) => void;
  onValid: (v: boolean) => void;
}

const SEATING_TYPES = [
  {
    value: 'general_admission' as const,
    label: 'General Admission',
    icon: Users,
    description: 'First-come, first-served. No assigned seats.',
    example: 'Concerts, Festivals, Community events',
  },
  {
    value: 'reserved' as const,
    label: 'Reserved Seating',
    icon: Layout,
    description: 'Each attendee selects a specific seat on a visual map.',
    example: 'Theatres, Conferences, Seminars',
  },
  {
    value: 'table' as const,
    label: 'Table Seating',
    icon: Table,
    description: 'Seating arranged by tables or groups.',
    example: 'Galas, Award Ceremonies, Banquets',
  },
  {
    value: 'custom' as const,
    label: 'Custom Layout',
    icon: Pencil,
    description: 'Build your own seating map with sections, rows, and zones.',
    example: 'Exhibitions, Hybrid events, Unique venues',
  },
];

const SECTION_COLORS = [
  '#c9a84c', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6',
];

export function Step5Seating({ data, updateData, onValid }: Props) {
  useEffect(() => {
    if (data.seating_type === 'reserved') {
      const isValid = data.seating_layout?.sections?.length > 0 && data.seating_layout?.cells?.length > 0;
      onValid(isValid);
    } else {
      onValid(!!data.seating_type);
    }
  }, [data.seating_type, data.seating_layout, onValid]);

  // Visual Builder State
  const [activeTool, setActiveTool] = useState<string | 'stage' | 'empty'>('stage');
  const [isPainting, setIsPainting] = useState(false);
  const [stageSize, setStageSize] = useState({ w: 6, h: 2 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const layout = data.seating_layout || {
    gridWidth: 20,
    gridHeight: 20,
    stage: { x: 8, y: 0, w: 4, h: 2 },
    sections: [],
    cells: [],
  };

  // Helper: count cells per section
  const getSectionCount = (sectionId: string) =>
    layout.cells.filter((c) => c.sectionId === sectionId).length;
  const totalSeats = layout.cells.length;

  const addSection = () => {
    const newSection = {
      id: Math.random().toString(36).substring(7),
      name: `Section ${layout.sections.length + 1}`,
      color: SECTION_COLORS[layout.sections.length % SECTION_COLORS.length],
      price: 50,
    };
    updateData({ seating_layout: { ...layout, sections: [...layout.sections, newSection] } });
  };

  const updateSection = (id: string, updates: Record<string, unknown>) => {
    updateData({
      seating_layout: {
        ...layout,
        sections: layout.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      },
    });
  };

  const removeSection = (id: string) => {
    updateData({
      seating_layout: {
        ...layout,
        sections: layout.sections.filter((s) => s.id !== id),
        cells: layout.cells.filter((c) => c.sectionId !== id),
      },
    });
    if (activeTool === id) setActiveTool('empty');
  };

  const handleCellAction = useCallback(
    (x: number, y: number) => {
      let newLayout = { ...layout };

      if (activeTool === 'stage') {
        newLayout.stage = { x, y, w: stageSize.w, h: stageSize.h };
        newLayout.cells = newLayout.cells.filter(
          (c) => !(c.x >= x && c.x < x + stageSize.w && c.y >= y && c.y < y + stageSize.h),
        );
      } else if (activeTool === 'empty') {
        newLayout.cells = newLayout.cells.filter((c) => !(c.x === x && c.y === y));
      } else {
        const section = newLayout.sections.find((s) => s.id === activeTool);
        if (section) {
          if (
            newLayout.stage &&
            x >= newLayout.stage.x &&
            x < newLayout.stage.x + newLayout.stage.w &&
            y >= newLayout.stage.y &&
            y < newLayout.stage.y + newLayout.stage.h
          ) {
            return;
          }
          newLayout.cells = newLayout.cells.filter((c) => !(c.x === x && c.y === y));
          const rowChar = String.fromCharCode(65 + (y % 26));
          newLayout.cells.push({ x, y, sectionId: activeTool, label: `${rowChar}${x + 1}` });
        }
      }

      updateData({ seating_layout: newLayout });
    },
    [layout, activeTool, updateData],
  );

  const handlePointerDown = (x: number, y: number, e: React.PointerEvent) => {
    e.preventDefault();
    setIsPainting(true);
    handleCellAction(x, y);
  };

  const handlePointerEnter = (x: number, y: number, e: React.PointerEvent) => {
    e.preventDefault();
    if (isPainting && activeTool !== 'stage') {
      handleCellAction(x, y);
    }
  };

  const handlePointerUp = () => setIsPainting(false);

  useEffect(() => {
    const handleGlobalUp = () => setIsPainting(false);
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, []);

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-layout, #printable-layout * { visibility: visible; }
          #printable-layout {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          #printable-layout .canvas-container {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">Seating Configuration</h2>
        <p className="text-sm text-neutral-500 mt-1">Choose how your event venue is structured.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SEATING_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => updateData({ seating_type: type.value })}
            className={cn(
              'flex flex-col items-start p-5 rounded-xl border-2 text-left transition-all duration-150 group',
              data.seating_type === type.value
                ? 'border-brand-500 bg-brand-50'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50',
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors',
                data.seating_type === type.value
                  ? 'bg-brand-100'
                  : 'bg-neutral-100 group-hover:bg-neutral-200',
              )}
            >
              <type.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  data.seating_type === type.value ? 'text-brand-600' : 'text-neutral-500',
                )}
              />
            </div>
            <p
              className={cn(
                'text-sm font-semibold mb-1',
                data.seating_type === type.value ? 'text-brand-700' : 'text-neutral-900',
              )}
            >
              {type.label}
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed mb-2">{type.description}</p>
            <p className="text-xs text-neutral-400 italic">{type.example}</p>
          </button>
        ))}
      </div>

      {data.seating_type === 'reserved' ? (
        <div className={cn(
          "mt-8 border-t border-neutral-200 pt-8",
          isFullscreen && "fixed inset-0 z-50 bg-white p-6 md:p-8 m-0 border-0 overflow-auto flex flex-col"
        )}>
          <div className="mb-6 shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Visual Layout Builder</h3>
                <p className="text-sm text-neutral-500">
                  Create sections, pick a tool, and paint seats onto the grid.
                </p>
              </div>
              {/* Total seat counter & Grid controls */}
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-neutral-500">Grid:</span>
                    <input 
                      type="number" 
                      min={10} max={200}
                      value={layout.gridWidth}
                      onChange={(e) => updateData({ seating_layout: { ...layout, gridWidth: Math.max(10, parseInt(e.target.value) || 20) } })}
                      className="w-12 h-7 text-xs border border-neutral-200 rounded px-1 text-center"
                    />
                    <span className="text-xs text-neutral-400">×</span>
                    <input 
                      type="number" 
                      min={10} max={200}
                      value={layout.gridHeight}
                      onChange={(e) => updateData({ seating_layout: { ...layout, gridHeight: Math.max(10, parseInt(e.target.value) || 20) } })}
                      className="w-12 h-7 text-xs border border-neutral-200 rounded px-1 text-center"
                    />
                  </div>
                </div>

                {totalSeats > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-sm font-bold text-brand-700">{totalSeats}</span>
                    <span className="hidden sm:inline text-xs text-brand-600">total seats</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 border-l border-neutral-200 pl-2 sm:pl-4">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 rounded shadow-sm flex items-center gap-1 text-xs font-medium"
                    title="Print Layout"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                  {isFullscreen ? (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 border border-red-200 rounded shadow-sm flex items-center gap-1 text-xs font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Close</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 rounded shadow-sm flex items-center gap-1 text-xs font-medium"
                    >
                      <Maximize className="w-4 h-4" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div id="printable-layout" className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
            {/* Left: Tools & Sections */}
            <div className="w-full lg:w-72 shrink-0 space-y-6">
              {/* Core Tools */}
              <div className="no-print">
                <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                  Tools
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => setActiveTool('stage')}
                    className={cn(
                      'p-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                      activeTool === 'stage'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300',
                    )}
                  >
                    <Maximize className="w-4 h-4" /> Stage
                  </button>
                  <button
                    onClick={() => setActiveTool('empty')}
                    className={cn(
                      'p-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                      activeTool === 'empty'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300',
                    )}
                  >
                    <Trash2 className="w-4 h-4" /> Eraser
                  </button>
                </div>
                {activeTool === 'stage' && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between gap-2">
                    <span className="text-xs text-neutral-600">Stage Size:</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" min={1} max={50} value={stageSize.w} 
                        onChange={(e) => setStageSize(s => ({ ...s, w: Math.max(1, parseInt(e.target.value) || 1) }))} 
                        className="w-10 h-6 text-xs border border-neutral-200 rounded px-1 text-center" title="Width"
                      />
                      <span className="text-xs text-neutral-400">×</span>
                      <input 
                        type="number" min={1} max={50} value={stageSize.h} 
                        onChange={(e) => setStageSize(s => ({ ...s, h: Math.max(1, parseInt(e.target.value) || 1) }))} 
                        className="w-10 h-6 text-xs border border-neutral-200 rounded px-1 text-center" title="Height"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sections */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Sections
                  </h4>
                  <button
                    onClick={addSection}
                    className="text-xs text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="space-y-3">
                  {layout.sections.map((section) => {
                    const count = getSectionCount(section.id);
                    return (
                      <div
                        key={section.id}
                        className={cn(
                          'p-3 rounded-xl border-2 transition-colors cursor-pointer',
                          activeTool === section.id
                            ? 'border-neutral-900 shadow-sm bg-white'
                            : 'border-transparent bg-neutral-50 hover:bg-neutral-100',
                        )}
                        onClick={() => setActiveTool(section.id)}
                      >
                        <div className="flex gap-2 items-center mb-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: section.color }}
                          />
                          <Input
                            value={section.name}
                            onChange={(e) => updateSection(section.id, { name: e.target.value })}
                            className="h-7 text-xs px-2 bg-white"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSection(section.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="pl-5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500">Price:</span>
                            <Input
                              type="number"
                              value={section.price}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  price: parseInt(e.target.value) || 0,
                                })
                              }
                              className="h-7 text-xs px-2 bg-white w-20"
                            />
                          </div>
                          {/* Live seat count badge */}
                          <div
                            className={cn(
                              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                              count > 0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-neutral-100 text-neutral-400',
                            )}
                          >
                            <Users className="w-2.5 h-2.5" />
                            {count}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {layout.sections.length === 0 && (
                    <div className="text-center p-4 border border-dashed border-neutral-300 rounded-xl text-neutral-500 text-sm">
                      Create a section to paint seats.
                    </div>
                  )}
                </div>
              </div>

              {/* Seat Summary Box */}
              {layout.sections.length > 0 && totalSeats > 0 && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Seat Summary
                  </p>
                  <div className="space-y-1.5">
                    {layout.sections.map((section) => {
                      const count = getSectionCount(section.id);
                      return (
                        <div key={section.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: section.color }}
                            />
                            <span className="text-xs text-neutral-600">{section.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-neutral-900">{count} seats</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-neutral-200 pt-1.5 flex justify-between">
                      <span className="text-xs font-semibold text-neutral-700">Total</span>
                      <span className="text-xs font-bold text-brand-600">{totalSeats} seats</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Grid Canvas */}
            <div className="flex-1 bg-neutral-100 rounded-2xl p-6 border border-neutral-200 overflow-auto">
              <div className="min-w-max min-h-max flex items-center justify-center mx-auto">
                <div
                  className="relative bg-white shadow-sm border border-neutral-200 select-none touch-none"
                style={{
                  width: layout.gridWidth * 24,
                  height: layout.gridHeight * 24,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${layout.gridWidth}, 1fr)`,
                  gridTemplateRows: `repeat(${layout.gridHeight}, 1fr)`,
                }}
                onPointerLeave={handlePointerUp}
              >
                {/* Render Grid Cells */}
                {Array.from({ length: layout.gridHeight }).map((_, y) =>
                  Array.from({ length: layout.gridWidth }).map((_, x) => {
                    const cell = layout.cells.find((c) => c.x === x && c.y === y);
                    const section = cell
                      ? layout.sections.find((s) => s.id === cell.sectionId)
                      : null;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className="box-border border-r border-b border-neutral-100 flex items-center justify-center"
                        onPointerDown={(e) => handlePointerDown(x, y, e)}
                        onPointerEnter={(e) => handlePointerEnter(x, y, e)}
                      >
                        {cell && section && (
                          <div
                            className="w-[18px] h-[18px] rounded-sm shadow-sm"
                            style={{ backgroundColor: section.color }}
                          />
                        )}
                      </div>
                    );
                  }),
                )}

                {/* Render Stage Overlay */}
                {layout.stage && (
                  <div
                    className="absolute bg-neutral-900 rounded-md shadow-lg flex items-center justify-center text-white font-bold tracking-widest text-xs pointer-events-none"
                    style={{
                      left: layout.stage.x * 24 + 2,
                      top: layout.stage.y * 24 + 2,
                      width: layout.stage.w * 24 - 4,
                      height: layout.stage.h * 24 - 4,
                    }}
                  >
                    STAGE
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500 justify-center">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-neutral-900 rounded-sm" /> Stage
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-brand-500 rounded-sm" /> Seat
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 border border-neutral-200 bg-white rounded-sm" /> Empty
            </span>
          </div>
        </div>
      ) : (
        data.seating_type && (
          <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <p className="text-sm font-medium text-neutral-700">
              ✓ Selected: {SEATING_TYPES.find((t) => t.value === data.seating_type)?.label}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              General seating requires no detailed map.
            </p>
          </div>
        )
      )}
    </div>
  );
}

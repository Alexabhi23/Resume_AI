import { create } from 'zustand';

export type BulletStatus = 'pending' | 'streaming' | 'done' | 'accepted' | 'rejected';
export type Template = 'classic' | 'modern' | 'minimal' | 'executive';

export interface BulletState {
  id: string;
  original: string;
  rewritten: string | null;
  status: BulletStatus;
  keywords: string[];
  progress: number; // 0–100 streaming progress
  editedText: string | null; // user-edited override
}

interface ResumeStore {
  jobId: string | null;
  structuredResume: Record<string, unknown> | null;
  bullets: Record<string, BulletState>;
  kasScore: number;
  acceptedCount: number;
  totalBullets: number;
  selectedTemplate: Template;
  error: string | null;
  exportUrl: string | null;

  setJobId: (id: string) => void;
  setStructuredResume: (resume: Record<string, unknown>) => void;
  updateBulletProgress: (payload: { id: string; progress: number; partial?: string }) => void;
  setBulletResult: (payload: { id: string; rewritten: string; keywords: string[] }) => void;
  acceptBullet: (id: string) => void;
  rejectBullet: (id: string) => void;
  editBullet: (id: string, text: string) => void;
  setKASScore: (score: number) => void;
  setSelectedTemplate: (t: Template) => void;
  setError: (msg: string | null) => void;
  setExportUrl: (url: string | null) => void;
  resetStore: () => void;
}

const initialState = {
  jobId: null,
  structuredResume: null,
  bullets: {},
  kasScore: 0,
  acceptedCount: 0,
  totalBullets: 0,
  selectedTemplate: 'classic' as Template,
  error: null,
  exportUrl: null,
};

export const useResumeStore = create<ResumeStore>((set) => ({
  ...initialState,

  setJobId: (id) => set({ jobId: id }),
  setStructuredResume: (resume) => set({ structuredResume: resume }),

  updateBulletProgress: ({ id, progress, partial }) =>
    set((state) => ({
      bullets: {
        ...state.bullets,
        [id]: {
          ...(state.bullets[id] || {
            id,
            original: '',
            rewritten: null,
            status: 'streaming',
            keywords: [],
            progress: 0,
            editedText: null,
          }),
          status: 'streaming',
          progress,
          rewritten: partial ?? state.bullets[id]?.rewritten ?? null,
        },
      },
    })),

  setBulletResult: ({ id, rewritten, keywords }) =>
    set((state) => ({
      bullets: {
        ...state.bullets,
        [id]: {
          ...(state.bullets[id] || {
            id,
            original: '',
            editedText: null,
          }),
          rewritten,
          keywords,
          status: 'done',
          progress: 100,
        },
      },
      totalBullets: Object.keys(state.bullets).length + (state.bullets[id] ? 0 : 1),
    })),

  acceptBullet: (id) =>
    set((state) => {
      const bullet = state.bullets[id];
      if (!bullet || bullet.status === 'accepted') return state;
      const accepted = state.acceptedCount + 1;
      // KAS score delta: each accepted bullet adds proportional score
      const delta = Math.round(100 / Math.max(state.totalBullets, 1));
      return {
        bullets: { ...state.bullets, [id]: { ...bullet, status: 'accepted' } },
        acceptedCount: accepted,
        kasScore: Math.min(100, state.kasScore + delta),
      };
    }),

  rejectBullet: (id) =>
    set((state) => {
      const bullet = state.bullets[id];
      if (!bullet || bullet.status === 'rejected') return state;
      const wasAccepted = bullet.status === 'accepted';
      const delta = Math.round(100 / Math.max(state.totalBullets, 1));
      return {
        bullets: { ...state.bullets, [id]: { ...bullet, status: 'rejected' } },
        acceptedCount: wasAccepted ? Math.max(0, state.acceptedCount - 1) : state.acceptedCount,
        kasScore: wasAccepted ? Math.max(0, state.kasScore - delta) : state.kasScore,
      };
    }),

  editBullet: (id, text) =>
    set((state) => ({
      bullets: {
        ...state.bullets,
        [id]: { ...state.bullets[id], editedText: text, status: 'accepted' },
      },
    })),

  setKASScore: (score) => set({ kasScore: score }),
  setSelectedTemplate: (t) => set({ selectedTemplate: t }),
  setError: (msg) => set({ error: msg }),
  setExportUrl: (url) => set({ exportUrl: url }),
  resetStore: () => set(initialState),
}));

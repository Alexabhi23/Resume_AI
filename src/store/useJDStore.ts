import { create } from 'zustand';

export interface JDRequirement {
  id: string;
  text: string;
  category: 'skill' | 'experience' | 'education' | 'other';
}

interface JDStore {
  rawJD: string;
  requirements: JDRequirement[];
  keywords: string[];
  seniority: string | null;

  setRawJD: (jd: string) => void;
  setRequirements: (reqs: JDRequirement[]) => void;
  setKeywords: (kws: string[]) => void;
  setSeniority: (level: string | null) => void;
  addRequirement: (req: JDRequirement) => void;
  removeRequirement: (id: string) => void;
  resetJD: () => void;
}

export const useJDStore = create<JDStore>((set) => ({
  rawJD: '',
  requirements: [],
  keywords: [],
  seniority: null,

  setRawJD: (jd) => set({ rawJD: jd }),
  setRequirements: (reqs) => set({ requirements: reqs }),
  setKeywords: (kws) => set({ keywords: kws }),
  setSeniority: (level) => set({ seniority: level }),
  addRequirement: (req) =>
    set((state) => ({ requirements: [...state.requirements, req] })),
  removeRequirement: (id) =>
    set((state) => ({
      requirements: state.requirements.filter((r) => r.id !== id),
    })),
  resetJD: () =>
    set({ rawJD: '', requirements: [], keywords: [], seniority: null }),
}));

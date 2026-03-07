import { createContext, useContext, useReducer, useCallback } from 'react';
import { createInitialProject } from '../data/defaultData';

const ProjectContext = createContext(null);

function projectReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_STEP0':
      return { ...state, step0: { ...state.step0, ...action.payload } };
    case 'UPDATE_STEP1':
      return { ...state, step1: { ...state.step1, ...action.payload } };
    case 'UPDATE_STEP2':
      return { ...state, step2: { ...state.step2, ...action.payload } };
    case 'UPDATE_STEP3':
      return { ...state, step3: { ...state.step3, ...action.payload } };
    case 'UPDATE_AI_COMMENTS':
      return { ...state, aiComments: { ...state.aiComments, ...action.payload } };
    case 'UPDATE_AI_SETTINGS':
      return { ...state, aiSettings: { ...state.aiSettings, ...action.payload } };
    case 'RESET':
      return createInitialProject();
    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [project, dispatch] = useReducer(projectReducer, null, createInitialProject);

  const saveToFile = useCallback(() => {
    const data = { ...project };
    // APIキーは保存しない
    const saveData = { ...data, aiSettings: { ...data.aiSettings, apiKey: '' } };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const name = project.settings.projectName || 'STP分析';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}_${date}.stp.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [project]);

  const loadFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.stp.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          dispatch({ type: 'SET_PROJECT', payload: data });
        } catch {
          alert('ファイルの読み込みに失敗しました。正しいJSON形式か確認してください。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <ProjectContext.Provider value={{ project, dispatch, saveToFile, loadFromFile }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}

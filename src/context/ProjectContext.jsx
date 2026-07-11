import { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { createInitialProject } from '../data/defaultData';

const ProjectContext = createContext(null);
const STORAGE_KEY = 'stpAnalysisProject_v1';
const HISTORY_KEY = 'stpAnalysisProjects_v1'; // プロジェクト一覧
const MAX_UNDO = 30;

/** 古いデータ構造を最新に移行 */
function migrateProject(data) {
  // v1→v2: swotフィールドを追加
  if (!data.swot) {
    data.swot = {
      strengths: [], weaknesses: [], opportunities: [], threats: [],
      strategyOptions: [],
      skipped: false,
    };
  }
  // v4→v5: クロスSWOTを「4象限固定入力」から「戦略オプション方式」に移行
  // 旧 crossStrategies の記入内容は、視点タグ付きの戦略オプションとして引き継ぐ
  if (data.swot && !data.swot.strategyOptions) {
    const cs = data.swot.crossStrategies || {};
    data.swot.strategyOptions = ['so', 'st', 'wo', 'wt']
      .filter(k => (cs[k] || '').trim())
      .map((k, i) => ({ id: `opt_migrated_${i}`, type: k, text: cs[k], effect: '', feasibility: '' }));
    delete data.swot.crossStrategies;
  }
  // v2→v3: step3.kbfフィールドを追加
  if (data.step3 && !data.step3.kbf) {
    data.step3.kbf = [];
  }
  // v1→v2: customizationフィールドを追加
  if (!data.customization) {
    data.customization = { theme: 'light', brandColor: '#2563eb', logoUrl: '' };
  }
  // v1→v2: aiComments.swotComment を追加
  if (!data.aiComments) data.aiComments = {};
  if (!data.aiComments.swotComment) data.aiComments.swotComment = '';
  // v3→v4: actionPlanフィールドを追加
  if (!data.actionPlan) {
    data.actionPlan = { items: [] };
  }
  return data;
}

/** localStorage から復元 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = migrateProject(JSON.parse(raw));
      if (data.aiSettings) data.aiSettings.apiKey = '';
      return data;
    }
  } catch { /* ignore */ }
  return null;
}

/** localStorage に保存（apiKey除外）。失敗時はエラー内容を返して呼び出し側で警告表示する */
function saveToStorage(state) {
  try {
    const data = { ...state, aiSettings: { ...state.aiSettings, apiKey: '' } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { time: new Date().toLocaleTimeString('ja-JP'), error: null };
  } catch (e) {
    console.error('自動保存に失敗:', e);
    const isQuota = e && (e.name === 'QuotaExceededError' || e.code === 22);
    return {
      time: null,
      error: isQuota
        ? 'ブラウザの保存容量が上限に達しています。「💾 保存」でファイルに退避してください。'
        : '自動保存に失敗しました。「💾 保存」でファイルに退避してください。',
    };
  }
}

/** プロジェクト一覧の管理 */
function loadProjectList() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveProjectList(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

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
    case 'UPDATE_SWOT':
      return { ...state, swot: { ...state.swot, ...action.payload } };
    case 'UPDATE_AI_COMMENTS':
      return { ...state, aiComments: { ...state.aiComments, ...action.payload } };
    case 'UPDATE_ACTION_PLAN':
      return { ...state, actionPlan: { ...state.actionPlan, ...action.payload } };
    case 'UPDATE_AI_SETTINGS':
      return { ...state, aiSettings: { ...state.aiSettings, ...action.payload } };
    case 'UPDATE_CUSTOMIZATION':
      return { ...state, customization: { ...state.customization, ...action.payload } };
    case 'RESET':
      return createInitialProject();
    default:
      return state;
  }
}

function initProject() {
  return loadFromStorage() || createInitialProject();
}

export function ProjectProvider({ children }) {
  const [project, dispatch] = useReducer(projectReducer, null, initProject);

  // Undo/Redo 履歴
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const isUndoRedo = useRef(false);
  const prevState = useRef(null);
  const [lastSaved, setLastSaved] = useState('');
  const [saveError, setSaveError] = useState('');
  const saveErrorRef = useRef('');

  // 自動保存: state変更のたびにlocalStorageに保存（300msデバウンス）
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const result = saveToStorage(project);
      if (result.time) setLastSaved(result.time);
      setSaveError(result.error || '');
      saveErrorRef.current = result.error || '';

      // プロジェクト一覧に登録済みなら、個別データと一覧メタデータも同期更新
      // （「一覧に保存」の押し忘れで編集が古い状態に戻る事故を防ぐ）
      if (!result.error && project._projectId) {
        try {
          const saveData = { ...project, aiSettings: { ...project.aiSettings, apiKey: '' } };
          localStorage.setItem(`stpProject_${project._projectId}`, JSON.stringify(saveData));
          const list = loadProjectList();
          const idx = list.findIndex(p => p.id === project._projectId);
          if (idx >= 0) {
            list[idx] = {
              ...list[idx],
              name: project.settings.projectName || '無題プロジェクト',
              companyName: project.settings.companyName,
              marketType: project.settings.marketType,
              updatedAt: new Date().toISOString(),
            };
            saveProjectList(list);
          }
        } catch (e) {
          console.error('プロジェクト一覧の同期に失敗:', e);
        }
      }

      // Undo履歴に追加（Undo/Redo操作自体でない場合のみ）
      if (!isUndoRedo.current && prevState.current) {
        undoStack.current.push(prevState.current);
        if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
        redoStack.current = [];
      }
      isUndoRedo.current = false;
      prevState.current = JSON.parse(JSON.stringify(project));
    }, 300);
    return () => clearTimeout(saveTimer.current);
  }, [project]);

  // 保存に失敗している間は、タブを閉じる前にブラウザ標準の確認ダイアログを出す
  useEffect(() => {
    const handler = (e) => {
      if (saveErrorRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // 初回のprevState設定
  useEffect(() => {
    prevState.current = JSON.parse(JSON.stringify(project));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop();
    redoStack.current.push(JSON.parse(JSON.stringify(project)));
    isUndoRedo.current = true;
    // API keyを保持
    prev.aiSettings = { ...prev.aiSettings, apiKey: project.aiSettings.apiKey };
    dispatch({ type: 'SET_PROJECT', payload: prev });
  }, [project]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    undoStack.current.push(JSON.parse(JSON.stringify(project)));
    isUndoRedo.current = true;
    next.aiSettings = { ...next.aiSettings, apiKey: project.aiSettings.apiKey };
    dispatch({ type: 'SET_PROJECT', payload: next });
  }, [project]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  // Ctrl+Z / Ctrl+Shift+Z キーボードショートカット
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const saveToFile = useCallback(() => {
    const data = { ...project };
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
          // 本アプリのプロジェクトファイルかを最低限確認し、旧形式は最新構造に移行
          if (!data || typeof data !== 'object' || !data.settings || !data.step0) {
            alert('このファイルは戦略コンパス（旧STP分析アプリ）のプロジェクトファイル（.stp.json）ではないようです。');
            return;
          }
          dispatch({ type: 'SET_PROJECT', payload: migrateProject(data) });
        } catch {
          alert('ファイルの読み込みに失敗しました。正しいJSON形式か確認してください。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // プロジェクト一覧管理
  const saveProjectToList = useCallback(() => {
    const list = loadProjectList();
    const name = project.settings.projectName || '無題プロジェクト';
    const id = project._projectId || `proj_${Date.now()}`;
    const entry = {
      id,
      name,
      companyName: project.settings.companyName,
      marketType: project.settings.marketType,
      updatedAt: new Date().toISOString(),
      createdAt: list.find(p => p.id === id)?.createdAt || new Date().toISOString(),
    };
    // 既存エントリを更新、なければ先頭に追加
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    saveProjectList(list);

    // プロジェクトデータ自体も個別に保存
    const saveData = { ...project, _projectId: id, aiSettings: { ...project.aiSettings, apiKey: '' } };
    try { localStorage.setItem(`stpProject_${id}`, JSON.stringify(saveData)); } catch { /* */ }

    // _projectId をstateにセット
    if (!project._projectId) {
      dispatch({ type: 'SET_PROJECT', payload: { ...project, _projectId: id } });
    }
    return id;
  }, [project]);

  const loadProjectFromList = useCallback((id) => {
    try {
      const raw = localStorage.getItem(`stpProject_${id}`);
      if (raw) {
        const data = migrateProject(JSON.parse(raw));
        data.aiSettings = { ...data.aiSettings, apiKey: project.aiSettings.apiKey };
        dispatch({ type: 'SET_PROJECT', payload: data });
        return true;
      }
    } catch { /* */ }
    return false;
  }, [project.aiSettings.apiKey]);

  const deleteProjectFromList = useCallback((id) => {
    const list = loadProjectList().filter(p => p.id !== id);
    saveProjectList(list);
    try { localStorage.removeItem(`stpProject_${id}`); } catch { /* */ }
  }, []);

  const getProjectList = useCallback(() => loadProjectList(), []);

  const duplicateProject = useCallback((id) => {
    try {
      const raw = localStorage.getItem(`stpProject_${id}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const newId = `proj_${Date.now()}`;
      data._projectId = newId;
      data.settings.projectName = `${data.settings.projectName || '無題'} (コピー)`;
      data.aiSettings.apiKey = '';
      localStorage.setItem(`stpProject_${newId}`, JSON.stringify(data));

      const list = loadProjectList();
      list.unshift({
        id: newId,
        name: data.settings.projectName,
        companyName: data.settings.companyName,
        marketType: data.settings.marketType,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      saveProjectList(list);
      return newId;
    } catch { return null; }
  }, []);

  return (
    <ProjectContext.Provider value={{
      project, dispatch,
      saveToFile, loadFromFile,
      undo, redo, canUndo, canRedo,
      lastSaved, saveError,
      saveProjectToList, loadProjectFromList, deleteProjectFromList, getProjectList, duplicateProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}

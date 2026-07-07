import { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { DEMO_LIST, createDemoProject, createDemoProjectFuji, createDemoProjectBakery } from '../data/demoData';

const DEMO_FACTORIES = {
  createDemoProject,
  createDemoProjectFuji,
  createDemoProjectBakery,
};

// モニター向けフィードバックフォーム（GoogleフォームのURLをここに設定。空文字ならボタン非表示）
const FEEDBACK_FORM_URL = 'https://forms.gle/HZg5KMz2MhtQR4ZB8';

export default function Header({ onOpenAISettings, onOpenTutorial, onReset, onOpenProjectList }) {
  const { project, dispatch, saveToFile, loadFromFile, undo, redo, canUndo, canRedo, lastSaved, saveError } = useProject();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showDemoMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowDemoMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDemoMenu]);

  const loadDemo = (factoryName) => {
    if (project.settings.projectName && !window.confirm('現在のデータを破棄してデモデータを読み込みますか？')) return;
    const factory = DEMO_FACTORIES[factoryName];
    if (factory) {
      dispatch({ type: 'SET_PROJECT', payload: factory() });
    }
    setShowDemoMenu(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">STP分析支援アプリ</h1>
          {project.settings.projectName && (
            <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm">
              {project.settings.projectName}
            </span>
          )}
          {saveError ? (
            <span
              className="text-xs bg-red-500 text-white font-bold px-2 py-1 rounded flex items-center gap-1"
              title={saveError}
            >
              ⚠️ 自動保存失敗 — 「💾 保存」でファイル退避を
            </span>
          ) : lastSaved && (
            <span className="text-xs text-blue-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              自動保存済 {lastSaved}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 header-actions">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 mr-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="btn btn-sm bg-white/15 text-white hover:bg-white/25 border-0 px-2 disabled:opacity-30"
              title="元に戻す (Ctrl+Z)"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="btn btn-sm bg-white/15 text-white hover:bg-white/25 border-0 px-2 disabled:opacity-30"
              title="やり直し (Ctrl+Shift+Z)"
            >
              ↪
            </button>
          </div>

          {/* ダークモード */}
          <button
            onClick={() => dispatch({ type: 'UPDATE_CUSTOMIZATION', payload: { theme: project.customization?.theme === 'dark' ? 'light' : 'dark' } })}
            className="btn btn-sm bg-white/15 text-white hover:bg-white/25 border-0 px-2"
            title="ダークモード切替"
          >
            {project.customization?.theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* プロジェクト一覧 */}
          <button onClick={onOpenProjectList} className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0">
            📁 一覧
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="btn btn-sm bg-amber-500/80 text-white hover:bg-amber-500 border-0"
            >
              📋 デモ ▾
            </button>
            {showDemoMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[280px] z-50">
                {DEMO_LIST.map(demo => (
                  <button
                    key={demo.id}
                    onClick={() => loadDemo(demo.factory)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={saveToFile} className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0">
            💾 保存
          </button>
          <button onClick={loadFromFile} className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0">
            📂 開く
          </button>
          <button onClick={onOpenAISettings} className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0">
            🤖 AI設定
          </button>
          <button onClick={onOpenTutorial} className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0">
            📚 使い方
          </button>
          <a
            href="https://notebooklm.google.com/notebook/ebb20d9f-0812-494d-807d-bc23486ff6ef"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm bg-purple-500/80 text-white hover:bg-purple-500 border-0 inline-flex items-center"
            title="マニュアル内容についてAIに質問できます（NotebookLM・Googleアカウントログイン要）"
          >
            💬 AI Q&A
          </a>
          {FEEDBACK_FORM_URL && (
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm bg-emerald-500/80 text-white hover:bg-emerald-500 border-0 inline-flex items-center"
              title="ご意見・不具合報告フォーム（別タブで開きます）"
            >
              📝 ご意見
            </a>
          )}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn btn-sm bg-red-500/70 text-white hover:bg-red-500 border-0"
          >
            🔄 リセット
          </button>
        </div>
      </div>

      {/* リセット確認モーダル */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">データをリセットしますか？</h3>
                <p className="text-sm text-gray-500 mt-1">新しいプロジェクトを開始します</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
              現在のプロジェクトデータ（設定・強み棚卸・セグメンテーション・ターゲティング・ポジショニング）が<strong className="text-red-600">すべて削除</strong>されます。この操作は元に戻せません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-sm px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onReset();
                }}
                className="btn btn-sm px-4 py-2 bg-red-600 text-white hover:bg-red-700 border-0 rounded-lg"
              >
                🔄 リセットして新規作成
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

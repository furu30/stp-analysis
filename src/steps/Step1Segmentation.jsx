import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { BTOB_SEGMENTS, BTOC_SEGMENTS } from '../data/defaultData';

const PRIORITIES = [
  { value: 'high', label: '高', color: 'bg-red-100 text-red-700 ring-red-300' },
  { value: 'medium', label: '中', color: 'bg-yellow-100 text-yellow-700 ring-yellow-300' },
  { value: 'low', label: '低', color: 'bg-blue-100 text-blue-700 ring-blue-300' },
];

export default function Step1Segmentation({ onNext, onBack }) {
  const { project, dispatch } = useProject();
  const [showDefinition, setShowDefinition] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const marketType = project.settings.marketType;
  const defaults = marketType === 'btob' ? BTOB_SEGMENTS : BTOC_SEGMENTS;
  const step1 = project.step1;
  const selectedAxes = step1.selectedAxes;
  const segments = step1.segments;

  const toggleAxis = (axisId) => {
    const axis = defaults.find(d => d.id === axisId);
    if (!axis) return;
    const exists = selectedAxes.find(a => a.id === axisId);
    let newAxes;
    if (exists) {
      newAxes = selectedAxes.filter(a => a.id !== axisId);
    } else {
      newAxes = [...selectedAxes, { ...axis, priority: 'medium' }];
    }
    dispatch({ type: 'UPDATE_STEP1', payload: { selectedAxes: newAxes } });
  };

  const setPriority = (axisId, priority) => {
    const newAxes = selectedAxes.map(a =>
      a.id === axisId ? { ...a, priority } : a
    );
    dispatch({ type: 'UPDATE_STEP1', payload: { selectedAxes: newAxes } });
  };

  const addCustomAxis = () => {
    const id = `custom_${Date.now()}`;
    const newAxis = { id, name: '', feature: '', note: '', priority: 'medium', isCustom: true };
    dispatch({ type: 'UPDATE_STEP1', payload: { selectedAxes: [...selectedAxes, newAxis] } });
  };

  const updateCustomAxis = (axisId, field, value) => {
    const newAxes = selectedAxes.map(a =>
      a.id === axisId ? { ...a, [field]: value } : a
    );
    dispatch({ type: 'UPDATE_STEP1', payload: { selectedAxes: newAxes } });
  };

  const addSegment = (axisId) => {
    const current = segments[axisId] || [];
    const newSeg = { id: `seg_${Date.now()}`, name: '', memo: '' };
    dispatch({ type: 'UPDATE_STEP1', payload: { segments: { ...segments, [axisId]: [...current, newSeg] } } });
  };

  const updateSegment = (axisId, segId, field, value) => {
    const current = segments[axisId] || [];
    const updated = current.map(s => s.id === segId ? { ...s, [field]: value } : s);
    dispatch({ type: 'UPDATE_STEP1', payload: { segments: { ...segments, [axisId]: updated } } });
  };

  const removeSegment = (axisId, segId) => {
    const current = segments[axisId] || [];
    dispatch({ type: 'UPDATE_STEP1', payload: { segments: { ...segments, [axisId]: current.filter(s => s.id !== segId) } } });
  };

  if (showDefinition) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">セグメント定義</h2>
            <button onClick={() => setShowDefinition(false)} className="btn-secondary btn-sm">← 切り口選択に戻る</button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            選択した各切り口に対して、具体的なセグメント（グループ）を定義してください。
          </p>

          {selectedAxes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">切り口が選択されていません。前の画面で切り口を選択してください。</p>
          ) : (
            <div className="space-y-6">
              {selectedAxes.map(axis => (
                <div key={axis.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`step-badge ${PRIORITIES.find(p => p.value === axis.priority)?.color}`}>
                      {axis.priority === 'high' ? '高' : axis.priority === 'medium' ? '中' : '低'}
                    </span>
                    <h3 className="font-bold text-gray-800">{axis.name || '(名称未入力)'}</h3>
                  </div>

                  <div className="space-y-2">
                    {(segments[axis.id] || []).map(seg => (
                      <div key={seg.id} className="flex gap-2 items-start bg-gray-50 rounded-lg p-2">
                        <input
                          type="text"
                          className="input-field text-sm flex-1"
                          value={seg.name}
                          onChange={(e) => updateSegment(axis.id, seg.id, 'name', e.target.value)}
                          placeholder="セグメント名（例：大手500人超）"
                        />
                        <textarea
                          className="textarea-field text-xs flex-1"
                          rows={1}
                          value={seg.memo}
                          onChange={(e) => updateSegment(axis.id, seg.id, 'memo', e.target.value)}
                          placeholder="特性メモ（ニーズ・購買行動等）"
                        />
                        <button
                          onClick={() => removeSegment(axis.id, seg.id)}
                          className="text-gray-400 hover:text-danger cursor-pointer text-sm mt-1"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addSegment(axis.id)}
                    className="btn-secondary btn-sm mt-2"
                  >
                    ＋ セグメントを追加
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button onClick={onBack} className="btn-secondary">← 前のステップ</button>
            <button onClick={onNext} className="btn-primary">次へ：ターゲティング（Step 2）→</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title mb-1">Step 1: セグメンテーション</h2>
            <p className="text-sm text-gray-500">
              市場を分類する切り口を選択してください。（{marketType === 'btob' ? 'BtoB' : 'BtoC'}モード）
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={addCustomAxis} className="btn-secondary btn-sm">＋ 独自の切り口を追加</button>
            <button
              onClick={() => setShowDefinition(true)}
              className="btn-accent btn-sm"
              disabled={selectedAxes.length === 0}
            >
              セグメントを定義する →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {defaults.map(item => {
            const isSelected = selectedAxes.some(a => a.id === item.id);
            const selectedAxis = selectedAxes.find(a => a.id === item.id);
            return (
              <div
                key={item.id}
                className={`relative border-2 rounded-lg p-3 transition-all cursor-pointer
                  ${isSelected ? 'border-primary bg-primary-light/30' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => toggleAxis(item.id)}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 accent-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.name}</span>
                      <button
                        className="text-gray-400 hover:text-primary text-xs cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setTooltip(tooltip === item.id ? null : item.id); }}
                      >？</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.feature}</p>
                    {tooltip === item.id && (
                      <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800 border border-amber-200">
                        <strong>注意点：</strong> {item.note}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="flex gap-1 mt-2 ml-6" onClick={e => e.stopPropagation()}>
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setPriority(item.id, p.value)}
                        className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-all
                          ${selectedAxis?.priority === p.value ? p.color + ' ring-1 ring-current' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom axes */}
          {selectedAxes.filter(a => a.isCustom).map(axis => (
            <div key={axis.id} className="border-2 border-primary rounded-lg p-3 bg-primary-light/30">
              <div className="space-y-2">
                <input
                  type="text"
                  className="input-field text-sm"
                  value={axis.name}
                  onChange={(e) => updateCustomAxis(axis.id, 'name', e.target.value)}
                  placeholder="切り口名を入力"
                />
                <input
                  type="text"
                  className="input-field text-xs"
                  value={axis.feature}
                  onChange={(e) => updateCustomAxis(axis.id, 'feature', e.target.value)}
                  placeholder="特徴"
                />
                <div className="flex gap-1">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPriority(axis.id, p.value)}
                      className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer
                        ${axis.priority === p.value ? p.color + ' ring-1 ring-current' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button onClick={onBack} className="btn-secondary">← 前のステップ</button>
          <button
            onClick={() => setShowDefinition(true)}
            className="btn-primary"
            disabled={selectedAxes.length === 0}
          >
            セグメントを定義する →
          </button>
        </div>
      </div>
    </div>
  );
}

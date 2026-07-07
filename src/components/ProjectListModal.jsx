import { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

export default function ProjectListModal({ onClose, onSwitchProject }) {
  const { project, getProjectList, loadProjectFromList, deleteProjectFromList, duplicateProject, saveProjectToList } = useProject();
  const [list, setList] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    setList(getProjectList());
  }, [getProjectList]);

  const refresh = () => setList(getProjectList());

  const handleSave = () => {
    saveProjectToList();
    refresh();
  };

  const handleLoad = (id) => {
    if (loadProjectFromList(id)) {
      onSwitchProject?.();
      onClose();
    }
  };

  const handleDuplicate = (id) => {
    duplicateProject(id);
    refresh();
  };

  const handleDelete = (id) => {
    deleteProjectFromList(id);
    setDeleteConfirm(null);
    refresh();
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">プロジェクト一覧</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="btn-primary btn-sm">
              💾 現在のプロジェクトを保存
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer">×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {list.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-sm">保存されたプロジェクトはありません</p>
              <p className="text-xs mt-1">「現在のプロジェクトを保存」ボタンで保存できます</p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map(item => {
                const isCurrent = project._projectId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 transition-all ${isCurrent ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full shrink-0">編集中</span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${item.marketType === 'btob' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>
                            {item.marketType === 'btob' ? 'BtoB' : 'BtoC'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          {item.companyName && <span>{item.companyName}</span>}
                          <span>更新: {formatDate(item.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-3 shrink-0">
                        {!isCurrent && (
                          <button onClick={() => handleLoad(item.id)} className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                            開く
                          </button>
                        )}
                        <button onClick={() => handleDuplicate(item.id)} className="btn btn-sm bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">
                          複製
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(item.id)} className="btn btn-sm bg-red-500 text-white hover:bg-red-600 border-0">
                              削除
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                              戻す
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(item.id)} className="btn btn-sm bg-gray-50 text-red-400 hover:bg-red-50 hover:text-red-600 border border-gray-200">
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-400 text-center">
            プロジェクトはブラウザのlocalStorageに保存されます。ブラウザデータを消去すると削除されます。
          </p>
        </div>
      </div>
    </div>
  );
}

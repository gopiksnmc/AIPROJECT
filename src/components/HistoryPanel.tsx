import { History, Trash2, Clock } from 'lucide-react';
import { OCRConversion } from '../lib/supabase';

interface HistoryPanelProps {
  conversions: OCRConversion[];
  onSelect: (conversion: OCRConversion) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export default function HistoryPanel({ conversions, onSelect, onDelete, isLoading }: HistoryPanelProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">History</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : conversions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No conversions yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {conversions.map((conversion) => (
            <div
              key={conversion.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer group"
              onClick={() => onSelect(conversion)}
            >
              <div className="flex gap-3">
                <img
                  src={conversion.image_url}
                  alt="Thumbnail"
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {conversion.edited_text || conversion.extracted_text || 'No text'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(conversion.created_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conversion.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

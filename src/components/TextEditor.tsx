import { Copy, Download, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TextEditorProps {
  extractedText: string;
  onSave: (editedText: string) => void;
  isSaving: boolean;
}

export default function TextEditor({ extractedText, onSave, isSaving }: TextEditorProps) {
  const [text, setText] = useState(extractedText);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(extractedText);
  }, [extractedText]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Extracted Text</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={() => onSave(text)}
            disabled={isSaving || text === extractedText}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-96 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
        placeholder="Extracted text will appear here..."
      />
      <p className="text-xs text-gray-500 mt-2">
        Edit the text above and click Save to store your changes
      </p>
    </div>
  );
}

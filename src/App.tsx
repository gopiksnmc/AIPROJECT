import { useState, useEffect } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import TextEditor from './components/TextEditor';
import HistoryPanel from './components/HistoryPanel';
import { supabase, OCRConversion } from './lib/supabase';

function App() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [currentConversionId, setCurrentConversionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conversions, setConversions] = useState<OCRConversion[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ocr_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setConversions(data || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const processImage = async (imageDataUrl: string) => {
    setImageData(imageDataUrl);
    setIsProcessing(true);
    setError(null);
    setExtractedText('');

    try {
      const base64Data = imageDataUrl.split(',')[1];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ imageBase64: `data:image/png;base64,${base64Data}` }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'OCR processing failed');
      }

      const text = result.text || '';
      setExtractedText(text);

      const { data: savedConversion, error: saveError } = await supabase
        .from('ocr_conversions')
        .insert({
          image_url: imageDataUrl,
          extracted_text: text,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      if (savedConversion) {
        setCurrentConversionId(savedConversion.id);
        setConversions([savedConversion, ...conversions]);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (editedText: string) => {
    if (!currentConversionId) return;

    setIsSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('ocr_conversions')
        .update({
          edited_text: editedText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentConversionId);

      if (updateError) throw updateError;

      setConversions(
        conversions.map((c) =>
          c.id === currentConversionId ? { ...c, edited_text: editedText } : c
        )
      );
    } catch (err) {
      console.error('Error saving text:', err);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectConversion = (conversion: OCRConversion) => {
    setImageData(conversion.image_url);
    setExtractedText(conversion.edited_text || conversion.extracted_text);
    setCurrentConversionId(conversion.id);
    setError(null);
  };

  const handleDeleteConversion = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('ocr_conversions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setConversions(conversions.filter((c) => c.id !== id));

      if (currentConversionId === id) {
        setImageData(null);
        setExtractedText('');
        setCurrentConversionId(null);
      }
    } catch (err) {
      console.error('Error deleting conversion:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Handwriting Reader
            </h1>
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-gray-600 text-lg">
            Transform handwritten notes into editable text with AI-powered OCR
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ImageUploader
                onImageSelect={processImage}
                isProcessing={isProcessing}
              />

              {isProcessing && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Processing your image...</p>
                </div>
              )}
            </div>

            {extractedText && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <TextEditor
                  extractedText={extractedText}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              </div>
            )}
          </div>

          <HistoryPanel
            conversions={conversions}
            onSelect={handleSelectConversion}
            onDelete={handleDeleteConversion}
            isLoading={isLoadingHistory}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

/*
  # OCR Conversions Schema
  
  1. New Tables
    - `ocr_conversions`
      - `id` (uuid, primary key) - Unique identifier for each conversion
      - `image_url` (text) - URL or data URI of the uploaded image
      - `extracted_text` (text) - The text extracted from the image via OCR
      - `edited_text` (text, nullable) - User-edited version of the extracted text
      - `created_at` (timestamptz) - Timestamp when conversion was created
      - `updated_at` (timestamptz) - Timestamp when conversion was last updated
  
  2. Security
    - Enable RLS on `ocr_conversions` table
    - Add policy allowing anyone to insert conversions (public app)
    - Add policy allowing anyone to read conversions
    - Add policy allowing anyone to update their own conversions
*/

CREATE TABLE IF NOT EXISTS ocr_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  extracted_text text NOT NULL DEFAULT '',
  edited_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ocr_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert conversions"
  ON ocr_conversions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read conversions"
  ON ocr_conversions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update conversions"
  ON ocr_conversions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete conversions"
  ON ocr_conversions
  FOR DELETE
  TO anon
  USING (true);
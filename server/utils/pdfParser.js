import pdf from 'pdf-parse';

/**
 * Extract raw text from PDF buffer.
 * @param {Buffer} buffer File buffer from Multer.
 * @returns {Promise<string>} Extracted text.
 */
export const parsePdf = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parser error:', error);
    throw new Error('Failed to parse PDF. Ensure the file is not corrupted.');
  }
};

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

class RAGService {
  constructor() {
    this.chunkSize = 1000; // Characters per chunk
    this.chunkOverlap = 200; // Overlap between chunks
  }

  // Process uploaded document
  async processDocument(filePath, fileType) {
    try {
      let content = '';
      let metadata = {};

      switch (fileType) {
        case 'pdf':
          const pdfBuffer = await fs.readFile(filePath);
          const pdfData = await pdfParse(pdfBuffer);
          content = pdfData.text;
          metadata = {
            pageCount: pdfData.numpages,
            title: pdfData.info?.Title || '',
            author: pdfData.info?.Author || '',
            subject: pdfData.info?.Subject || ''
          };
          break;

        case 'docx':
          const docxBuffer = await fs.readFile(filePath);
          const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
          content = docxResult.value;
          metadata = {
            pageCount: null, // DOCX doesn't have page count
            title: '',
            author: '',
            subject: ''
          };
          break;

        case 'doc':
          // For .doc files, we'd need a different library like antiword
          // For now, we'll throw an error
          throw new Error('DOC files are not supported yet. Please convert to DOCX or PDF.');

        case 'txt':
          content = await fs.readFile(filePath, 'utf-8');
          metadata = {
            pageCount: null,
            title: path.basename(filePath, '.txt'),
            author: '',
            subject: ''
          };
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Clean and normalize content
      content = this.cleanContent(content);

      // Generate chunks
      const chunks = this.generateChunks(content);

      // Generate embeddings for chunks (placeholder - would use actual embedding model)
      const chunksWithEmbeddings = await this.generateEmbeddings(chunks);

      return {
        content,
        chunks: chunksWithEmbeddings,
        metadata: {
          ...metadata,
          wordCount: this.countWords(content),
          characterCount: content.length,
          chunkCount: chunks.length
        }
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  // Clean and normalize content
  cleanContent(content) {
    return content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
  }

  // Generate chunks from content
  generateChunks(content) {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + this.chunkSize, content.length);
      
      // Try to find a good break point (sentence end, paragraph break, etc.)
      let actualEndIndex = this.findGoodBreakPoint(content, startIndex, endIndex);
      
      const chunk = content.substring(startIndex, actualEndIndex).trim();
      
      if (chunk.length > 0) {
        chunks.push({
          content: chunk,
          metadata: {
            startIndex,
            endIndex: actualEndIndex,
            chunkIndex: chunks.length
          }
        });
      }

      // Move to next chunk with overlap
      startIndex = Math.max(actualEndIndex - this.chunkOverlap, startIndex + 1);
    }

    return chunks;
  }

  // Find a good break point for chunking
  findGoodBreakPoint(content, startIndex, endIndex) {
    // Prefer breaking at sentence endings
    const sentenceEndings = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
    
    for (let i = endIndex; i > startIndex; i--) {
      for (const ending of sentenceEndings) {
        if (content.substring(i - ending.length, i) === ending) {
          return i;
        }
      }
    }

    // If no sentence ending found, try paragraph breaks
    const paragraphBreaks = ['\n\n', '\r\n\r\n'];
    for (let i = endIndex; i > startIndex; i--) {
      for (const break_ of paragraphBreaks) {
        if (content.substring(i - break_.length, i) === break_) {
          return i;
        }
      }
    }

    // If no good break point found, return the original end index
    return endIndex;
  }

  // Generate embeddings for chunks (placeholder implementation)
  async generateEmbeddings(chunks) {
    // In a real implementation, you would:
    // 1. Use a sentence transformer model (e.g., all-MiniLM-L6-v2)
    // 2. Generate embeddings for each chunk
    // 3. Store embeddings in a vector database
    
    // For now, we'll create placeholder embeddings
    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: this.generatePlaceholderEmbedding(chunk.content, index)
    }));
  }

  // Generate placeholder embedding (replace with actual embedding model)
  generatePlaceholderEmbedding(content, index) {
    // This is a placeholder - in reality, you'd use a proper embedding model
    const vector = new Array(384).fill(0); // 384-dimensional vector
    
    // Simple hash-based placeholder embedding
    for (let i = 0; i < content.length; i++) {
      const charCode = content.charCodeAt(i);
      vector[i % 384] += charCode * (index + 1);
    }
    
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }

  // Search for relevant chunks
  async searchChunks(query, chunks, limit = 5) {
    try {
      // Generate embedding for query
      const queryEmbedding = this.generatePlaceholderEmbedding(query, 0);
      
      // Calculate similarities
      const similarities = chunks.map((chunk, index) => ({
        chunk,
        similarity: this.calculateCosineSimilarity(queryEmbedding, chunk.embedding),
        index
      }));
      
      // Sort by similarity and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => ({
          content: item.chunk.content,
          similarity: item.similarity,
          metadata: item.chunk.metadata
        }));
    } catch (error) {
      console.error('Chunk search error:', error);
      throw new Error(`Failed to search chunks: ${error.message}`);
    }
  }

  // Calculate cosine similarity between two vectors
  calculateCosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return isNaN(similarity) ? 0 : similarity;
  }

  // Count words in text
  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // Build RAG context from relevant chunks
  buildRAGContext(relevantChunks, query) {
    if (!relevantChunks || relevantChunks.length === 0) {
      return '';
    }

    let context = 'Based on the following information:\n\n';
    
    relevantChunks.forEach((chunk, index) => {
      context += `[Source ${index + 1}]: ${chunk.content}\n\n`;
    });
    
    context += `Please answer the following question using the information above: ${query}`;
    
    return context;
  }

  // Update chunk embeddings (for when documents are re-processed)
  async updateChunkEmbeddings(chunks) {
    return await this.generateEmbeddings(chunks);
  }

  // Get chunk statistics
  getChunkStatistics(chunks) {
    return {
      totalChunks: chunks.length,
      averageChunkSize: chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) / chunks.length,
      totalCharacters: chunks.reduce((sum, chunk) => sum + chunk.content.length, 0),
      chunkSizeRange: {
        min: Math.min(...chunks.map(chunk => chunk.content.length)),
        max: Math.max(...chunks.map(chunk => chunk.content.length))
      }
    };
  }
}

module.exports = new RAGService();

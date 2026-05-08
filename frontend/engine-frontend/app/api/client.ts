const API_BASE_URL = 'http://127.0.0.1:8000';

export interface AnalyzeRequest {
  usecase: 'rugpull' | 'sybil';
  file: File;
  token_contract: string;
  start_date?: string;
  end_date?: string;
}

export interface AnalyzeResponse {
  [key: string]: any;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function analyzeRugpull(
  file: File,
  tokenContract: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyzeResponse> {
  return analyze({
    usecase: 'rugpull',
    file,
    token_contract: tokenContract,
    start_date: startDate,
    end_date: endDate,
  });
}

export async function analyzeSybil(
  file: File,
  tokenContract: string
): Promise<AnalyzeResponse> {
  return analyze({
    usecase: 'sybil',
    file,
    token_contract: tokenContract,
  });
}

async function analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const formData = new FormData();

  formData.append('usecase', request.usecase);
  formData.append('file', request.file);
  formData.append('token_contract', request.token_contract);

  if (request.start_date) {
    formData.append('start_date', request.start_date);
  }
  if (request.end_date) {
    formData.append('end_date', request.end_date);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorDetails: any;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = { message: response.statusText };
      }

      throw new ApiError(
        response.status,
        errorDetails.detail || errorDetails.message || 'Analysis failed',
        errorDetails
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ApiError(
        0,
        `Network error: ${error.message}`,
        error
      );
    }

    throw new ApiError(0, 'Unknown error occurred');
  }
}

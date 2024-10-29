export interface ResultData {
  success: boolean;
  msg: string;
  data?: any;
}

export interface ProcessResult {
  status: { total: number; success: number; failed: number };
  undone: string[];
}

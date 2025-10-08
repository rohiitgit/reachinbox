export enum EmailCategory {
  INTERESTED = 'Interested',
  MEETING_BOOKED = 'Meeting Booked',
  NOT_INTERESTED = 'Not Interested',
  SPAM = 'Spam',
  OUT_OF_OFFICE = 'Out of Office',
  UNCATEGORIZED = 'Uncategorized'
}

export interface Email {
  id: string;
  accountId: string;
  folder: string;
  from: {
    name?: string;
    address: string;
  };
  to: Array<{
    name?: string;
    address: string;
  }>;
  subject: string;
  body: string;
  html?: string;
  date: string;
  uid: number;
  category?: EmailCategory;
  suggestedReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  q?: string;
  accountId?: string;
  folder?: string;
  category?: EmailCategory;
  from?: number;
  size?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

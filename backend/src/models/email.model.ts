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
  date: Date;
  uid: number;
  category?: EmailCategory;
  suggestedReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImapConfig {
  id: string;
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
  tlsOptions?: any;
}

export interface SearchQuery {
  query?: string;
  accountId?: string;
  folder?: string;
  category?: EmailCategory;
  from?: number;
  size?: number;
}

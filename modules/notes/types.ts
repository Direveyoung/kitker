export type Note = {
  id: string;
  title: string | null;
  body: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

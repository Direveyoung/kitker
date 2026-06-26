export type Block =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; type: "todo"; text: string; checked: boolean }
  | { id: string; type: "quote"; text: string }
  | { id: string; type: "code"; text: string }
  | { id: string; type: "divider" };

export type PageNode = {
  id: string;
  title: string;
  icon: string | null;
  hasTodo: boolean;
  hasSchedule: boolean;
  children: PageNode[];
};

export type PageDetail = {
  id: string;
  parentId: string | null;
  title: string;
  icon: string | null;
  blocks: Block[];
  hasTodo: boolean;
  hasSchedule: boolean;
  updatedAt: string;
};

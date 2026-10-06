export const COMMENT_NAME_LIMIT = 80;
export const COMMENT_TEXT_LIMIT = 2000;

export type ReaderComment = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  likes: number;
  liked: boolean;
};

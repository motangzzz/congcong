/** 用户资料 */
export type User = {
  id: string;
  nickname: string;
  avatar: string;
  created_at: string;
  last_seen_at: string;
};

/** 留言 */
export type Message = {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  /** 留言者信息（联表查询） */
  user?: User;
  /** 点赞数 */
  likes_count?: number;
  /** 当前用户是否已点赞 */
  is_liked?: boolean;
  /** 回复列表 */
  replies?: Message[];
};

/** 点赞记录 */
export type Like = {
  id: string;
  user_id: string;
  message_id: string;
  created_at: string;
};

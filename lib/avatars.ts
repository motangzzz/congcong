/** 头像预设 - 各种搞怪表情和动物 */
export const AVATARS = [
  { emoji: "😂", name: "笑哭了" },
  { emoji: "🤣", name: "笑死" },
  { emoji: "😎", name: "墨镜酷哥" },
  { emoji: "🫠", name: "热化了" },
  { emoji: "🥹", name: "感动哭了" },
  { emoji: "🤪", name: "疯疯癫癫" },
  { emoji: "😈", name: "小恶魔" },
  { emoji: "👻", name: "幽灵" },
  { emoji: "🤡", name: "小丑" },
  { emoji: "🐶", name: "修狗" },
  { emoji: "🐱", name: "猫猫" },
  { emoji: "🐸", name: "青蛙" },
  { emoji: "🦊", name: "狐狸" },
  { emoji: "🐼", name: "熊猫" },
  { emoji: "🐷", name: "猪猪" },
  { emoji: "🦄", name: "独角兽" },
  { emoji: "🐧", name: "企鹅" },
  { emoji: "🐮", name: "奶牛" },
  { emoji: "🍊", name: "橘子" },
  { emoji: "🌚", name: "坏笑月亮" },
  { emoji: "💩", name: "便便" },
  { emoji: "👽", name: "外星人" },
  { emoji: "🤖", name: "机器人" },
  { emoji: "👾", name: "小怪兽" },
];

/** 随机选一个头像 */
export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)].emoji;
}

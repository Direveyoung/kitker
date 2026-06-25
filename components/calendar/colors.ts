import type { PetalColor } from "@/lib/calendar/types";

// 리터럴 클래스 문자열(테일윈드 스캐너 인식). petal 토큰은 globals.css @theme에 정의됨.
export const EVENT_CLASSES: Record<
  PetalColor,
  { chip: string; dot: string; block: string }
> = {
  yellow: {
    chip: "bg-petal-yellow-bg text-petal-yellow-text",
    dot: "bg-petal-yellow-accent",
    block: "bg-petal-yellow-bg text-petal-yellow-text border-l-2 border-petal-yellow-accent",
  },
  pink: {
    chip: "bg-petal-pink-bg text-petal-pink-text",
    dot: "bg-petal-pink-accent",
    block: "bg-petal-pink-bg text-petal-pink-text border-l-2 border-petal-pink-accent",
  },
  purple: {
    chip: "bg-petal-purple-bg text-petal-purple-text",
    dot: "bg-petal-purple-accent",
    block: "bg-petal-purple-bg text-petal-purple-text border-l-2 border-petal-purple-accent",
  },
  blue: {
    chip: "bg-petal-blue-bg text-petal-blue-text",
    dot: "bg-petal-blue-accent",
    block: "bg-petal-blue-bg text-petal-blue-text border-l-2 border-petal-blue-accent",
  },
};

export const DOT_CLASSES: Record<PetalColor, string> = {
  yellow: "bg-petal-yellow-accent",
  pink: "bg-petal-pink-accent",
  purple: "bg-petal-purple-accent",
  blue: "bg-petal-blue-accent",
};

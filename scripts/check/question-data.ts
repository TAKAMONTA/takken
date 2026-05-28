import { Question } from "../../lib/types/quiz";
import { houreiQuestions } from "../../lib/data/questions/hourei";
import { minpouQuestions } from "../../lib/data/questions/minpou";
import { takkengyouhouQuestions } from "../../lib/data/questions/takkengyouhou";
import { zeihouQuestions } from "../../lib/data/questions/zeihou";

export const questionSets: Record<string, Question[]> = {
  takkengyouhou: takkengyouhouQuestions,
  minpou: minpouQuestions,
  hourei: houreiQuestions,
  zeihou: zeihouQuestions,
};

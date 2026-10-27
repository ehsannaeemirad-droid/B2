/** Shared content types. Lesson content is data — nothing lesson-specific lives in components. */

export type Token = {
  /** Exactly as it appears in `en`, including punctuation if attached. */
  surface: string;
  /** Key into dictionary.json; undefined = punctuation/space-only token. */
  lemma?: string;
  /** True for multi-word units like "give up". */
  isPhrase?: boolean;
  /** Optional grammar note, e.g. "سوم‌شخص مفرد". */
  inflectionFa?: string;
  /** Marks conjugated present-simple verbs and *be* forms for the "Show the verbs" toggle. */
  presentSimple?: boolean;
};

export type Sentence = {
  id: string;
  /** Full English sentence. */
  en: string;
  /** Full natural Farsi translation. */
  fa: string;
  /** Ordered tokens covering the sentence exactly. */
  tokens: Token[];
  audioText?: string;
};

export type ReadingChunk = {
  id: string;
  heading: string;
  sentences: Sentence[];
};

export type VocabCard = {
  en: string;
  fa: string;
  pos: string;
  example: string;
  exampleFa: string;
};

export type Question = {
  id: string;
  type: "mcq" | "truefalse";
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  explanationFa: string;
  /** Optional id of the sentence that answers this question (for "Show me where"). */
  sourceSentence?: string;
};

export type DiscussionPrompt = {
  id: string;
  en: string;
  fa: string;
  frame: string;
  frameFa: string;
};

export type RetellingKeyWord = {
  en: string;
  fa: string;
};

export type Retelling = {
  prompt: string;
  keyWords: RetellingKeyWord[];
};

export type AskTeacher = {
  prompt: string;
  helper: string;
};

export type Lesson = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  level: "A1";
  grammarFocus: string[];
  estimatedMinutes: number;
  vocabulary: VocabCard[];
  reading: { chunks: ReadingChunk[] };
  comprehension: Question[];
  discussion: DiscussionPrompt[];
  retelling: Retelling;
  askTeacher: AskTeacher;
};

export type DictEntry = {
  lemma: string;
  fa: string;
  pos: string;
  forms?: string[];
  note?: string;
  def?: string;
  inflectionFa?: string;
};

export type Dictionary = DictEntry[];

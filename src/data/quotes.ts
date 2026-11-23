export const CATEGORIES = [
  "motivation",
  "creativity",
  "happiness",
  "confidence",
  "relaxation",
  "humour",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryChoice = Category | "random";

export type Quote = {
  id: string;
  text: string;
  author: string;
  /** Where the quote comes from, included only when well documented. */
  source?: string;
  category: Category;
};

type Raw = Omit<Quote, "id" | "category">;

const motivation: Raw[] = [
  {
    text: "Well done is better than well said.",
    author: "Benjamin Franklin",
    source: "Poor Richard's Almanack, 1737",
  },
  {
    text: "I'm not afraid of storms, for I'm learning how to sail my ship.",
    author: "Louisa May Alcott",
    source: "Little Women, 1868",
  },
  {
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "Oliver Goldsmith",
    source: "The Citizen of the World, 1762",
  },
  {
    text: "Great works are performed not by strength but by perseverance.",
    author: "Samuel Johnson",
    source: "Rasselas, 1759",
  },
  {
    text: "Genius is one per cent inspiration, ninety-nine per cent perspiration.",
    author: "Thomas Edison",
    source: "Quoted in Harper's Monthly, 1932",
  },
  { text: "Fall seven times, stand up eight.", author: "Japanese proverb" },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    source: "Tao Te Ching, ch. 64",
  },
  {
    text: "The best way out is always through.",
    author: "Robert Frost",
    source: "A Servant to Servants, 1914",
  },
  {
    text: "Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.",
    author: "Samuel Beckett",
    source: "Worstward Ho, 1983",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    source: "An Autobiography, 1913 (quoting Squire Bill Widener)",
  },
  {
    text: "Begin at once to live, and count each separate day as a separate life.",
    author: "Seneca",
    source: "Letters to Lucilius, Letter 101",
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 10",
  },
  {
    text: "Nothing in this world is worth having or worth doing unless it means effort, pain, difficulty.",
    author: "Theodore Roosevelt",
    source: "Labor Day speech, Syracuse, 1903",
  },
];

const creativity: Raw[] = [
  {
    text: "You can't use up creativity. The more you use, the more you have.",
    author: "Maya Angelou",
  },
  { text: "Have no fear of perfection—you'll never reach it.", author: "Salvador Dalí" },
  {
    text: "Imagination is more important than knowledge.",
    author: "Albert Einstein",
    source: "The Saturday Evening Post, 1929",
  },
  {
    text: "Creativity is allowing yourself to make mistakes. Art is knowing which ones to keep.",
    author: "Scott Adams",
    source: "The Dilbert Principle, 1996",
  },
  {
    text: "An idea that is not dangerous is unworthy of being called an idea at all.",
    author: "Oscar Wilde",
    source: "The Critic as Artist, 1891",
  },
  {
    text: "The worst enemy to creativity is self-doubt.",
    author: "Sylvia Plath",
    source: "The Unabridged Journals",
  },
  {
    text: "If you hear a voice within you say 'you cannot paint,' then by all means paint, and that voice will be silenced.",
    author: "Vincent van Gogh",
    source: "Letter to Theo, 1883",
  },
  {
    text: "Great things are not done by impulse, but by a series of small things brought together.",
    author: "Vincent van Gogh",
    source: "Letter to Theo, 1882",
  },
  {
    text: "Imagination is the beginning of creation.",
    author: "George Bernard Shaw",
    source: "Back to Methuselah, 1921",
  },
  {
    text: "Art enables us to find ourselves and lose ourselves at the same time.",
    author: "Thomas Merton",
    source: "No Man Is an Island, 1955",
  },
  {
    text: "Creativity is a habit, and the best creativity is the result of good work habits.",
    author: "Twyla Tharp",
    source: "The Creative Habit, 2003",
  },
  {
    text: "Curiosity about life in all of its aspects, I think, is still the secret of great creative people.",
    author: "Leo Burnett",
  },
  {
    text: "You've got to jump off cliffs all the time and build your wings on the way down.",
    author: "Ray Bradbury",
  },
];

const happiness: Raw[] = [
  {
    text: "Happiness is a warm puppy.",
    author: "Charles M. Schulz",
    source: "Happiness Is a Warm Puppy, 1962",
  },
  { text: "Happiness is not a goal; it is a by-product.", author: "Eleanor Roosevelt" },
  {
    text: "The most wasted of all days is one without laughter.",
    author: "Nicolas Chamfort",
    source: "Maximes et pensées, 1795",
  },
  { text: "Joy is the simplest form of gratitude.", author: "Karl Barth" },
  {
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 7",
  },
  {
    text: "There is no duty we so much underrate as the duty of being happy.",
    author: "Robert Louis Stevenson",
    source: "An Apology for Idlers, 1877",
  },
  { text: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
  { text: "Laughter is the shortest distance between two people.", author: "Victor Borge" },
  {
    text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thich Nhat Hanh",
  },
  {
    text: "Let us be grateful to the people who make us happy; they are the charming gardeners who make our souls blossom.",
    author: "Marcel Proust",
  },
  {
    text: "A merry heart doeth good like a medicine.",
    author: "Proverbs 17:22",
    source: "King James Bible",
  },
  {
    text: "Action may not always bring happiness, but there is no happiness without action.",
    author: "Benjamin Disraeli",
    source: "Lothair, 1870",
  },
];

const confidence: Raw[] = [
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  {
    text: "Trust thyself: every heart vibrates to that iron string.",
    author: "Ralph Waldo Emerson",
    source: "Self-Reliance, 1841",
  },
  { text: "Whether you think you can, or you think you can't—you're right.", author: "Henry Ford" },
  {
    text: "Courage is grace under pressure.",
    author: "Ernest Hemingway",
    source: "Quoted in The New Yorker, 1929",
  },
  {
    text: "You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face.",
    author: "Eleanor Roosevelt",
    source: "You Learn by Living, 1960",
  },
  {
    text: "Self-trust is the first secret of success.",
    author: "Ralph Waldo Emerson",
    source: "Society and Solitude, 1870",
  },
  { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  {
    text: "As soon as you trust yourself, you will know how to live.",
    author: "Johann Wolfgang von Goethe",
    source: "Faust, Part One, 1808",
  },
  {
    text: "Do one thing every day that scares you.",
    author: "Mary Schmich",
    source: "Chicago Tribune, 1997",
  },
  {
    text: "I have learned over the years that when one's mind is made up, this diminishes fear.",
    author: "Rosa Parks",
    source: "Quiet Strength, 1994",
  },
  {
    text: "Optimism is the faith that leads to achievement.",
    author: "Helen Keller",
    source: "Optimism, 1903",
  },
  {
    text: "Life shrinks or expands in proportion to one's courage.",
    author: "Anaïs Nin",
    source: "The Diary of Anaïs Nin, Vol. 3",
  },
];

const relaxation: Raw[] = [
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    source: "TED Talk, 2017",
  },
  { text: "Rest is not idleness.", author: "John Lubbock", source: "The Use of Life, 1894" },
  {
    text: "Adopt the pace of nature: her secret is patience.",
    author: "Ralph Waldo Emerson",
    source: "Education",
  },
  {
    text: "Within you there is a stillness and a sanctuary to which you can retreat at any time and be yourself.",
    author: "Hermann Hesse",
    source: "Siddhartha, 1922",
  },
  {
    text: "Breath is the bridge which connects life to consciousness, which unites your body to your thoughts.",
    author: "Thich Nhat Hanh",
    source: "The Miracle of Mindfulness, 1975",
  },
  {
    text: "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.",
    author: "Etty Hillesum",
    source: "An Interrupted Life",
  },
  {
    text: "Take rest; a field that has rested gives a bountiful crop.",
    author: "Ovid",
    source: "Ars Amatoria",
  },
  { text: "For fast-acting relief, try slowing down.", author: "Lily Tomlin" },
  { text: "The time to relax is when you don't have time for it.", author: "Sydney J. Harris" },
  {
    text: "If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 8",
  },
  {
    text: "Our life is frittered away by detail. Simplify, simplify.",
    author: "Henry David Thoreau",
    source: "Walden, 1854",
  },
  {
    text: "Keep calm and carry on.",
    author: "UK Ministry of Information",
    source: "Wartime poster, 1939",
  },
];

const humour: Raw[] = [
  {
    text: "I am so clever that sometimes I don't understand a single word of what I am saying.",
    author: "Oscar Wilde",
    source: "The Remarkable Rocket, 1888",
  },
  {
    text: "I can resist everything except temptation.",
    author: "Oscar Wilde",
    source: "Lady Windermere's Fan, 1892",
  },
  {
    text: "The report of my death was an exaggeration.",
    author: "Mark Twain",
    source: "New York Journal, 1897",
  },
  {
    text: "Please accept my resignation. I don't want to belong to any club that will accept me as a member.",
    author: "Groucho Marx",
    source: "Groucho and Me, 1959",
  },
  {
    text: "The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it.",
    author: "Terry Pratchett",
    source: "Diggers, 1990",
  },
  {
    text: "I love deadlines. I like the whooshing sound they make as they fly by.",
    author: "Douglas Adams",
    source: "The Salmon of Doubt, 2002",
  },
  {
    text: "The ships hung in the sky in much the same way that bricks don't.",
    author: "Douglas Adams",
    source: "The Hitchhiker's Guide to the Galaxy, 1979",
  },
  {
    text: "A day without sunshine is like, you know, night.",
    author: "Steve Martin",
    source: "A Wild and Crazy Guy, 1978",
  },
  {
    text: "I'm not young enough to know everything.",
    author: "J. M. Barrie",
    source: "The Admirable Crichton, 1902",
  },
  {
    text: "There is no sunrise so beautiful that it is worth waking me up to see it.",
    author: "Mindy Kaling",
    source: "Is Everyone Hanging Out Without Me?, 2011",
  },
  {
    text: "Laugh and the world laughs with you; snore and you sleep alone.",
    author: "Anthony Burgess",
    source: "Inside Mr. Enderby, 1963",
  },
  {
    text: "Common sense is not so common.",
    author: "Voltaire",
    source: "Dictionnaire philosophique, 1764",
  },
  { text: "I intend to live forever. So far, so good.", author: "Steven Wright" },
];

const PREFIX: Record<Category, string> = {
  motivation: "mot",
  creativity: "cre",
  happiness: "hap",
  confidence: "con",
  relaxation: "rel",
  humour: "hum",
};

function tag(category: Category, list: Raw[]): Quote[] {
  return list.map((q, i) => ({
    ...q,
    id: `${PREFIX[category]}-${String(i + 1).padStart(2, "0")}`,
    category,
  }));
}

export const QUOTES: Quote[] = [
  ...tag("motivation", motivation),
  ...tag("creativity", creativity),
  ...tag("happiness", happiness),
  ...tag("confidence", confidence),
  ...tag("relaxation", relaxation),
  ...tag("humour", humour),
];

export const QUOTES_BY_ID = new Map(QUOTES.map((q) => [q.id, q]));

export function quotesFor(choice: CategoryChoice): Quote[] {
  return choice === "random" ? QUOTES : QUOTES.filter((q) => q.category === choice);
}

export interface Quote {
  text: string;
  author: string;
}

export const DAILY_QUOTES: Quote[] = [
  { text: "We have not at all a short time to live, but we lose a good deal of it.", author: "Seneca" },
  { text: "Do not act as if you had ten thousand years to live.", author: "Marcus Aurelius" },
  { text: "It is not that we have a short time to live, but that we waste much of it.", author: "Seneca" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "You act like mortals in all that you fear, and like immortals in all that you desire.", author: "Seneca" },
  { text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy" },
  { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
  { text: "Remember that you are mortal.", author: "Memento Mori" },
  { text: "Enjoy the little things, for one day you may look back and realize they were the big things.", author: "Robert Brault" },
  { text: "The trouble is, you think you have time.", author: "Jack Kornfield" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Every day is a new life to a wise man.", author: "Seneca" },
  { text: "Death is not the opposite of life, but a part of it.", author: "Haruki Murakami" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "Stop acting as if life is a rehearsal. Live this day as if it were your last.", author: "Wayne Dyer" },
  { text: "The value of life is not in its duration, but in its donation.", author: "Myles Munroe" },
  { text: "Life is what happens while you are making other plans.", author: "John Lennon" },
  { text: "Only the dead have seen the end of war.", author: "Plato" },
  { text: "A man who dares to waste one hour of time has not discovered the value of life.", author: "Charles Darwin" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
  { text: "Very little is needed to make a happy life; it is all within yourself.", author: "Marcus Aurelius" },
  { text: "Life is short, and it is up to you to make it sweet.", author: "Sarah Louise Delany" },
  { text: "One day or day one. It's your choice.", author: "Unknown" },
  { text: "If you love life, don't waste time, for time is what life is made up of.", author: "Bruce Lee" },
  { text: "Life moves pretty fast. If you don't stop and look around once in a while, you could miss it.", author: "Ferris Bueller" },
  { text: "The shorter the life, the more we must live it.", author: "Unknown" },
  { text: "Seize the day, put no trust in the tomorrow.", author: "Horace" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The goal of life is living in agreement with nature.", author: "Zeno of Citium" }
];

export function getQuoteOfDay(): Quote {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

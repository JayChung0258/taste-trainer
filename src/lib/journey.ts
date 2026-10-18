import { getCollection } from 'astro:content';

export const questionHref = (id: string) => `/q/${id}/`;

// Chapters and their questions in journey order.
export async function getJourney() {
  const [chapters, questions] = await Promise.all([getCollection('chapters'), getCollection('questions')]);

  return chapters
    .sort((a, b) => a.data.order - b.data.order)
    .map((chapter) => ({
      ...chapter,
      questions: questions
        .filter((q) => q.data.chapter.id === chapter.id)
        .sort((a, b) => a.data.order - b.data.order),
    }));
}

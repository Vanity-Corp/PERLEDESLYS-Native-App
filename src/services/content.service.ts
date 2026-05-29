import { mockCategories, mockContent } from '@/mocks/content.mock';
import { mockRequest, paginate } from '@/mocks/mock-api';
import type { ContentItem } from '@/types/domain';
import { ApiError } from '@/utils/api-error';

export type ContentFilters = { categoryId?: string; query?: string; premiumOnly?: boolean; page?: number; pageSize?: number };

function filterContent(filters: ContentFilters) {
  const query = filters.query?.trim().toLowerCase();
  return mockContent.filter((item) => {
    const matchesCategory = !filters.categoryId || item.categoryId === filters.categoryId;
    const matchesPremium = !filters.premiumOnly || item.isPremium;
    const matchesQuery = !query || [item.title, item.subtitle, item.description, ...item.tags].join(' ').toLowerCase().includes(query);
    return matchesCategory && matchesPremium && matchesQuery;
  });
}

export const contentService = {
  getCategories() { return mockRequest(() => mockCategories, { allowFailure: false }); },
  getContent(filters: ContentFilters = {}) { return mockRequest(() => paginate(filterContent(filters), filters.page ?? 1, filters.pageSize ?? 6)); },
  getFeatured() { return mockRequest(() => mockContent.filter((item) => item.isFeatured), { allowFailure: false }); },
  getRecommended(userCategoryIds: string[] = []) { return mockRequest(() => mockContent.filter((item) => userCategoryIds.includes(item.categoryId) || item.rating >= 4.8).slice(0, 5)); },
  getById(id: string) { return mockRequest(() => { const item = mockContent.find((content) => content.id === id); if (!item) throw new ApiError('Contenu introuvable.', 'NOT_FOUND', 404); return item; }); },
  getRelated(content: ContentItem) { return mockRequest(() => mockContent.filter((item) => item.id !== content.id && (item.categoryId === content.categoryId || item.tags.some((tag) => content.tags.includes(tag)))).slice(0, 4)); },
};

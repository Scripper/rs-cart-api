import { AppRequest } from '../models';

/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: AppRequest): string {
  return request ? (request?.body?.user?.id || request?.user?.id || request?.query?.user_id) : '';
}

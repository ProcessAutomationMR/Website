import { throttle } from '../utils/throttle.utils';
import { logger } from '../utils/logger.utils';
import { getCSRFToken } from '../utils/csrf.utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let sessionId: string | null = null;
let basicVisitorLogged = false;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      const randomBytes = new Uint8Array(8);
      crypto.getRandomValues(randomBytes);
      const randomHex = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
      sessionId = `session_${Date.now()}_${randomHex}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

function hasAnalyticsConsent(): boolean {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) {
    return false;
  }

  try {
    const consentData = JSON.parse(consent);
    return consentData.analytics === true;
  } catch {
    return false;
  }
}

function getCurrentPageName(): string {
  const path = window.location.pathname;
  if (path === '/') return 'Homepage';
  if (path === '/contact') return 'Contact Page';
  if (path === '/projects') return 'All Projects Page';
  if (path === '/quote') return 'Quote Request Page';
  if (path === '/cart') return 'Cart Page';
  if (path.startsWith('/category/')) {
    const category = path.split('/')[2];
    return `Category: ${category}`;
  }
  if (path.startsWith('/product/')) return 'Product Detail Page';
  return path;
}

interface LogActivityParams {
  actionType: string;
  pageName?: string;
  elementName?: string;
  projectId?: string;
  metadata?: Record<string, any>;
}

async function logBasicVisitor(): Promise<void> {
  if (basicVisitorLogged) {
    return;
  }

  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/log-activity`;

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({
        action_type: 'visitor',
        page_name: null,
        element_name: null,
        page_url: null,
        project_id: null,
        metadata: { consent: false },
        session_id: getSessionId(),
      }),
    });

    basicVisitorLogged = true;
  } catch (error) {
    logger.error('Failed to log basic visitor', error);
  }
}

async function logActivity({
  actionType,
  pageName,
  elementName,
  projectId,
  metadata,
}: LogActivityParams): Promise<void> {
  if (!hasAnalyticsConsent()) {
    await logBasicVisitor();
    return;
  }

  try {
    const apiUrl = `${SUPABASE_URL}/functions/v1/log-activity`;

    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken(),
      },
      body: JSON.stringify({
        action_type: actionType,
        page_name: pageName || getCurrentPageName(),
        element_name: elementName || null,
        page_url: (() => { try { const u = new URL(window.location.href); u.search = ''; u.hash = ''; return u.toString(); } catch { return null; } })(),
        project_id: projectId,
        metadata,
        session_id: getSessionId(),
      }),
    });
  } catch (error) {
    logger.error('Failed to log activity', error);
  }
}

const throttledLogActivity = throttle(logActivity, 500);

export const analyticsService = {
  logPageView(pageName: string, metadata?: Record<string, any>) {
    throttledLogActivity({
      actionType: 'page_view',
      pageName,
      metadata,
    });
  },

  logProjectView(projectId: string, projectTitle: string) {
    throttledLogActivity({
      actionType: 'project_view',
      elementName: projectTitle,
      projectId,
    });
  },

  logButtonClick(buttonLabel: string, metadata?: Record<string, any>) {
    throttledLogActivity({
      actionType: 'button_click',
      elementName: buttonLabel,
      metadata,
    });
  },

  logNavigation(destination: string, source?: string) {
    throttledLogActivity({
      actionType: 'navigation',
      elementName: destination,
      metadata: { source },
    });
  },

  logCategoryView(categoryName: string, subcategoryName?: string) {
    throttledLogActivity({
      actionType: 'category_view',
      elementName: subcategoryName ? `${categoryName} / ${subcategoryName}` : categoryName,
      metadata: { category: categoryName, subcategory: subcategoryName },
    });
  },

  logAddToCart(projectId: string, projectTitle: string) {
    logActivity({
      actionType: 'add_to_cart',
      elementName: projectTitle,
      projectId,
    });
  },

  logRemoveFromCart(projectId: string, projectTitle: string) {
    logActivity({
      actionType: 'remove_from_cart',
      elementName: projectTitle,
      projectId,
    });
  },

  logQuoteRequest(projectIds: string[]) {
    logActivity({
      actionType: 'quote_request',
      elementName: `${projectIds.length} project(s)`,
      metadata: {
        project_count: projectIds.length,
      },
    });
  },

  logContactForm(purpose: string) {
    logActivity({
      actionType: 'contact_form',
      elementName: purpose,
      metadata: { purpose },
    });
  },

  logSearch(searchTerm: string, resultsCount?: number) {
    throttledLogActivity({
      actionType: 'search',
      elementName: searchTerm,
      metadata: { search_term: searchTerm, results_count: resultsCount },
    });
  },

  logImageView(projectId: string, projectTitle: string, imageIndex: number) {
    throttledLogActivity({
      actionType: 'image_view',
      elementName: `${projectTitle} - Image ${imageIndex + 1}`,
      projectId,
      metadata: { image_index: imageIndex },
    });
  },

  logProjectDescriptionRequest(projectId: string, projectTitle: string) {
    logActivity({
      actionType: 'project_description_request',
      elementName: projectTitle,
      projectId,
    });
  },

  logHeaderLogoClick() {
    throttledLogActivity({
      actionType: 'logo_click',
      elementName: 'Header logo',
    });
  },

  logCTAClick(ctaLabel: string, location: string) {
    throttledLogActivity({
      actionType: 'cta_click',
      elementName: ctaLabel,
      metadata: { location },
    });
  },
};

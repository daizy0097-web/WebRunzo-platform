import { 
  ProjectStatus, 
  Order, 
  ALLOWED_PROJECT_TRANSITIONS, 
  PROJECT_LIFECYCLE_STEPS 
} from '../types';

/**
 * Derives the canonical ProjectStatus from an order record.
 * Inspects explicit projectStatus, internalNotes tag, milestones, or fallback status.
 */
export function getProjectStatus(order?: Partial<Order> | null): ProjectStatus {
  if (!order) return 'Submitted';

  // 1. Direct projectStatus if already defined and valid
  if (order.projectStatus && PROJECT_LIFECYCLE_STEPS.includes(order.projectStatus)) {
    return order.projectStatus;
  }

  // 2. Extract from internalNotes tag: [PROJECT_STATUS:...]
  if (order.internalNotes) {
    const match = order.internalNotes.match(/\[PROJECT_STATUS:(Submitted|Accepted|In Progress|Review|Live)\]/);
    if (match && match[1] && PROJECT_LIFECYCLE_STEPS.includes(match[1] as ProjectStatus)) {
      return match[1] as ProjectStatus;
    }
  }

  // 3. Inspect milestones array if present
  if (Array.isArray(order.milestones) && order.milestones.length > 0) {
    // Check in reverse progression order
    const liveStep = order.milestones.find((m) => m.title.toLowerCase().includes('live'));
    if (liveStep?.completed) return 'Live';

    const reviewStep = order.milestones.find((m) => m.title.toLowerCase().includes('review'));
    if (reviewStep?.completed) return 'Review';

    const inProgStep = order.milestones.find(
      (m) => m.title.toLowerCase().includes('progress') || m.title.toLowerCase().includes('development')
    );
    if (inProgStep?.completed) return 'In Progress';

    const acceptedStep = order.milestones.find((m) => m.title.toLowerCase().includes('accepted'));
    if (acceptedStep?.completed) return 'Accepted';

    const submittedStep = order.milestones.find(
      (m) => m.title.toLowerCase().includes('submitted') || m.title.toLowerCase().includes('received')
    );
    if (submittedStep?.completed) return 'Submitted';
  }

  // 4. Fallback: map from order.status
  if (order.status === 'Completed' || order.status === 'Live') return 'Live';
  if (order.status === 'Review') return 'Review';
  if (order.status === 'In Progress') return 'In Progress';
  if (order.status === 'Accepted' || order.status === 'Pending') return 'Accepted';

  return 'Submitted';
}

/**
 * Validates whether a transition from one project status to another is permitted.
 */
export function isValidProjectTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  const allowed = ALLOWED_PROJECT_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

/**
 * Generates the 5 canonical milestones for an order reflecting the current project status.
 */
export function getCanonicalMilestones(
  status: ProjectStatus,
  existingMilestones?: Order['milestones'],
  todayDate: string = new Date().toISOString().split('T')[0]
): NonNullable<Order['milestones']> {
  const findExistingDate = (key: string): string | undefined => {
    if (!Array.isArray(existingMilestones)) return undefined;
    const found = existingMilestones.find((m) => m.title.toLowerCase().includes(key));
    return found?.date;
  };

  const statusHierarchy: Record<ProjectStatus, number> = {
    'Submitted': 1,
    'Accepted': 2,
    'In Progress': 3,
    'Review': 4,
    'Live': 5,
  };

  const currentLevel = statusHierarchy[status];

  // Note on Review -> In Progress reversion:
  // When status is 'In Progress', level is 3, so Review (4) and Live (5) are not completed.
  return [
    {
      title: 'Project Submitted & Requirements Received',
      completed: currentLevel >= 1,
      date: findExistingDate('submitted') || findExistingDate('received') || todayDate,
    },
    {
      title: 'Project Accepted & Engineering Queued',
      completed: currentLevel >= 2,
      date: currentLevel >= 2 ? findExistingDate('accepted') || todayDate : undefined,
    },
    {
      title: 'Turnkey Development & Custom Styling',
      completed: currentLevel >= 3,
      date: currentLevel >= 3 ? findExistingDate('progress') || findExistingDate('development') || todayDate : undefined,
    },
    {
      title: 'Client Review & Staging Inspection',
      completed: currentLevel >= 4,
      date: currentLevel >= 4 ? findExistingDate('review') || todayDate : undefined,
    },
    {
      title: 'Live Production Launch & CDN Active',
      completed: currentLevel >= 5,
      date: currentLevel >= 5 ? findExistingDate('live') || findExistingDate('launch') || todayDate : undefined,
    },
  ];
}

/**
 * Maps the high-level ProjectStatus to the underlying PostgreSQL enum for public.orders.status:
 * ('New', 'Pending', 'In Progress', 'Completed', 'Cancelled')
 */
export function mapProjectStatusToDatabaseOrderStatus(
  status: ProjectStatus
): 'New' | 'Pending' | 'In Progress' | 'Completed' {
  switch (status) {
    case 'Submitted':
      return 'New';
    case 'Accepted':
      return 'Pending';
    case 'In Progress':
      return 'In Progress';
    case 'Review':
      return 'In Progress';
    case 'Live':
      return 'Completed';
    default:
      return 'New';
  }
}

/**
 * Embeds or updates the [PROJECT_STATUS:...] metadata tag inside internal_notes.
 */
export function embedProjectStatusInNotes(
  currentNotes: string | undefined,
  newStatus: ProjectStatus
): string {
  const cleanNotes = (currentNotes || '').replace(/\[PROJECT_STATUS:(Submitted|Accepted|In Progress|Review|Live)\]\s*/g, '').trim();
  const tag = `[PROJECT_STATUS:${newStatus}]`;
  return cleanNotes ? `${tag} ${cleanNotes}` : tag;
}

/**
 * Percentage calculation for completion bar.
 */
export function getStatusProgressPercentage(status: ProjectStatus): number {
  switch (status) {
    case 'Submitted':
      return 20;
    case 'Accepted':
      return 40;
    case 'In Progress':
      return 60;
    case 'Review':
      return 80;
    case 'Live':
      return 100;
    default:
      return 20;
  }
}

/**
 * Detailed description for the active phase.
 */
export function getStatusPhaseDescription(status: ProjectStatus): string {
  switch (status) {
    case 'Submitted':
      return 'Your website project and scope details have been submitted. Our engineering leads are reviewing the design specifications.';
    case 'Accepted':
      return 'Your project has been accepted into our active production queue. Turnkey environment provisioning is underway.';
    case 'In Progress':
      return 'Our engineers are actively building your custom pages, responsive design, brand assets, and mobile optimization.';
    case 'Review':
      return 'Your turnkey website build is ready for client review and staging inspection. Check the simulator preview and approve or request revisions.';
    case 'Live':
      return 'Your turnkey website is 100% deployed and live on global CDN edge infrastructure with verified SSL certification.';
  }
}

/**
 * Tailwind badge styling matching WebRunzo dark palette.
 */
export function getStatusBadgeStyle(status: ProjectStatus): string {
  switch (status) {
    case 'Submitted':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    case 'Accepted':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'In Progress':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'Review':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'Live':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
}

/**
 * Contextual notification payload for client notifications.
 */
export function getStatusNotification(
  status: ProjectStatus,
  businessName: string
): { title: string; message: string; type: 'info' | 'success' | 'warning' } {
  switch (status) {
    case 'Accepted':
      return {
        title: `Project Accepted: ${businessName}`,
        message: 'Your website build has been accepted into our active production sprint. Turnkey development is scheduled.',
        type: 'info',
      };
    case 'In Progress':
      return {
        title: `Build In Progress: ${businessName}`,
        message: 'Our development team has begun building your website. Layouts, styling, and assets are actively being assembled.',
        type: 'info',
      };
    case 'Review':
      return {
        title: `Ready for Review: ${businessName}`,
        message: 'Your turnkey website build is ready for client review and staging inspection. Open your preview to inspect.',
        type: 'warning',
      };
    case 'Live':
      return {
        title: `🎉 Your Website Is Live!`,
        message: `Congratulations! ${businessName} is now officially deployed and live on WebRunzo cloud infrastructure.`,
        type: 'success',
      };
    case 'Submitted':
    default:
      return {
        title: `Project Submitted: ${businessName}`,
        message: 'Your website project has been registered and is pending engineering intake review.',
        type: 'info',
      };
  }
}

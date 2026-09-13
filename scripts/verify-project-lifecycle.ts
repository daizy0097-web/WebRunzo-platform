import { 
  ProjectStatus, 
  PROJECT_LIFECYCLE_STEPS, 
  ALLOWED_PROJECT_TRANSITIONS,
  Order 
} from '../src/types';
import {
  getProjectStatus,
  isValidProjectTransition,
  getCanonicalMilestones,
  mapProjectStatusToDatabaseOrderStatus,
  embedProjectStatusInNotes,
  getStatusProgressPercentage,
  getStatusPhaseDescription,
  getStatusBadgeStyle
} from '../src/utils/projectLifecycle';

console.log('================================================================');
console.log('WEBRUNZO CLIENT PROGRESS TRACKING - COMPREHENSIVE VERIFICATION');
console.log('Testing Canonical Lifecycle: Submitted -> Accepted -> In Progress -> Review -> Live');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(description: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${description} ${detail ? `(${detail})` : ''}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// Verification of Transitions A–M (Formal State Machine Matrix)
// -----------------------------------------------------------------------------
console.log('--- Verifying Project Lifecycle Transitions A–M ---');

// Test A: Submitted -> Accepted (Valid)
assert('Transition A: Submitted -> Accepted must be ALLOWED', 
  isValidProjectTransition('Submitted', 'Accepted') === true
);

// Test B: Submitted -> In Progress (Invalid)
assert('Transition B: Submitted -> In Progress must be FORBIDDEN', 
  isValidProjectTransition('Submitted', 'In Progress') === false
);

// Test C: Submitted -> Review (Invalid)
assert('Transition C: Submitted -> Review must be FORBIDDEN', 
  isValidProjectTransition('Submitted', 'Review') === false
);

// Test D: Submitted -> Live (Invalid)
assert('Transition D: Submitted -> Live must be FORBIDDEN', 
  isValidProjectTransition('Submitted', 'Live') === false
);

// Test E: Accepted -> In Progress (Valid)
assert('Transition E: Accepted -> In Progress must be ALLOWED', 
  isValidProjectTransition('Accepted', 'In Progress') === true
);

// Test F: Accepted -> Review (Invalid)
assert('Transition F: Accepted -> Review must be FORBIDDEN', 
  isValidProjectTransition('Accepted', 'Review') === false
);

// Test G: Accepted -> Live (Invalid)
assert('Transition G: Accepted -> Live must be FORBIDDEN', 
  isValidProjectTransition('Accepted', 'Live') === false
);

// Test H: Accepted -> Submitted (Invalid backwards transition)
assert('Transition H: Accepted -> Submitted must be FORBIDDEN', 
  isValidProjectTransition('Accepted', 'Submitted') === false
);

// Test I: In Progress -> Review (Valid)
assert('Transition I: In Progress -> Review must be ALLOWED', 
  isValidProjectTransition('In Progress', 'Review') === true
);

// Test J: In Progress -> Live (Invalid skip of Review)
assert('Transition J: In Progress -> Live must be FORBIDDEN', 
  isValidProjectTransition('In Progress', 'Live') === false
);

// Test K: Review -> Live (Valid approval & launch)
assert('Transition K: Review -> Live must be ALLOWED', 
  isValidProjectTransition('Review', 'Live') === true
);

// Test L: Review -> In Progress (Valid revision cycle when client requests changes)
assert('Transition L: Review -> In Progress must be ALLOWED (Revision Loop)', 
  isValidProjectTransition('Review', 'In Progress') === true
);

// Test M: Live -> any status (Terminal state; no transitions allowed from Live)
const transitionsFromLive = ALLOWED_PROJECT_TRANSITIONS['Live'];
const canTransitionFromLive = PROJECT_LIFECYCLE_STEPS.some((target) => 
  isValidProjectTransition('Live', target)
);
assert('Transition M: Live is a terminal state with 0 outgoing transitions', 
  transitionsFromLive.length === 0 && canTransitionFromLive === false
);

// -----------------------------------------------------------------------------
// Database Mapping & Backward Compatibility Tests
// -----------------------------------------------------------------------------
console.log('\n--- Verifying PostgreSQL Enum Mapping & Compatibility ---');

assert('Submitted maps safely to DB status "New"', 
  mapProjectStatusToDatabaseOrderStatus('Submitted') === 'New'
);
assert('Accepted maps safely to DB status "Pending"', 
  mapProjectStatusToDatabaseOrderStatus('Accepted') === 'Pending'
);
assert('In Progress maps safely to DB status "In Progress"', 
  mapProjectStatusToDatabaseOrderStatus('In Progress') === 'In Progress'
);
assert('Review maps safely to DB status "In Progress"', 
  mapProjectStatusToDatabaseOrderStatus('Review') === 'In Progress'
);
assert('Live maps safely to DB status "Completed"', 
  mapProjectStatusToDatabaseOrderStatus('Live') === 'Completed'
);

// -----------------------------------------------------------------------------
// Notes Metadata Tag Embedding & Extraction Tests
// -----------------------------------------------------------------------------
console.log('\n--- Verifying Notes Metadata Tag Embedding & Retrieval ---');

const noteInitial = 'Intake scope: responsive photography website.';
const noteWithStatus = embedProjectStatusInNotes(noteInitial, 'Review');
assert('Notes tag embedded properly', 
  noteWithStatus.includes('[PROJECT_STATUS:Review]') && noteWithStatus.includes('responsive photography website.')
);

const noteUpdated = embedProjectStatusInNotes(noteWithStatus, 'Live');
assert('Notes tag replaced without duplicating previous tags', 
  noteUpdated.includes('[PROJECT_STATUS:Live]') && !noteUpdated.includes('[PROJECT_STATUS:Review]')
);

const retrievedFromTag = getProjectStatus({ internalNotes: noteUpdated });
assert('getProjectStatus parses tag correctly', retrievedFromTag === 'Live');

// -----------------------------------------------------------------------------
// Milestone & Progress Integrity Tests
// -----------------------------------------------------------------------------
console.log('\n--- Verifying Milestones & Progress Percentages ---');

PROJECT_LIFECYCLE_STEPS.forEach((step, idx) => {
  const milestones = getCanonicalMilestones(step);
  assert(`Canonical milestones for "${step}" returns exactly 5 milestones`, 
    milestones.length === 5
  );

  const completedCount = milestones.filter(m => m.completed).length;
  assert(`Step "${step}" has ${idx + 1} completed milestones`, 
    completedCount === idx + 1
  );

  const pct = getStatusProgressPercentage(step);
  assert(`Progress percentage for "${step}" is ${(idx + 1) * 20}%`, 
    pct === (idx + 1) * 20
  );

  const desc = getStatusPhaseDescription(step);
  assert(`Phase description for "${step}" is non-empty string`, 
    typeof desc === 'string' && desc.length > 20
  );

  const badge = getStatusBadgeStyle(step);
  assert(`Badge style for "${step}" is non-empty string`, 
    typeof badge === 'string' && badge.length > 5
  );
});

// Reversion Test: When returning from Review to In Progress, Live and Review steps are marked incomplete
const revertedMilestones = getCanonicalMilestones('In Progress');
assert('Reverted milestones mark Review and Live as incomplete', 
  revertedMilestones[0].completed && 
  revertedMilestones[1].completed && 
  revertedMilestones[2].completed && 
  !revertedMilestones[3].completed && 
  !revertedMilestones[4].completed
);

// -----------------------------------------------------------------------------
// Legacy Fallback Tests
// -----------------------------------------------------------------------------
console.log('\n--- Verifying Fallbacks for Legacy Order Formats ---');

assert('Legacy order with status "Completed" resolves to "Live"', 
  getProjectStatus({ status: 'Completed' }) === 'Live'
);
assert('Legacy order with status "In Progress" resolves to "In Progress"', 
  getProjectStatus({ status: 'In Progress' }) === 'In Progress'
);
assert('Legacy order with status "New" resolves to "Submitted"', 
  getProjectStatus({ status: 'New' }) === 'Submitted'
);
assert('Legacy order with status "Pending" resolves to "Accepted"', 
  getProjectStatus({ status: 'Pending' }) === 'Accepted'
);
assert('Empty order gracefully resolves to "Submitted"', 
  getProjectStatus(null) === 'Submitted'
);

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL TRANSITIONS AND LIFECYCLE CHECKS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}

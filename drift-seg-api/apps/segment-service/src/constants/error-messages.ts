export const SEGMENT_ERROR_MESSAGES = {
  DUPLICATE_NAME: 'Segment with this name already exists.',
  INVALID_DEPENDENCY_ID: 'dependsOnSegmentIds must contain ObjectId values.',
  INVALID_RULE_SEGMENT_IDS:
    'rules.segmentIds must contain valid existing segment ObjectIds.',
  RULE_DEPENDENCIES_MISMATCH:
    'For segment_composition, dependsOnSegmentIds must match rules.segmentIds.',
  MISSING_DEPENDENCY:
    'One or more dependsOnSegmentIds do not reference existing segments.',
  STATIC_RULE_MISMATCH: 'Static segment must use rules.kind "manual_snapshot".',
  DYNAMIC_RULE_MISMATCH:
    'Dynamic segment cannot use rules.kind "manual_snapshot".',
} as const;

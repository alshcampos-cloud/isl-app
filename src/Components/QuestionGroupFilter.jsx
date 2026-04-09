import React, { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'isl_active_groups';

/**
 * Load persisted active groups from localStorage.
 * Returns a Set of group IDs, or null if nothing is stored.
 */
export const loadPersistedGroups = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return new Set(parsed);
      }
    }
  } catch (e) {
    // Corrupted storage — ignore and return null
  }
  return null;
};

/**
 * Persist active groups to localStorage.
 */
const persistGroups = (activeGroups) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...activeGroups]));
  } catch (e) {
    // Storage full or unavailable — fail silently
  }
};

/**
 * QuestionGroupFilter — Horizontal scrollable chip filter for question groups.
 *
 * Props:
 *   groups         — array of { id, label, icon, description }
 *   activeGroups   — Set<string> of active group IDs
 *   onToggle       — (groupId: string) => void
 *   questionCounts — { [groupId]: number }
 *   totalQuestions  — total number of questions across all groups (optional)
 *   compact        — boolean (smaller variant)
 */
const QuestionGroupFilter = ({
  groups = [],
  activeGroups = new Set(),
  onToggle,
  questionCounts = {},
  totalQuestions,
  compact = false,
}) => {
  const allActive = groups.length > 0 && groups.every(g => activeGroups.has(g.id));
  const noneActive = groups.length > 0 && groups.every(g => !activeGroups.has(g.id));

  const totalCount = Object.values(questionCounts).reduce((sum, c) => sum + c, 0);

  // Persist to localStorage whenever activeGroups changes
  useEffect(() => {
    if (activeGroups && activeGroups.size > 0) {
      persistGroups(activeGroups);
    }
  }, [activeGroups]);

  const activeQuestionCount = groups.reduce((sum, g) => {
    if (activeGroups.has(g.id)) {
      return sum + (questionCounts[g.id] || 0);
    }
    return sum;
  }, 0);

  const displayTotal = totalQuestions || totalCount;

  const handleAllToggle = useCallback(() => {
    if (allActive) {
      groups.forEach(g => {
        if (activeGroups.has(g.id)) onToggle(g.id);
      });
    } else {
      groups.forEach(g => {
        if (!activeGroups.has(g.id)) onToggle(g.id);
      });
    }
  }, [allActive, groups, activeGroups, onToggle]);

  const chipHeight = compact ? 'min-h-[36px]' : 'min-h-[44px]';
  const chipPadding = compact ? 'px-3 py-1' : 'px-4 py-2';
  const fontSize = compact ? 'text-xs' : 'text-sm';
  const badgeSize = compact ? 'text-[10px] min-w-[18px] h-[18px]' : 'text-xs min-w-[20px] h-[20px]';

  return (
    <div className="space-y-2">
      {/* Scrollable chip row */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* "All" chip */}
        <button
          onClick={handleAllToggle}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleAllToggle();
          }}
          className={`
            flex items-center gap-1.5 rounded-full whitespace-nowrap
            ${chipHeight} ${chipPadding} ${fontSize}
            font-medium transition-all duration-150
            active:scale-[0.95] select-none shrink-0
            ${allActive || noneActive
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }
          `}
        >
          <span>All</span>
          {totalCount > 0 && (
            <span
              className={`
                inline-flex items-center justify-center rounded-full font-semibold
                ${badgeSize}
                ${allActive || noneActive
                  ? 'bg-slate-600 text-slate-100'
                  : 'bg-slate-100 text-slate-400'
                }
              `}
            >
              {totalCount}
            </span>
          )}
        </button>

        {/* Group chips */}
        {groups.map(group => {
          const isActive = activeGroups.has(group.id);
          const count = questionCounts[group.id] || 0;

          return (
            <button
              key={group.id}
              onClick={() => onToggle(group.id)}
              onTouchEnd={(e) => {
                e.preventDefault();
                onToggle(group.id);
              }}
              title={group.description}
              className={`
                flex items-center gap-1.5 rounded-full whitespace-nowrap
                ${chipHeight} ${chipPadding} ${fontSize}
                font-medium transition-all duration-150
                active:scale-[0.95] select-none shrink-0
                ${isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                }
              `}
            >
              <span className="leading-none">{group.icon}</span>
              <span>{group.label}</span>
              {count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center rounded-full font-semibold
                    ${badgeSize}
                    ${isActive
                      ? 'bg-slate-600 text-slate-100'
                      : 'bg-slate-100 text-slate-400'
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary line */}
      {displayTotal > 0 && (
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500`}>
          {allActive || noneActive
            ? `${displayTotal} questions active`
            : `${activeQuestionCount} of ${displayTotal} questions active`
          }
        </p>
      )}
    </div>
  );
};

export default QuestionGroupFilter;

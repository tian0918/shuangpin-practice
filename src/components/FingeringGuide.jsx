import { getFingeringForKey } from '../utils/fingering'

const FINGER_ORDER = {
  left: ['pinky', 'ring', 'middle', 'index', 'thumb'],
  right: ['thumb', 'index', 'middle', 'ring', 'pinky'],
}

function HandDiagram({ side, targets, animationKey }) {
  const activeTarget = targets.find(target => target.hand === side)

  return (
    <div
      className={`finger-guide__hand finger-guide__hand--${side}${activeTarget ? ' is-active' : ''}`}
      style={activeTarget
        ? { '--active-finger-color': `var(--finger-${activeTarget.finger})` }
        : undefined}
    >
      <div className="finger-guide__fingers">
        {FINGER_ORDER[side].map(finger => {
          const isTarget = activeTarget?.finger === finger
          return (
            <span
              className={`finger-guide__finger finger-guide__finger--${finger}${isTarget ? ' is-target' : ''}`}
              key={isTarget ? `${finger}-${animationKey}` : finger}
            />
          )
        })}
      </div>
      <span className="finger-guide__palm">
        <span>{side === 'left' ? '左手' : '右手'}</span>
      </span>
    </div>
  )
}

export default function FingeringGuide({ activeKey, animationKey = '' }) {
  const fingering = getFingeringForKey(activeKey)
  const targets = fingering?.targets || []
  const announcement = fingering
    ? `目标键 ${fingering.displayKey}，请使用${fingering.label}`
    : '等待目标按键，双手请放在基准键位'

  return (
    <div className="finger-guide">
      <div className="finger-guide__hand-slot" aria-hidden="true">
        <HandDiagram side="left" targets={targets} animationKey={animationKey} />
      </div>

      <div className="finger-guide__status">
        <span className="finger-guide__eyebrow" aria-hidden="true">指法提示</span>
        <strong aria-hidden="true">{fingering?.label || '双手归位'}</strong>
        <span aria-hidden="true">{fingering ? `按 ${fingering.displayKey}` : '等待目标键'}</span>
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      </div>

      <div className="finger-guide__hand-slot" aria-hidden="true">
        <HandDiagram side="right" targets={targets} animationKey={animationKey} />
      </div>
    </div>
  )
}

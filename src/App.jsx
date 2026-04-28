import { useState } from 'react';
import { SUSPECTS, CLUES, ANSWER_KEY, PHASE_LABELS } from './data.js';

const INITIAL_ANSWERS = {
  clue1: { partA: null, partB: null, work: '' },
  clue2: { partA: null, work: '' },
  clue3: { partA: null, work: '' },
  deduction: { suspect: null, reasoning: '' },
};

export default function App() {
  const [phase, setPhase] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);

  const advance = () => setPhase((p) => Math.min(p + 1, 6));

  const updateClue = (clueId, patch) =>
    setAnswers((a) => ({ ...a, [clueId]: { ...a[clueId], ...patch } }));

  return (
    <div className="app">
      {phase > 0 && <Topbar phase={phase} studentName={studentName} />}
      <main className="stage" key={phase}>
        {phase === 0 && (
          <IntroScreen
            studentName={studentName}
            setStudentName={setStudentName}
            onNext={advance}
          />
        )}
        {phase === 1 && <BriefingScreen onNext={advance} />}
        {phase >= 2 && phase <= 4 && (
          <ClueScreen
            clue={CLUES[phase - 2]}
            answer={answers[`clue${phase - 1}`]}
            update={(patch) => updateClue(`clue${phase - 1}`, patch)}
            onNext={advance}
            nextLabel={
              phase === 2
                ? 'Proceed to Clue #2 →'
                : phase === 3
                ? 'Proceed to Clue #3 →'
                : 'Make Your Deduction →'
            }
          />
        )}
        {phase === 5 && (
          <DeductionScreen
            deduction={answers.deduction}
            update={(patch) =>
              setAnswers((a) => ({ ...a, deduction: { ...a.deduction, ...patch } }))
            }
            onNext={advance}
          />
        )}
        {phase === 6 && (
          <SummaryScreen studentName={studentName} answers={answers} />
        )}
      </main>
    </div>
  );
}

function Topbar({ phase, studentName }) {
  // phase 1..6 → indicator index 0..5
  const current = phase - 1;
  return (
    <header className="topbar">
      <div className="brand">
        <span className="seal">H</span>
        <span className="brand-full">Hartwell Museum · Internal Affairs</span>
        <span className="brand-short">Hartwell IA</span>
        <span className="case-no">CASE №&nbsp;HM-1142</span>
      </div>
      <nav className="progress" aria-label="Progress">
        {PHASE_LABELS.slice(1).map((label, i) => (
          <span key={label} style={{ display: 'contents' }}>
            {i > 0 && (
              <span className={'connector' + (i <= current ? ' done' : '')} />
            )}
            <span
              className={
                'step ' +
                (i < current ? 'done ' : '') +
                (i === current ? 'active' : '')
              }
              aria-current={i === current ? 'step' : undefined}
            >
              <span className="dot" />
              <span className="label-text">{label}</span>
            </span>
          </span>
        ))}
      </nav>
      <div className="brand" style={{ justifyContent: 'flex-end', justifySelf: 'end' }}>
        {studentName ? (
          <>
            <span className="muted">Detective —</span>
            <span style={{ color: 'var(--gold)' }}>{studentName}</span>
          </>
        ) : (
          <span className="muted">Unassigned</span>
        )}
      </div>
    </header>
  );
}

function IntroScreen({ studentName, setStudentName, onNext }) {
  const ready = studentName.trim().length > 0;
  return (
    <div className="frame">
      <div className="hero-marks">
        <span className="line" />
        <span>Confidential · After Hours · 03.14</span>
        <span className="line" />
      </div>

      <h1 className="hero-title">
        The Hartwell <em>Heist</em>
      </h1>
      <div className="hero-sub">A probability investigation in three clues</div>

      <div className="hr-gold" style={{ marginTop: 32 }} />

      <div className="case-block" style={{ marginTop: 28 }}>
        <p>
          On the night of March 14th, a 17th-century golden astrolabe valued at
          $2.4 million was stolen from the Hartwell Museum's vault. Four
          individuals had access to the building that evening.
        </p>
        <p style={{ marginBottom: 0 }}>
          As lead detective, you will examine three pieces of evidence using
          probability to identify the culprit. Work through each clue, show your
          calculations, and make your final deduction. Your teacher will review
          your reasoning.
        </p>

        <div className="case-meta">
          <div className="item">
            <div className="k">Location</div>
            <div className="v">Gallery 7 / Vault</div>
          </div>
          <div className="item">
            <div className="k">Item</div>
            <div className="v">Golden Astrolabe</div>
          </div>
          <div className="item">
            <div className="k">Reported</div>
            <div className="v">21:47 hrs</div>
          </div>
          <div className="item">
            <div className="k">Standards</div>
            <div className="v">CP.A.5 · B.6 · B.7</div>
          </div>
        </div>
      </div>

      <div className="hr" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 24,
          alignItems: 'end',
        }}
      >
        <div>
          <label className="label" htmlFor="detective">
            Detective Name
          </label>
          <input
            id="detective"
            className="input"
            placeholder="Enter your name to sign in"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            maxLength={48}
          />
        </div>
        <button className="btn btn-primary" disabled={!ready} onClick={onNext}>
          Open the Case File →
        </button>
      </div>
    </div>
  );
}

function SuspectCard({ s, selectable, selected, onClick }) {
  return (
    <button
      type="button"
      className={
        'suspect' +
        (selectable ? ' selectable' : '') +
        (selected ? ' selected' : '')
      }
      onClick={selectable ? onClick : undefined}
      aria-pressed={selectable ? selected : undefined}
      disabled={!selectable && !onClick}
      style={!selectable ? { cursor: 'default' } : undefined}
    >
      <div className="photo">
        <span className="file-tag">Subject</span>
        <span className="file-no">{s.fileNo}</span>
        <span className="silhouette">{s.initial}</span>
      </div>
      <div className="body">
        <div className="name">{s.name}</div>
        <div className="role">{s.role}</div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--parchment-dim)',
            lineHeight: 1.6,
            paddingTop: 8,
            borderTop: '1px dashed var(--rule)',
          }}
        >
          {s.detail}
        </div>
      </div>
      <span className="selected-stamp">Person of Interest</span>
    </button>
  );
}

function BriefingScreen({ onNext }) {
  return (
    <div className="frame">
      <div className="eyebrow">Briefing · Persons of Interest</div>
      <h2 style={{ margin: '10px 0 14px' }}>
        Four people. One missing astrolabe.
      </h2>
      <div className="callout">
        Each person had a reason to be in the building that night. Read their
        files closely — the math will narrow this down, but only if you remember
        who could and could not get into the vault.
      </div>

      <div style={{ height: 28 }} />

      <div className="suspect-grid">
        {SUSPECTS.map((s) => (
          <SuspectCard key={s.id} s={s} selectable={false} />
        ))}
      </div>

      <div className="nav">
        <span />
        <span className="helper">Review all four files before proceeding</span>
        <button className="btn btn-primary" onClick={onNext}>
          Examine Clue #1 →
        </button>
      </div>
    </div>
  );
}

function Choices({ options, value, onChange }) {
  return (
    <div className="choices">
      {options.map((label, i) => {
        const letter = String.fromCharCode(65 + i);
        const isSel = value === i;
        return (
          <button
            key={i}
            type="button"
            className={'choice' + (isSel ? ' selected' : '')}
            onClick={() => onChange(i)}
          >
            <span className="glyph">{letter}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SuspectReference() {
  const [open, setOpen] = useState(true);
  return (
    <div className="suspect-ref">
      <button
        type="button"
        className="suspect-ref-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{open ? '▾' : '▸'} Persons of Interest</span>
        <span className="muted">
          {open ? 'Hide files' : 'Review the four files'}
        </span>
      </button>
      {open && (
        <div className="suspect-ref-grid">
          {SUSPECTS.map((s) => (
            <div key={s.id} className="suspect-ref-card">
              <div className="suspect-ref-head">
                <span className="suspect-ref-initial">{s.initial}</span>
                <div>
                  <div className="suspect-ref-name">{s.name}</div>
                  <div className="suspect-ref-role">{s.role}</div>
                </div>
              </div>
              <div className="suspect-ref-detail">{s.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClueScreen({ clue, answer, update, onNext, nextLabel }) {
  const allParts = clue.parts.every((p) => answer[p.id] !== null);

  return (
    <div className="frame">
      <div className="eyebrow">{clue.standard}</div>
      <h2 style={{ margin: '10px 0 14px' }}>{clue.title}</h2>
      <p className="dim" style={{ maxWidth: 720 }}>
        {clue.narrative}
      </p>

      <SuspectReference />

      <div style={{ height: 18 }} />

      {clue.table && <TwoWayTable table={clue.table} />}
      {clue.given && (
        <div className="evidence">
          {clue.given.map((line, i) =>
            line.includes('=') ? (
              <div key={i} className="row">
                <span className="lhs">{line.split('=')[0].trim()}</span>
                <span className="rhs">= {line.split('=')[1].trim()}</span>
              </div>
            ) : line.trim() === '' ? (
              <div key={i} style={{ height: 6 }} />
            ) : (
              <div
                key={i}
                style={{
                  padding: '6px 0',
                  color: 'var(--parchment-dim)',
                  fontSize: 14,
                }}
              >
                {line}
              </div>
            )
          )}
        </div>
      )}

      <div className="hr" />

      {clue.parts.map((part) => (
        <div key={part.id} className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 18, lineHeight: 1.4 }}>
            {part.question}
          </h3>
          <Choices
            options={part.options}
            value={answer[part.id]}
            onChange={(v) => update({ [part.id]: v })}
          />
        </div>
      ))}

      <label className="label">Show your work</label>
      <textarea
        className="input"
        placeholder="Walk through the calculation in your own words…"
        value={answer.work}
        onChange={(e) => update({ work: e.target.value })}
      />

      <div className="nav">
        <span />
        <span className="helper">
          {allParts ? 'Answers locked in' : 'Answer all questions to continue'}
        </span>
        <button className="btn btn-primary" disabled={!allParts} onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

function TwoWayTable({ table }) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          {table.headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, ri) => (
          <tr key={ri}>
            <td className="row-h">{row.label}</td>
            {row.cells.map((c, ci) => {
              const isHighlight = row.highlight?.includes(ci);
              const isTotal = row.isTotalsRow || ci === row.cells.length - 1;
              return (
                <td
                  key={ci}
                  className={
                    isHighlight ? 'highlight' : isTotal ? 'total' : ''
                  }
                >
                  {c}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DeductionScreen({ deduction, update, onNext }) {
  const ready =
    deduction.suspect !== null && deduction.reasoning.trim().length > 15;
  return (
    <div className="frame">
      <div className="eyebrow">Final Deduction</div>
      <h2 style={{ margin: '10px 0 14px' }}>Name the suspect.</h2>
      <p className="dim" style={{ maxWidth: 720 }}>
        Three clues, three calculations. The math has narrowed the field —
        select the person you believe took the astrolabe, then justify your
        choice with at least one probability calculation from the case file.
      </p>

      <div style={{ height: 22 }} />

      <div className="suspect-grid">
        {SUSPECTS.map((s) => (
          <SuspectCard
            key={s.id}
            s={s}
            selectable
            selected={deduction.suspect === s.id}
            onClick={() => update({ suspect: s.id })}
          />
        ))}
      </div>

      <div className="hr" />

      <label className="label">
        Justify your deduction — cite at least one probability calculation
      </label>
      <textarea
        className="input"
        rows={5}
        placeholder="The keycard log, the conditional probability of being in the wing after 9 PM, the addition rule for access — pull from at least one and explain your reasoning…"
        value={deduction.reasoning}
        onChange={(e) => update({ reasoning: e.target.value })}
      />
      <div
        className="muted"
        style={{
          fontSize: 11,
          marginTop: 6,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {deduction.reasoning.trim().length} / 16 minimum characters
      </div>

      <div className="nav">
        <span />
        <span className="helper">
          {!deduction.suspect && 'Select a suspect'}
          {deduction.suspect &&
            deduction.reasoning.trim().length <= 15 &&
            'Provide your reasoning'}
          {ready && 'Ready to submit'}
        </span>
        <button className="btn btn-primary" disabled={!ready} onClick={onNext}>
          Submit Case File ⌥
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({ studentName, answers }) {
  const checks = {
    c1a: answers.clue1.partA === ANSWER_KEY.clue1.partA,
    c1b: answers.clue1.partB === ANSWER_KEY.clue1.partB,
    c2: answers.clue2.partA === ANSWER_KEY.clue2.partA,
    c3: answers.clue3.partA === ANSWER_KEY.clue3.partA,
    culprit: answers.deduction.suspect === ANSWER_KEY.deduction.suspect,
  };
  const total = Object.values(checks).filter(Boolean).length;
  const accused = SUSPECTS.find((s) => s.id === answers.deduction.suspect);
  const correctSuspect = SUSPECTS.find(
    (s) => s.id === ANSWER_KEY.deduction.suspect
  );

  return (
    <div className="frame">
      <div className="eyebrow">Case File · Submitted for Teacher Review</div>
      <h2 style={{ margin: '10px 0 6px' }}>
        Detective {studentName || '—'}
      </h2>
      <div
        className="muted"
        style={{
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontSize: 11,
        }}
      >
        Hartwell Museum · Case №&nbsp;HM-1142 · Filed{' '}
        {new Date().toLocaleDateString()}
      </div>

      <div className="hr" />

      <div className="summary-grid">
        <div className="score-tile">
          <div className="eyebrow">Score</div>
          <div className="num">{total} / 5</div>
          <div className="muted">multiple-choice items correct</div>
        </div>
        <div
          className="score-tile"
          style={{
            background: checks.culprit
              ? 'rgba(107,138,58,0.06)'
              : 'rgba(154,51,32,0.06)',
            borderColor: checks.culprit
              ? 'var(--evidence-green)'
              : 'var(--crimson)',
          }}
        >
          <div className="eyebrow">Verdict</div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 28,
              color: 'var(--parchment)',
              lineHeight: 1.2,
            }}
          >
            {accused ? accused.name : '— no accusation —'}
          </div>
          <div className="muted">
            {checks.culprit
              ? 'Correct culprit identified'
              : `Correct: ${correctSuspect.name}`}
          </div>
        </div>
      </div>

      <div className="hr" />

      {CLUES.map((clue, i) => {
        const aKey = `clue${i + 1}`;
        const a = answers[aKey];
        return (
          <div key={clue.id} className="review-block">
            <div className="head">
              <h3>{clue.title}</h3>
              <span className="tag">{clue.standard}</span>
            </div>
            {clue.parts.map((part) => {
              const given = a[part.id];
              const isCorrect = given === part.correct;
              return (
                <div key={part.id} style={{ marginBottom: 12 }}>
                  <div className="qline">{part.question}</div>
                  <span
                    className="label"
                    style={{ display: 'inline', marginRight: 8 }}
                  >
                    Selected
                  </span>
                  <span className={'ans ' + (isCorrect ? 'green' : 'red')}>
                    {given !== null ? part.options[given] : '— no answer —'}
                  </span>
                  {!isCorrect && (
                    <>
                      <span
                        className="label"
                        style={{
                          display: 'inline',
                          marginLeft: 12,
                          marginRight: 8,
                        }}
                      >
                        Correct
                      </span>
                      <span className="ans green">
                        {part.options[part.correct]}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
            <div className={'work' + (a.work.trim() ? '' : ' empty')}>
              {a.work.trim() || '[ no work shown ]'}
            </div>
          </div>
        );
      })}

      <div className="review-block">
        <div className="head">
          <h3>Final Deduction & Reasoning</h3>
          <span
            className="tag"
            style={{
              borderColor: checks.culprit
                ? 'var(--evidence-green)'
                : 'var(--crimson)',
              color: checks.culprit ? 'var(--evidence-green)' : 'var(--crimson)',
            }}
          >
            {checks.culprit ? 'Correct' : 'Incorrect'}
          </span>
        </div>
        <div className="qline">
          Accused:{' '}
          <span style={{ color: 'var(--parchment)' }}>
            {accused ? accused.name : '—'}
          </span>
        </div>
        <div className="work">
          {answers.deduction.reasoning.trim() || '[ no reasoning provided ]'}
        </div>
      </div>

      <div className="nav no-print">
        <span />
        <span className="helper">Submit a fresh case to your teacher</span>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print for Teacher ⎙
        </button>
      </div>
    </div>
  );
}

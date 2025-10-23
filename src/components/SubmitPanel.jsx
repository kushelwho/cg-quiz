export default function SubmitPanel({ onSubmit, onReset, submitted, score, total }) {
  return (
    <div className="submit-panel">
      {!submitted ? (
        <button type="button" onClick={onSubmit}>Submit</button>
      ) : (
        <>
          <span className="score">Score: {score} / {total}</span>
          <button type="button" onClick={onReset}>Reset</button>
        </>
      )}
    </div>
  );
}



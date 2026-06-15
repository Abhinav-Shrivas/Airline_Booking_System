export default function LoadingSpinner({ message = 'Loading...', coldStart = false }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>{message}</p>
      {coldStart && (
        <p className="cold-start-message">
          Waking up server... this may take 30 seconds on first load
        </p>
      )}
    </div>
  );
}

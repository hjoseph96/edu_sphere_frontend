import LoadingIndicator from './LoadingIndicator';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-half text-center" style={{ marginTop: '4rem' }}>
          <div className="card">
            <div className="card-body">
              <LoadingIndicator size="large" text={message} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-half text-center" style={{ marginTop: '4rem' }}>
          <div className="card">
            <div className="card-body">
              <div className="spinner spinner-lg mb-4"></div>
              <p className="text-lg text-secondary">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

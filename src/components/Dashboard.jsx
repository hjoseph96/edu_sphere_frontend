import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-lg text-secondary">
            Here's what's happening in your learning journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="columns is-multiline mb-6">
          <div className="column is-one-third">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="fas fa-book fa-2x text-primary"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Active Courses</h3>
                <p className="text-3xl font-bold text-primary">3</p>
              </div>
            </div>
          </div>

          <div className="column is-one-third">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="fas fa-tasks fa-2x text-success"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Assignments</h3>
                <p className="text-3xl font-bold text-success">7</p>
              </div>
            </div>
          </div>

          <div className="column is-one-third">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="fas fa-clock fa-2x text-warning"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Due This Week</h3>
                <p className="text-3xl font-bold text-warning">2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="columns">
          <div className="column is-two-thirds">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-primary">
                  Recent Activity
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-success"></i>
                    </div>
                    <div>
                      <p className="font-medium">
                        <strong>Completed:</strong> Introduction to React Hooks
                      </p>
                      <p className="text-sm text-secondary">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <i className="fas fa-exclamation-triangle text-warning"></i>
                    </div>
                    <div>
                      <p className="font-medium">
                        <strong>Due Soon:</strong> JavaScript Fundamentals Quiz
                      </p>
                      <p className="text-sm text-secondary">Due in 2 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <i className="fas fa-play-circle text-primary"></i>
                    </div>
                    <div>
                      <p className="font-medium">
                        <strong>Started:</strong> Advanced CSS Techniques
                      </p>
                      <p className="text-sm text-secondary">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="column is-one-third">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-primary">
                  Quick Actions
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <button className="btn btn-primary btn-full">
                    <i className="fas fa-plus mr-2"></i>
                    Join New Course
                  </button>
                  <button className="btn btn-outline btn-full">
                    <i className="fas fa-search mr-2"></i>
                    Browse Courses
                  </button>
                  <button className="btn btn-secondary btn-full">
                    <i className="fas fa-download mr-2"></i>
                    Download Materials
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import PropTypes from 'prop-types';

const EditPageLayout = ({ title, subtitle, children }) => {
  const interStyle = { fontFamily: "'Inter', sans-serif" };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 overflow-hidden" 
         style={{ ...interStyle, backgroundColor: '#f8fafc' }}>
      
      <div className="card border-0 shadow-sm rounded-4 w-100" style={{ maxWidth: '750px' }}>
        <div className="card-body p-4 p-md-5">
          
          <div className="d-flex align-items-center mb-4">
            <div 
              className="bg-warning bg-opacity-10 d-flex align-items-center justify-content-center rounded-4 me-3" 
              style={{ width: '50px', height: '50px' }}
            >
              <i className="bi bi-pencil-square text-warning fs-4"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                {title}
              </h1>
              <p className="text-muted small mb-0">{subtitle}</p>
            </div>
          </div>

          {children}

        </div>
      </div>
    </div>
  );
};

EditPageLayout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};

export default EditPageLayout;


import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '20px', margin: '20px', border: '1px solid red', borderRadius: '8px', backgroundColor: '#fff0f0' }}>
          <h1 style={{ color: 'red', fontSize: '1.5em' }}>Aplikasi Mengalami Masalah</h1>
          <p>Terjadi error yang menyebabkan halaman tidak dapat ditampilkan. Mohon screenshot halaman ini dan kirimkan ke tim teknis.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '15px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Detail Teknis Error</summary>
            {this.state.error && <p><strong>Pesan:</strong> {this.state.error.toString()}</p>}
            {this.state.errorInfo && <p><strong>Stack Trace:</strong><br/>{this.state.errorInfo.componentStack}</p>}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

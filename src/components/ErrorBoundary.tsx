"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  visible: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, visible: false };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidUpdate(_prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (this.state.hasError && !prevState.hasError) {
      // Trigger the fade-in after mount so the CSS transition activates
      requestAnimationFrame(() => {
        this.setState({ visible: true });
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            opacity: this.state.visible ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
          }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-trance-dark"
        >
          <div className="flex flex-col items-center gap-8 text-center max-w-lg">
            <h1 className="narration-text text-2xl text-gold/85">
              Something went wrong
            </h1>

            <p className="narration-text text-lg text-[#e8e0d4]/60">
              Take a deep breath. You&apos;re okay.
            </p>

            <div className="space-y-3 w-full">
              <div className="p-4 border border-gold/25 rounded-xl">
                <p className="text-sm text-gold/80 font-light">
                  988 Suicide &amp; Crisis Lifeline
                </p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">
                  Call or text <span className="text-gold/80">988</span>, available 24/7
                </p>
              </div>
              <div className="p-4 border border-[#e8e0d4]/15 rounded-xl">
                <p className="text-sm text-[#e8e0d4]/60 font-light">
                  Crisis Text Line
                </p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">
                  Text <span className="text-gold/80">HOME</span> to 741741
                </p>
              </div>
              <div className="p-4 border border-[#e8e0d4]/15 rounded-xl">
                <p className="text-sm text-[#e8e0d4]/60 font-light">
                  SAMHSA National Helpline
                </p>
                <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">
                  <span className="text-gold/80">1-800-662-4357</span>, free, confidential, 24/7
                </p>
              </div>
            </div>

            <button
              onClick={this.handleReload}
              className="mt-2 px-8 py-3 border border-gold/45 rounded-full text-gold/85
                         hover:border-gold/75 hover:text-gold transition-all duration-700 ui-text"
            >
              Start over
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

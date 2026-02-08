import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  errorText: string;
  componentStack: string;
  href: string;
  ts: string;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    errorText: "",
    componentStack: "",
    href: typeof window !== "undefined" ? String(window.location.href) : "",
    ts: new Date().toISOString(),
  };

  static getDerivedStateFromError(err: any) {
    return {
      hasError: true,
      errorText: String(err?.message || err),
      href: typeof window !== "undefined" ? String(window.location.href) : "",
      ts: new Date().toISOString(),
    } as Partial<State>;
  }

  componentDidCatch(error: any, info: any) {
    try {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught", error, info);
    } catch {}
    this.setState({
      componentStack: String(info?.componentStack || ""),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace", whiteSpace: "pre-wrap" }}>
          {`REACT_ERROR_BOUNDARY\n\n`}
          {`ts=${this.state.ts}\n`}
          {`href=${this.state.href}\n\n`}
          {`error=${this.state.errorText}\n\n`}
          {`componentStack=${this.state.componentStack || "(none)"}\n`}
        </div>
      );
    }

    return this.props.children;
  }
}

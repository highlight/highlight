export function GetBaseURL(): string {
    return (
        import.meta.env.REACT_APP_FRONTEND_URI ||
        window.location.protocol + '//' + window.location.host
    );
}

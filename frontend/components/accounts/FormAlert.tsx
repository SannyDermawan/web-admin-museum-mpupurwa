/** Red box above a form's buttons for an error that comes from the server. */
export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-3.5 rounded-[9px] border border-danger-line bg-danger-bg px-3.5 py-3 text-[13px] leading-normal text-danger"
    >
      {message}
    </div>
  );
}

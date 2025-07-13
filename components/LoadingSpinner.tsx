export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
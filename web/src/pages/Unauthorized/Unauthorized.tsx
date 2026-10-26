export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-red-500">
        403 - Unauthorized
      </h1>
      <p>You don't have permission to access this page.</p>
    </div>
  );
}
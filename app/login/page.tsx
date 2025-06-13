import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const resetSuccess = searchParams.get('reset') === 'success';

{resetSuccess && (
  <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-4">
    Your password has been reset successfully. Please log in with your new password.
  </div>
)} 
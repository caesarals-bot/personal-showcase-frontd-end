import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { motion } from 'framer-motion';

export function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <ChangePasswordForm />
      </motion.div>
    </div>
  );
}
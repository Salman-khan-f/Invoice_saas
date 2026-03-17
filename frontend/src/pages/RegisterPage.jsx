import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await registerUser(data)
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-xl shadow-primary-900/50 mb-4">
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Start managing invoices in minutes</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Your Name</label>
                <input className="input" placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Company Name</label>
                <input className="input" placeholder="Acme Inc."
                  {...register('companyName', { required: 'Company name is required' })} />
                {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@company.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <input className="input" placeholder="+1 234 567 8900"
                {...register('phone')} />
            </div>

            <div>
              <label className="label">Address (optional)</label>
              <input className="input" placeholder="123 Main St, City, Country"
                {...register('address')} />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11"
                  placeholder="Min. 6 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

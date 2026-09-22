'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { User, Mail, ShieldCheck } from 'lucide-react'

interface AccountDetailsProps {
  open: boolean
  onClose: () => void
}

export default function AccountDetails ({ open, onClose }: AccountDetailsProps) {
  const { user } = useAuth()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Account Details'
      description='Your profile and workspace identity'
      size='md'
    >
      <div className="flex flex-col gap-4">
        {/* User identity card */}
        <div className='flex items-center gap-3.5 p-3.5 bg-input-bg/60 border border-card-border rounded-xl'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-card-border bg-[#6E60EE]/10 text-[#6E60EE]'>
            <span className='text-base font-bold uppercase'>
              {user?.name?.charAt(0) || 'P'}
            </span>
          </div>

          <div className='min-w-0 flex-1'>
            <h3 className='truncate text-sm font-semibold text-foreground'>
              {user?.name || 'Prashant'}
            </h3>
            <p className='truncate text-xs text-text-secondary mt-0.5'>
              {user?.email || 'prashant@cloudspacego.app'}
            </p>
          </div>
        </div>

        {/* Account properties list */}
        <div className='flex flex-col divide-y divide-card-border/50 border border-card-border rounded-xl bg-card-bg text-xs'>
          <div className='flex items-center justify-between p-3'>
            <span className='text-text-secondary font-medium'>Display Name</span>
            <span className='text-foreground font-semibold'>{user?.name || 'Prashant'}</span>
          </div>

          <div className='flex items-center justify-between p-3'>
            <span className='text-text-secondary font-medium'>Email Address</span>
            <span className='text-foreground font-semibold break-all'>{user?.email || 'prashant@cloudspacego.app'}</span>
          </div>

          <div className='flex items-center justify-between p-3'>
            <span className='text-text-secondary font-medium'>Role</span>
            <span className='text-foreground font-semibold flex items-center gap-1.5'>
              <ShieldCheck className='w-3.5 h-3.5 text-[#6E60EE]' />
              <span>Workspace Admin</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end pt-2 border-t border-card-border/60'>
          <Button
            type='button'
            variant='primary'
            size='sm'
            onClick={onClose}
            className='h-9 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs'
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

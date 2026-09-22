'use client'

export default function SettingsView () {
  return (
    <div className='bg-card-bg border border-card-border rounded-2xl p-6 text-foreground flex flex-col gap-6 shadow-sm'>
      <div className='flex items-center justify-between border-b border-card-border pb-4 shrink-0 select-none'>
        <h3 className='text-xs font-bold uppercase tracking-[1px] text-text-muted'>
          Application Settings
        </h3>
      </div>

      <div className='flex flex-col gap-4 font-light text-sm text-text-secondary'>
        <div className='flex items-center justify-between p-4 bg-background border border-card-border rounded-xl'>
          <div>
            <div className='text-xs font-bold text-foreground uppercase tracking-[0.5px]'>
              Performance Mode
            </div>
            <div className='text-[11px] text-text-muted mt-1'>
              Accelerates transitions and UI layouts.
            </div>
          </div>
          <div className='w-10 h-6 bg-emerald-500 rounded-full flex items-center p-0.5 justify-end'>
            <div className='w-5 h-5 bg-white rounded-full shadow' />
          </div>
        </div>

        <div className='flex items-center justify-between p-4 bg-background border border-card-border rounded-xl'>
          <div>
            <div className='text-xs font-bold text-foreground uppercase tracking-[0.5px]'>
              High Contrast Outlines
            </div>
            <div className='text-[11px] text-text-muted mt-1'>
              Thicken borders for enhanced visibility.
            </div>
          </div>
          <div className='w-10 h-6 bg-divider rounded-full flex items-center p-0.5 justify-start border border-card-border'>
            <div className='w-5 h-5 bg-white rounded-full shadow' />
          </div>
        </div>
      </div>
    </div>
  )
}

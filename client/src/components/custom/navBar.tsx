import { LogOut } from 'lucide-react'

const NavBar = () => {
  return (
    <div className='w-screen h-12 bg-amber-50 fixed top-0 p-5 z-50'>
        <div className='flex justify-between items-center h-full'>
            <div className='flex items-center'>
                <span className='text-xl font-semibold italic text-black'>
                    WorkSpace
                </span>
            </div>

            <div className='flex gap-5'>
                <div>
                    <span className='text-black text-lg font-semibold italic'>
                        NM
                    </span>
                </div>
                <LogOut/>
            </div>
        </div>
    </div>
  )
}

export default NavBar
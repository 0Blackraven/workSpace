import {motion} from "motion/react"

const BottomBar = () => {
  return (
    <motion.div 
        className='absolute bottom-10 left-1/2 -translate-x-1/2 h-[15dvh] w-lg m-0 p-0 bg-transparent z-30 overflow-hidden' 
        id = "bottomBtns" 
        initial={{ y: '100vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
    >
        <div className="flex h-full w-full justify-between items-center p-3">
            <button className="p-3 rounded-sm text-xl cursor-pointer font-semibold text-black bg-amber-50">
                Voice Call
            </button>
            <button className="p-3 rounded-sm text-xl cursor-pointer font-semibold text-black bg-amber-50">
                Video Call
            </button>
            <button className="p-3 rounded-sm text-xl cursor-pointer font-semibold text-black bg-amber-50">
                Group Call
            </button>
        </div>
    </motion.div>
  )
}

export default BottomBar
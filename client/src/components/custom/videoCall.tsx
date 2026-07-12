import {motion} from "motion/react";

const VideoCallElement = () => {
  return (
    <div className="absolute z-20 top-0 left-0 h-screen w-screen">
        <div className="flex justify-evenly items-center h-[90%] overflow-hidden">
            <motion.div 
                className="h-[55dvh] w-[40dvw] bg-black rounded-xl overflow-hidden"
                initial={{ x: '-100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            >

            </motion.div>
            <motion.div 
                className="h-[55dvh] w-[40dvw] bg-black rounded-xl overflow-hidden"
                initial={{ x: '100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            >

            </motion.div>
        </div>
    </div>
  )
}

export default VideoCallElement
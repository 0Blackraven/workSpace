import {Phone,Video} from "lucide-react"

const Notification = () => {
  return (

    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-2xl w-80 h-64 flex flex-col justify-between py-9 items-center p-6 bg-black/60 backdrop-blur-sm border border-white/10 shadow-2xl space-y-6 overflow-hidden" id="mainBody">

        <div className="">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10 backdrop-blur-md">
              <Video size={12} className="text-white/80" />
              Incoming Video Call
            </span>
        </div>

        <div className="relative flex rounded-3xl w-16 h-16 items-center justify-center border border-white/20 font-bold text-xl text-white bg-black z-10 shadow-inner">
            NM
        </div>

        <div className="flex justify-between w-full px-7">

          <button className="relative flex items-center justify-center w-14 h-14 rounded-full border border-green-500/50 bg-green-600/30 text-white cursor-pointer transition-transform active:scale-95 focus:outline-none">

            <span className="absolute animate-ping h-full w-full rounded-full bg-green-500 opacity-60 duration-1000"></span>
            
            <Phone size={24} className="fill-green-500 stroke-green-500 relative z-10" />
          </button>

          <button className="relative flex items-center justify-center w-14 h-14 rounded-full border border-red-500/50 bg-red-600/30 text-white cursor-pointer transition-transform active:scale-95 focus:outline-none">
            <span className="absolute animate-ping h-full w-full rounded-full bg-red-500 opacity-60 duration-1000"></span>
            
            <Phone size={24} className="fill-red-500 stroke-red-500 rotate-[135deg] relative z-10" />
          </button>
          
        </div>
      </div>
    </div>
  )
}

export default Notification
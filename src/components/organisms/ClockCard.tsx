import Image from "next/image";

import { StatusPill } from "@/components/atoms";
import { TimeStat } from "@/components/molecules";

// "My time" block: 160px grey ring with the elapsed time and a "Clock in" pill, then the shift
// details. Not clocked in yet, so times show "00 : 00". Below sm the details sit under the ring.
export function ClockCard() {
  return (
    <section className="flex w-full flex-col gap-5 p-6 sm:flex-row sm:items-stretch">
      <div className="relative shrink-0 self-start p-2">
        <Image src="/images/clock-ring.svg" width={160} height={160} alt="" />
        <div className="absolute inset-2 flex flex-col items-center justify-center gap-1">
          <span className="type-heading-sm font-medium text-black">00 : 00</span>
          <StatusPill>Clock in</StatusPill>
        </div>
      </div>

      <div className="flex w-full flex-col justify-between gap-4 py-3 sm:w-61.75 sm:gap-0">
        <div className="flex items-center gap-2.5">
          <h2 className="type-paragraph-lg font-medium whitespace-nowrap text-black">My time</h2>
          <StatusPill tone="orange">Not clocked in</StatusPill>
        </div>
        <TimeStat layout="inline" label="Clock-in time" value="00 : 00" muted />
        <div className="flex w-full items-start justify-between">
          <TimeStat label="Scheduled shift" value="8:00 AM – 4:00 PM" />
          <TimeStat label="Break time" value="0h 30m" align="end" />
        </div>
      </div>
    </section>
  );
}

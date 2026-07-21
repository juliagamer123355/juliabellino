import { useEffect, useState } from "react";

function getTimeLeft(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    min: Math.floor((diff / (1000 * 60)) % 60),
    seg: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ target }) {
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "dias", value: time.dias },
    { label: "horas", value: time.horas },
    { label: "minutos", value: time.min },
    { label: "segundos", value: time.seg },
  ];

  return (
    <div className="flex justify-center gap-2 sm:gap-5">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex w-[4.2rem] flex-col items-center gap-1 rounded-md border border-gold/25 bg-burgundy/40 py-4 sm:w-24"
        >
          <span className="font-display text-2xl text-gold-light sm:text-4xl">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="tracked-label text-[0.62rem] text-cream/70">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

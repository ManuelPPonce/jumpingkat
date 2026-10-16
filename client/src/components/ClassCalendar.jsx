import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { formatClassDate, formatTime, todayISO } from "../api";
import { Button } from "./ui";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function shiftMonth(month, delta) {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month) {
  const [year, mon] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(year, mon - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function currentMonthKey() {
  return todayISO().slice(0, 7);
}

export function ClassCalendar({ classes, month, onMonth, selectedId, onSelect, error, onRetry }) {
  const [year, mon] = month.split("-").map(Number);
  const firstWeekday = (new Date(year, mon - 1, 1).getDay() + 6) % 7;
  const dayCount = new Date(year, mon, 0).getDate();
  const today = todayISO();
  const byDate = new Map();
  for (const item of classes) {
    const list = byDate.get(item.classDate) || [];
    list.push(item);
    byDate.set(item.classDate, list);
  }
  const selected = classes.find((item) => item.id === selectedId) || null;
  const activeDate = selected?.classDate || "";
  const dayClasses = byDate.get(activeDate) || [];
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];

  return (
    <div className="rounded-3xl bg-[#181818] p-2">
      <div className="rounded-2xl bg-[#1F1F1F] p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <Button type="button" tone="quiet" size="small" aria-label="Mes anterior" onClick={() => onMonth(shiftMonth(month, -1))} disabled={month <= currentMonthKey()}>
            <CaretLeft size={16} aria-hidden="true" />
          </Button>
          <h3 className="text-base font-semibold">{monthLabel(month)}</h3>
          <Button type="button" tone="quiet" size="small" aria-label="Mes siguiente" onClick={() => onMonth(shiftMonth(month, 1))}>
            <CaretRight size={16} aria-hidden="true" />
          </Button>
        </div>
        {error ? (
          <div className="mt-6">
            <p className="text-sm text-[#FFB4B4]">No pudimos cargar el calendario.</p>
            <Button className="mt-3" type="button" size="small" onClick={onRetry}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[#9B9B9B]">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, index) => {
                if (!day) return <span key={`empty-${index}`} />;
                const iso = `${month}-${String(day).padStart(2, "0")}`;
                const items = byDate.get(iso) || [];
                const past = iso < today;
                const hasOpen = items.some((item) => item.open);
                const selectedDay = iso === activeDate;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={!items.length || past}
                    aria-pressed={selectedDay}
                    onClick={() => onSelect(items.find((item) => item.open)?.id || items[0].id)}
                    className={`ring-focus flex h-10 flex-col items-center justify-center rounded-lg text-sm font-semibold transition-all duration-700 ease-fluid active:scale-[0.98] disabled:cursor-not-allowed ${selectedDay ? "bg-[#D6FF3F] text-black" : hasOpen ? "bg-[#272727] text-white hover:bg-[#313131]" : "bg-transparent text-[#9B9B9B]"}`}
                  >
                    {day}
                    {hasOpen ? <span className={`mt-1 h-2 w-2 rounded-full ${selectedDay ? "bg-black" : "bg-[#D6FF3F]"}`} /> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-3">
              {!activeDate ? <p className="text-sm text-[#9B9B9B]">Elige un día marcado para ver sus clases.</p> : null}
              {activeDate && !dayClasses.length ? <p className="text-sm text-[#9B9B9B]">Este día no hay clase.</p> : null}
              {dayClasses.map((item) => {
                const chosen = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.open}
                    aria-pressed={chosen}
                    onClick={() => onSelect(item.id)}
                    className={`ring-focus rounded-2xl border p-3 text-left transition-all duration-700 ease-fluid active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${chosen ? "border-[#D6FF3F] bg-[#272727]" : "border-[#313131] hover:bg-[#272727]"}`}
                  >
                    <span className="block text-base font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm text-[#9B9B9B]">
                      {formatClassDate(item.classDate)} · {formatTime(item.classTime)}
                    </span>
                    <span className={`mt-2 block text-sm font-semibold ${item.open ? "text-white" : "text-[#9B9B9B]"}`}>
                      {item.state === "pasada" ? "Esta clase ya pasó" : item.open ? `${item.taken} de ${item.capacity} lugares` : "Llena"}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

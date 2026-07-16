export default function Loader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent-violet"
            style={{
              animation: "pulseDot 1.1s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      {label && (
        <span className="font-mono-jb text-[11px] tracking-[0.08em] text-ink-faint">{label}</span>
      )}
    </div>
  )
}

import photo from "../img/img-maestra.png";

export function HeroVisual({ settings }) {
  return (
    <figure>
      <img
        src={photo}
        alt="Instructora de JumpingKat de pie sobre un trampolín en el estudio"
        className="mx-auto max-h-[640px] w-full object-contain"
      />
      <figcaption className="mt-6 text-sm font-semibold text-blue">Tu lugar en el trampolín</figcaption>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Sesión</dt>
          <dd className="font-semibold">Personalizada</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Experiencia</dt>
          <dd className="font-semibold">No hace falta</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted">Pago</dt>
          <dd className="font-semibold">{settings?.classPrice || "Por Zelle"}</dd>
        </div>
        {settings?.location ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Lugar</dt>
            <dd className="text-right font-semibold">{settings.location}</dd>
          </div>
        ) : null}
      </dl>
    </figure>
  );
}

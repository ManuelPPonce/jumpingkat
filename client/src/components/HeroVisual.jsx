import photo from "../img/img-maestra.jpg";

export function HeroVisual({ settings }) {
  return (
    <figure className="rounded-3xl bg-[#181818] p-2">
      <div className="overflow-hidden rounded-2xl bg-[#1F1F1F]">
        <img
          src={photo}
          alt="Instructora de JumpingKat de pie sobre un trampolín en el estudio"
          className="aspect-[3/4] w-full object-cover object-[center_20%]"
        />
        <figcaption className="px-6 py-6 text-sm font-semibold text-[#D6FF3F]">Tu lugar en el trampolín</figcaption>
        <dl className="grid gap-3 px-6 pb-6 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#9B9B9B]">Sesión</dt>
            <dd className="font-semibold">Personalizada</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#9B9B9B]">Experiencia</dt>
            <dd className="font-semibold">No hace falta</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[#9B9B9B]">Pago</dt>
            <dd className="font-semibold">{settings?.classPrice || "Por Zelle"}</dd>
          </div>
          {settings?.location ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[#9B9B9B]">Lugar</dt>
              <dd className="text-right font-semibold">{settings.location}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </figure>
  );
}
